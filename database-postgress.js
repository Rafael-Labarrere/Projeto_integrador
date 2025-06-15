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

    async createUsuario(usuario) {
    const { id, nome, email, senha, tipo } = usuario;
    await sql`
        INSERT INTO usuarios (id, nome, email, senha, tipo)
        VALUES (${id}, ${nome}, ${email}, ${senha}, ${tipo})
    `;
    }

    async createReserva(reserva) {
    const { id, usuario_id, sala_id, data, horario } = reserva;
    await sql`
        INSERT INTO reservas (id, usuario_id, sala_id, data, horario)
        VALUES (${id}, ${usuario_id}, ${sala_id}, ${data}, ${horario})
    `;
    }






    async update(id, sala){
        //implementation needed
      
    }

    async delete(id){
        //implementation needed
        
    }
}