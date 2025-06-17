function obterIdSalaDaURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sala");
}
// reserva.js
async function reserva() {
  const urlParams = new URLSearchParams(window.location.search);
  const salaId = urlParams.get('sala');

  if (!salaId) {
    alert('Erro: sala não encontrada na URL.');
    return;
  }

  const nome = document.getElementById('nome-reservante').value;
  const ra = document.getElementById('ua').value;
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;

  if (!nome || !ra || !data || !horario) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  try {
    const userData = JSON.parse(localStorage.getItem('usuario'));
if (!userData || !userData.id) {
  alert('Usuário não autenticado. Faça login novamente.');
  window.location.href = 'login.html';
  return;
}


const userId = userData.id;

    const response = await fetch('https://projeto-integrador-znob.onrender.com/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sala_id: salaId,
        usuario_id: userId,
        nome_reservante: nome,
        ra: ra,
        data: data,
        horario: horario
      })
    });

    if (!response.ok) throw new Error('Erro ao fazer a reserva.');

    alert('Reserva realizada com sucesso!');
    window.location.href = 'historico.html'; // redireciona após reserva

  } catch (error) {
    console.error(error);
    alert('Erro ao enviar reserva. Verifique os dados e tente novamente.');
  }
}

async function carregarSala() {
  const urlParams = new URLSearchParams(window.location.search);
  const salaId = urlParams.get('sala');

  if (!salaId) return;

  try {
    const response = await fetch(`https://projeto-integrador-znob.onrender.com/api/salas/${salaId}`);
    const sala = await response.json();

    const titulo = document.querySelector('h2');
    titulo.innerText = `Fazer Reserva - ${sala.nome}`;
  } catch (e) {
    console.error('Erro ao carregar sala:', e);
  }
}

document.addEventListener('DOMContentLoaded', carregarSala);
