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
  console.log('Ação bem sucedida');
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
  console.log('Ação bem sucedida');
})


