import { fastify } from "fastify";
import cors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import { DatabasePostgres } from "./database-postgress.js";
import crypto from 'crypto';
import { sql } from "./db.js"; // se você usa esse método no login e reservas

const server = fastify();
const database = new DatabasePostgres();

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
    SELECT * FROM usuarios WHERE email = ${email} AND senha = ${senha}
  `;

  if (result.length === 0) {
    return reply.status(401).send({ error: 'Credenciais inválidas' });
  }

  const usuario = result[0];
  return reply.send({ message: 'Login bem-sucedido', usuarioId: usuario.id });
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

// POST: criar para reservas
server.post('/api/reservas', async (request, reply) => {
  const { usuario_id, sala_id, data, horario, ra, nome_reservante } = request.body;

  try {
    // 1. Verificar se a sala está disponível
    const sala = await sql`SELECT disponivel FROM salas WHERE id = ${sala_id}`;
    if (!sala[0] || !sala[0].disponivel) {
      return reply.status(400).send({ error: 'Sala não disponível' });
    }

    // 2. Criar a reserva
    await sql`
      INSERT INTO reservas (id, usuario_id, sala_id, data, horario, ra, nome_reservante)
      VALUES (gen_random_uuid(), ${usuario_id}, ${sala_id}, ${data}, ${horario}, ${ra}, ${nome_reservante})
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

// Iniciar servidor
server.listen({
  host: '0.0.0.0',
  port: process.env.PORT || 4321,
});
