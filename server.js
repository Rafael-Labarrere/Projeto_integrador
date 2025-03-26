import { createServer } from 'node:http'

const server = createServer((request, response) => {
    response.write('Hello world')

    return response.end()
})

server.listen(4321)
