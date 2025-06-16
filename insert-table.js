import { sql } from './db.js';
export default sql;

/*
sql`
INSERT INTO salas (nome, bloco, tipo, capacidade, recursos, disponivel) VALUES
('Sala 101', 'Bloco 1', 'Sala de Aula', 30, 'Projetor, Ar Condicionado', true),
('Sala 102', 'Bloco 1', 'Sala de Aula', 30, 'Projetor, Ar Condicionado', true),
('Sala 103', 'Bloco 1', 'Sala de Aula', 30, 'Projetor, Ar Condicionado', true),
('Sala 104', 'Bloco 1', 'Sala de Aula', 30, 'Projetor, Ar Condicionado', true),
('Sala 105', 'Bloco 1', 'Sala de Aula', 30, 'Projetor, Ar Condicionado', true),
('Laboratório de Informática 1', 'Bloco 2', 'Laboratório de Informática', 20, 'Computadores, Projetor, Ar Condicionado', true),
('Laboratório de Informática 2', 'Bloco 2', 'Laboratório de Informática', 20, 'Computadores, Projetor, Ar Condicionado', true),
('Auditório Principal', 'Bloco 3', 'Auditório', 100, 'Microfone, Projetor, Sistema de Som, Ar Condicionado', true),
('Sala de Reuniões 1', 'Bloco 4', 'Sala de Reuniões', 15, 'Televisão, Videoconferência, Ar Condicionado', true),
('Sala de Reuniões 2', 'Bloco 4', 'Sala de Reuniões', 15, 'Televisão, Videoconferência, Ar Condicionado', true);
`.then( () => {
  console.log('Ação bem sucedida');
})
*/