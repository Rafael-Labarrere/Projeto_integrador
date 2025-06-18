import { sql } from './db.js';
export default sql;

sql`
ALTER TABLE usuarios ADD COLUMN token TEXT;
`.then(() => {
  console.log('Ação bem sucedida');
})