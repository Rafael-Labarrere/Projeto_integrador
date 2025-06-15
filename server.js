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

// GET: Reservas por usuário
server.get('/usuarios/:id/reservas', async (request, reply) => {
  const usuarioId = request.params.id;

  const reservas = await sql`
    SELECT r.*, s.numero AS sala_numero
    FROM reservas r
    JOIN salas s ON r.sala_id = s.id
    WHERE r.usuario_id = ${usuarioId}
  `;

  return reply.send(reservas);
});

// Iniciar servidor
server.listen({
  host: '0.0.0.0',
  port: process.env.PORT || 4321,
});
