function obterIdSalaDaURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sala");
}

// Função para fazer a reserva
async function reserva() {
  const salaId = obterIdSalaDaURL();

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
    const userDataString = localStorage.getItem('usuarioLogado');
    if (!userDataString || userDataString === "undefined") {
      alert('Usuário não autenticado. Faça login novamente.');
      window.location.href = 'login.html';
      return;
    }
    
    const userData = JSON.parse(userDataString);

    if (!userData.id || !userData.token) {
      alert('Usuário não autenticado. Faça login novamente.');
      window.location.href = 'login.html';
      return;
    }

    const userId = userData.id;
    const token = userData.token;

    const response = await fetch('https://projeto-integrador-znob.onrender.com/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

    if (!response.ok) {
      const erroMsg = await response.text();
      throw new Error(`Erro ao fazer a reserva: ${erroMsg}`);
    }

    alert('Reserva realizada com sucesso!');
    window.location.href = 'historico.html';

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Função para carregar dados da sala na página
async function carregarSala() {
  const salaId = obterIdSalaDaURL();

  if (!salaId) return;

  try {
    const response = await fetch(`https://projeto-integrador-znob.onrender.com/api/salas/${salaId}`);
    if (!response.ok) {
      throw new Error('Erro ao carregar dados da sala.');
    }
    const sala = await response.json();

    const titulo = document.querySelector('h2');
    if (titulo) {
      titulo.innerText = `Fazer Reserva - ${sala.nome}`;
    }
  } catch (e) {
    console.error('Erro ao carregar sala:', e);
  }
}

document.addEventListener('DOMContentLoaded', carregarSala);
