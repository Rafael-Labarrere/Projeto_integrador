import { sql } from './db.js';
export default sql;

sql`
UPDATE test
SET idade = 26
WHERE nome = 'Ana';
`.then( () => {
  console.log('Ação bem sucedida');
})