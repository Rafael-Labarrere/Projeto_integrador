import { sql } from './db.js';
export default sql;



sql`
CREATE TABLE salas (
  id          TEXT PRIMARY KEY, 
  numero      INTEGER, 
  descricao   TEXT, 
  capacidade  INTEGER
);
`.then( () => {
  console.log('Ação bem sucedida');
})
  