import { sql } from './db.js';
export default sql;

sql`
DROP TABLE IF EXISTS reserva;
`.then( () => {
  console.log('Ação bem sucedida');
})