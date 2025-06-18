import { fastify } from "fastify";
import cors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import { DatabasePostgres } from "./database-postgress.js";
import crypto from 'crypto';
import { sql } from "./db.js"; // se você usa esse método no login e reservas
import 'dotenv/config'; // Importa e carrega as variáveis do .env
import jwt from 'jsonwebtoken';


// WT_SECRET será lido do seu arquivo .env
const JWT_SECRET = process.env.JWT_SECRET; 
// Verifica se a chave secreta JWT está definida no ambiente
if (!JWT_SECRET) {
  console.error('Erro: JWT_SECRET não definido no ambiente!');
  process.exit(1); // Encerra o aplicativo se a chave secreta crucial não estiver presente
}

//remover
const server = fastify();
const database = new DatabasePostgres();
// Middleware/Hook para autenticação de token JWT
const authenticate = async (request, reply) => {
  const { authorization } = request.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Não autorizado: Token não fornecido ou formato inválido' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Anexa o ID do usuário decodificado ao objeto request para uso posterior
    request.userId = decoded.id; // Isso fará com que o ID do usuário autenticado esteja disponível em request.userId
  } catch (err) {
    console.error("Erro na autenticação (preHandler):", err);
    // Captura erros como JsonWebTokenError (token inválido) ou TokenExpiredError (token expirado)
    return reply.status(401).send({ error: 'Não autorizado: Token inválido ou expirado' });
  }
};

// Plugins (ordem correta e depois que server foi criado)
await server.register(cors, {
  origin: '*'
});

await server.register(fastifyFormbody);

// Esse parser ajuda o Fastify a entender o JSON (pode ser opcional se `formbody` já estiver funcionando)
server.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body);
    done(null, json);
  } catch (err) {
    done(err, undefined);
  }
});

// POST: Criar usuário
server.post('/usuarios', async (request, reply) => {
  const { nome, email, senha, tipo } = request.body;

  const id = crypto.randomUUID();
  const senhaCriptografada = senha; // Use bcrypt futuramente

  try {
    await database.createUsuario({ id, nome, email, senha: senhaCriptografada, tipo });
    return reply.status(201).send({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error(error);
    return reply.status(400).send({ error: 'Erro ao cadastrar usuário' });
  }
});


// POST: Login
server.post('/login', async (request, reply) => {
  const { email, senha } = request.body;

  const result = await sql`
    SELECT id, nome, email, tipo FROM usuarios WHERE email = ${email} AND senha = ${senha}
  `;

  if (result.length === 0) {
    return reply.status(401).send({ error: 'Credenciais inválidas' });
  }

  const usuario = result[0];

  // 1. Gerar TOKEN JWT
  const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, { expiresIn: '1h' }); // Token válido por 1 hora

  // 2. Opcional: Armazenar o token no banco de dados (útil para invalidar tokens em logout ou mudança de senha)
  // Você já tem uma coluna 'token' na sua tabela 'usuarios'.
  // Garanta que esta coluna seja TEXT ou VARCHAR suficiente para o token JWT.
  await sql`
    UPDATE usuarios SET token = ${token} WHERE id = ${usuario.id}
  `;

  // 3. Retornar o token e os dados do usuário (exceto a senha)
  return reply.send({ message: 'Login bem-sucedido', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, token: token } });
});


// Endpoint de verificação de sessão
server.post('/verificar-sessao', async (request, reply) => {
  const { authorization } = request.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token não fornecido ou formato inválido' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Valida o token com a chave secreta

    // Opcional: verificar se o token ainda existe no banco de dados (para tokens revogados)
    const result = await sql`
      SELECT id FROM usuarios WHERE id = ${decoded.id} AND token = ${token}
    `;

    if (result.length === 0) {
      return reply.status(401).send({ error: 'Sessão inválida ou token revogado' });
    }

    // Você pode adicionar o ID do usuário decodificado ao request para uso posterior, se necessário
    request.userId = decoded.id;
    return reply.send({ valid: true, userId: decoded.id });
  } catch (error) {
    console.error("Erro na verificação de sessão:", error);
    // Erros comuns aqui: TokenExpiredError, JsonWebTokenError (token malformado)
    return reply.status(401).send({ error: 'Sessão inválida ou expirada' });
  }
});

// POST: Criar reserva
server.post('/reservas', async (request, reply) => {
  const { usuario_id, sala_id, data, horario } = request.body;
  const id = crypto.randomUUID();

  try {
    await database.createReserva({ id, usuario_id, sala_id, data, horario });
    return reply.status(201).send({ message: 'Reserva criada com sucesso' });
  } catch (error) {
    return reply.status(400).send({ error: 'Erro ao criar reserva' });
  }
});


// GET: Listar salas disponíveis
server.get('/api/salas', async (request, reply) => {
  try {
    const salas = await sql`SELECT * FROM salas WHERE disponivel = true`;
    return reply.send(salas);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar salas' });
  }
});

// POST: Criar reserva
// Aplica o hook 'authenticate' antes de processar a requisição
server.post('/api/reservas', { preHandler: [authenticate] }, async (request, reply) => {
  // O usuario_id agora vem do token autenticado, não do corpo da requisição.
  const usuario_id_autenticado = request.userId;

  // Os demais dados da reserva vêm do corpo da requisição
  const { sala_id, data, horario, ra, nome_reservante } = request.body;

  try {
    // 1. Verificar se a sala está disponível
    const sala = await sql`SELECT disponivel FROM salas WHERE id = ${sala_id}`;
    if (!sala[0] || !sala[0].disponivel) {
      return reply.status(400).send({ error: 'Sala não disponível' });
    }

    // 2. Criar a reserva usando o ID do usuário autenticado pelo token
    await sql`
      INSERT INTO reservas (id, usuario_id, sala_id, data, horario, ra, nome_reservante)
      VALUES (gen_random_uuid(), ${usuario_id_autenticado}, ${sala_id}, ${data}, ${horario}, ${ra}, ${nome_reservante})
    `;

    // 3. Atualizar status da sala para indisponível
    await sql`
      UPDATE salas SET disponivel = false WHERE id = ${sala_id}
    `;

    reply.send({ message: 'Reserva criada com sucesso' });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Erro ao criar reserva' });
  }
});

// GET: Listar reservas por usuário
server.get('/api/reservas/usuario/:usuario_id', async (request, reply) => {
  const { usuario_id } = request.params;

  try {
    const reservas = await sql`
      SELECT r.*, s.nome as sala_nome, s.bloco, s.tipo 
      FROM reservas r
      JOIN salas s ON r.sala_id = s.id
      WHERE r.usuario_id = ${usuario_id}
      ORDER BY r.data_reserva DESC
    `;
    return reply.send(reservas);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar reservas' });
  }
});

// POST: Logout
server.post('/logout', { preHandler: [authenticate] }, async (request, reply) => {
  // O userId já está anexado ao request pelo `authenticate` preHandler
  const userIdToLogout = request.userId;

  try {
    await sql`
      UPDATE usuarios SET token = null
      WHERE id = ${userIdToLogout}
    `;

    return reply.send({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao fazer logout ou token inválido' });
  }
});


// DELETE: Cancelar reserva
server.delete('/api/reservas/:id', { preHandler: [authenticate] }, async (request, reply) => { // ADDED PREHANDLER
  const { id } = request.params;
  const userIdToLogout = request.userId; // User ID from authenticated token

  try {
    // Obter a reserva para pegar o sala_id e o usuario_id
    const reserva = await sql`SELECT sala_id, usuario_id FROM reservas WHERE id = ${id}`;
    if (reserva.length === 0) {
      return reply.code(404).send({ erro: 'Reserva não encontrada' });
    }

    const salaId = reserva[0].sala_id;
    const reservaOwnerId = reserva[0].usuario_id;

    // **Security Check:** Ensure the authenticated user owns this reservation
    if (reservaOwnerId !== userIdToLogout) {
        return reply.status(403).send({ erro: 'Você não tem permissão para cancelar esta reserva.' });
    }

    // Deletar a reserva
    await sql`DELETE FROM reservas WHERE id = ${id}`;

    // Atualizar disponibilidade da sala
    await sql`
      UPDATE salas
      SET disponivel = true
      WHERE id = ${salaId}
    `;

    reply.send({ mensagem: 'Reserva cancelada com sucesso.' });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ erro: 'Erro ao cancelar reserva.' });
  }
});


// Iniciar servidor
server.listen({
  host: '0.0.0.0',
  port: process.env.PORT || 4321,
});
