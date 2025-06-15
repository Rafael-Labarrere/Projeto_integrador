/*
import { randomUUID } from "node:crypto"

export class Memoriabanco{
    #salas = new Map()

    list(){
        return Array.from(this.#salas.entries()).map((salaArray) => {
            const id = salaArray[0]
            const data = salaArray[1]

            return{
                id,
                ...data,
            }
        })
    }

    create(sala){
        const salaId = randomUUID()

        this.#salas.set(salaId, sala)
    }

    update(id, sala){
        this.#salas.set(id, sala)
    }

    delete(id){
        this.#salas.delete(id)
    }
}
    */