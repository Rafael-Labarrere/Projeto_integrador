import { sql } from './db.js';
export default sql;

sql`
UPDATE salas
SET tipo = 'Sala de Reuniões',
nome = 'Sala de Reuniões 3',
bloco = 'Bloco 1'
WHERE id = 4
`.then( () => {
  console.log('Ação bem sucedida');
})