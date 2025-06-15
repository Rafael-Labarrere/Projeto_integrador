
import {fastify} from "fastify"
//import { Memoriabanco } from "./banco-memoria.js"
import { DatabasePostgres } from "./database-postgress.js"
//const database = new Memoriabanco()
const server = fastify()

const database = new DatabasePostgres()


//post para usuarios
server.post('/usuarios', async (request, reply) => {
  const { nome, email, senha, tipo } = request.body; 

  const id = crypto.randomUUID();
  const senhaCriptografada = senha; // depois você pode usar bcrypt aqui

  try {
    await database.createUsuario({ id, nome, email, senha: senhaCriptografada, tipo });
    return reply.status(201).send({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    return reply.status(400).send({ error: 'Erro ao cadastrar usuário' });
  }
});

//post login
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

//post para reservas
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

//consulta todas as reservas
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



server.listen({
    host: '0.0.0.0',
    port: process.env.PORT || 4321,
})