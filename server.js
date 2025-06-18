import { fastify } from "fastify";
import cors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import { DatabasePostgres } from "./database-postgress.js";
import crypto from 'crypto';
import { sql } from "./db.js";
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('Erro: JWT_SECRET não definido no ambiente!');
  process.exit(1);
}

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
    request.userId = decoded.id; // Anexa o ID do usuário decodificado ao objeto request
  } catch (err) {
    console.error("Erro na autenticação (preHandler):", err);
    return reply.status(401).send({ error: 'Não autorizado: Token inválido ou expirado' });
  }
};

// Plugins
await server.register(cors, {
  origin: '*'
});
await server.register(fastifyFormbody);

server.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body);
    done(null, json);
  } catch (err) {
    done(err, undefined);
  }
});

// POST: Criar usuário (sem JWT, é uma rota pública)
server.post('/usuarios', async (request, reply) => {
  const { nome, email, senha, tipo } = request.body;
  const id = crypto.randomUUID();
  const senhaCriptografada = senha; // Considerar bcrypt futuramente

  try {
    await database.createUsuario({ id, nome, email, senha: senhaCriptografada, tipo });
    return reply.status(201).send({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error(error);
    return reply.status(400).send({ error: 'Erro ao cadastrar usuário' });
  }
});

// POST: Login (gera JWT)
server.post('/login', async (request, reply) => {
  const { email, senha } = request.body;

  const result = await sql`
    SELECT id, nome, email, tipo FROM usuarios WHERE email = ${email} AND senha = ${senha}
  `;

  if (result.length === 0) {
    return reply.status(401).send({ error: 'Credenciais inválidas' });
  }

  const usuario = result[0];
  const token = jwt.sign({ id: usuario.id, email: usuario.email, tipo: usuario.tipo }, JWT_SECRET, { expiresIn: '1h' });

  await sql`
    UPDATE usuarios SET token = ${token} WHERE id = ${usuario.id}
  `;

  return reply.send({ message: 'Login bem-sucedido', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo, token: token } });
});

// Endpoint de verificação de sessão (protegida com JWT)
server.post('/verificar-sessao', async (request, reply) => {
  const { authorization } = request.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token não fornecido ou formato inválido' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await sql`
      SELECT id FROM usuarios WHERE id = ${decoded.id} AND token = ${token}
    `;

    if (result.length === 0) {
      return reply.status(401).send({ error: 'Sessão inválida ou token revogado' });
    }

    request.userId = decoded.id;
    return reply.send({ valid: true, userId: decoded.id });
  } catch (error) {
    console.error("Erro na verificação de sessão:", error);
    return reply.status(401).send({ error: 'Sessão inválida ou expirada' });
  }
});

// GET: Listar salas disponíveis (pode ser pública ou protegida, dependendo da sua necessidade)
server.get('/api/salas', async (request, reply) => {
  try {
    const salas = await sql`SELECT * FROM salas WHERE disponivel = true`;
    return reply.send(salas);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar salas' });
  }
});

// POST: Criar reserva (PROTEGIDA com JWT)
// Esta é a rota **única e correta** para criar reservas
server.post('/api/reservas', { preHandler: [authenticate] }, async (request, reply) => {
  const usuario_id_autenticado = request.userId; // ID do usuário do token
  const { sala_id, data, horario, ra, nome_reservante } = request.body;

  try {
    const sala = await sql`SELECT disponivel FROM salas WHERE id = ${sala_id}`;
    if (!sala[0] || !sala[0].disponivel) {
      return reply.status(400).send({ error: 'Sala não disponível' });
    }

    await sql`
      INSERT INTO reservas (id, usuario_id, sala_id, data, horario, ra, nome_reservante)
      VALUES (gen_random_uuid(), ${usuario_id_autenticado}, ${sala_id}, ${data}, ${horario}, ${ra}, ${nome_reservante})
    `;

    await sql`
      UPDATE salas SET disponivel = false WHERE id = ${sala_id}
    `;

    reply.status(201).send({ message: 'Reserva criada com sucesso' });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Erro ao criar reserva' });
  }
});

// GET: Listar reservas por usuário (PROTEGIDA com JWT)
server.get('/api/reservas/usuario/:usuario_id', { preHandler: [authenticate] }, async (request, reply) => {
  const { usuario_id } = request.params;
  // VERIFICAÇÃO DE AUTORIZAÇÃO: Garante que o usuário só possa ver as próprias reservas
  if (request.userId !== usuario_id) {
    return reply.status(403).send({ error: 'Acesso negado: Você só pode ver suas próprias reservas.' });
  }

  try {
    const reservas = await sql`
      SELECT r.*, s.nome as sala_nome, s.bloco, s.tipo
      FROM reservas r
      JOIN salas s ON r.sala_id = s.id
      WHERE r.usuario_id = ${usuario_id}
      ORDER BY r.data DESC, r.horario DESC -- Assumindo 'data' e 'horario' são os nomes das colunas
    `;
    return reply.send(reservas);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar reservas' });
  }
});

// POST: Logout (PROTEGIDA com JWT)
server.post('/logout', { preHandler: [authenticate] }, async (request, reply) => {
  const userIdToLogout = request.userId; // ID do usuário do token

  try {
    await sql`
      UPDATE usuarios SET token = null WHERE id = ${userIdToLogout}
    `;
    return reply.send({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao fazer logout ou token inválido' });
  }
});

// PATCH: Cancelar uma reserva existente (PROTEGIDA com JWT)
server.patch('/api/reservas/:id/cancelar', { preHandler: [authenticate] }, async (request, reply) => {
  const { id } = request.params; // ID da reserva a ser cancelada
  const userIdAuth = request.userId; // ID do usuário logado (do token)

  try {
    // 1. Verificar se a reserva existe e pertence ao usuário logado
    const reservaExistente = await sql`
      SELECT usuario_id, sala_id, status FROM reservas WHERE id = ${id}
    `;

    if (reservaExistente.length === 0) {
      return reply.status(404).send({ error: 'Reserva não encontrada.' });
    }

    const reserva = reservaExistente[0];

    // Garante que apenas o proprietário da reserva pode cancelá-la
    if (reserva.usuario_id !== userIdAuth) {
      return reply.status(403).send({ error: 'Você não tem permissão para cancelar esta reserva.' });
    }

    // Evita cancelar reservas já canceladas ou rejeitadas
    if (reserva.status === 'Cancelado' || reserva.status === 'Rejeitado') { // Corrigido para "Cancelado" com 'C' maiúsculo se for o caso
      return reply.status(400).send({ error: 'Esta reserva já está cancelada ou rejeitada.' });
    }

    // 2. Atualizar o status da reserva para 'Cancelado'
    await sql`
      UPDATE reservas SET status = 'Cancelado' WHERE id = ${id}
    `;

    // 3. (Opcional) Liberar a sala novamente se estava ocupada por esta reserva
    await sql`
      UPDATE salas SET disponivel = true WHERE id = ${reserva.sala_id}
    `;

    return reply.send({ message: 'Reserva cancelada com sucesso!' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    return reply.status(500).send({ error: 'Erro interno ao cancelar reserva.' });
  }
});

// Iniciar servidor
server.listen({
  host: '0.0.0.0',
  port: process.env.PORT || 4321,
});