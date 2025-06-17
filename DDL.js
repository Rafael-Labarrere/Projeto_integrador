import { sql } from './db.js';
export default sql;

sql`
ALTER TABLE reservas
ADD COLUMN ra TEXT,
ADD COLUMN nome_reservante TEXT;

`.then(() => {
  console.log('Ação bem sucedida');
})