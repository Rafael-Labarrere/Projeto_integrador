
import {fastify} from "fastify"
//import { Memoriabanco } from "./banco-memoria.js"
import { DatabasePostgres } from "./database-postgress.js"
//const database = new Memoriabanco()
const server = fastify()

const database = new DatabasePostgres()

server.post('/salas' , async (request, reply) => {
    const {numero, descricao, capacidade} = request.body

    console.log(request.body)


    await database.create({
        numero: numero,
        descricao: descricao,
        capacidade: capacidade,
    })

    return reply.status(201).send()
})

server.get('/salas', async (request, reply) => {
    const search = request.query.search;

    const salas = await database.list();

    return salas; // or reply.send(salas)
});


server.put('/salas/:id' , async (request, reply) => {
  const salaId = request.params.id
  const {numero, descricao, capacidade} = request.body

  await database.update(salaId, {
    numero: numero,
    descricao: descricao,
    capacidade: capacidade,
  })

  return reply.status(204).send()
})

server.delete('/salas/:id' , async (request, reply) => {
    const salaId = request.params.id
    
    await database.delete(salaId)

    return reply.status(204).send()    
})

server.listen({
    port: 4321,
})