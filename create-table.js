import { sql } from './db.js';
export default sql;

sql`
CREATE TABLE if not exists reservas (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  sala_id UUID NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status TEXT DEFAULT 'Pendente',
  data_reserva TIMESTAMP DEFAULT NOW()
);
`.then( () => {
  console.log('Tabela reservas criada com sucesso');
})
  

sql`
CREATE TABLE if not exists usuarios (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data_cadastro TIMESTAMP DEFAULT NOW()
);

`.then( () => {
  console.log('Tabela usuarios criada com sucesso');
})

sql`
  CREATE TABLE if not exists salas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    bloco VARCHAR(20) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    capacidade INT,
    recursos TEXT,
    disponivel BOOLEAN DEFAULT TRUE
  );
`.then( () => {
  console.log('Tabela salas criada com sucesso');
})
