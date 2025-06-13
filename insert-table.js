import { sql } from './db.js';
export default sql;

sql`
INSERT INTO test (nome, idade, RA)
VALUES
  ('Ana', 25, 123456),
  ('Bruno', 30, 789012),
  ('Carla', 22, 345678);
`.then( () => {
  console.log('Ação bem sucedida');
})