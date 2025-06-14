import { randomUUID } from "node:crypto"
import { sql } from './db.js';
export default sql;

export class DatabasePostgres {
    async list(search){
        let salas

        if (search) {
            salas = await sql`
            SELECT * FROM salas WHERE numero ilike ${'%' + search + '%'}
            `
        } else {
            salas = await sql`
            SELECT * FROM salas
            `
        }

        return salas
    }

    async create(sala){
        const salaId = randomUUID()
        const { numero, descricao, capacidade } = sala

        await sql`
        INSERT INTO salas (id, numero, descricao, capacidade) VALUES (${salaId}, ${numero}, ${descricao}, ${capacidade})
        `
    }

    async update(id, sala){
        //implementation needed
        const { numero, descricao, capacidade } = sala
        await sql`
        UPDATE salas SET numero = ${numero}, descricao = ${descricao}, capacidade = ${capacidade} WHERE id = ${id}
        `
    }

    async delete(id){
        //implementation needed
        const salaId = id
        await sql`
        DELETE FROM salas WHERE id = ${salaId}
        `
    }
}