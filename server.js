/*    import { createServer } from 'node:http'

    const server = createServer((request, response) => {
        response.write('Hello world!')

        return response.end()
    })

    server.listen(4321)
    */

import {fastify} from "fastify"

const server = fastify()

server.get('/' , () => {
    return 'Hello World!'}
)

server.get('/pt' , () => {
    return 'Olá Mundo!'}
)

server.get('/fr' , () => {
    return 'Bonjour le monde!'}
)

server.listen({
    port: 4321,
})
