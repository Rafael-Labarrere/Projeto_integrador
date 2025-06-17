function obterIdSalaDaURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sala");
}

async function reserva() {
  const salaId = obterIdSalaDaURL();

  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuario || !usuario.id) {
    alert('Você precisa estar logado para reservar uma sala.');
    window.location.href = 'login.html';
    return;
  }

  const nome = document.getElementById('nome-reservante').value;
  const ra = document.getElementById('ua').value;
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;

  if (!nome || !ra || !data || !horario) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch('https://projeto-integrador-znob.onrender.com/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario_id: usuario.id,
        sala_id: salaId,
        data: data,
        horario: horario,
        ra: ra,
        nome_reservante: nome
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao reservar a sala');
    }

    // Atualizar status da sala no front-end imediatamente
    const salas = JSON.parse(localStorage.getItem('salas') || []);
    const salaIndex = salas.findIndex(s => s.id === salaId);
    if (salaIndex !== -1) {
      salas[salaIndex].disponivel = false;
      localStorage.setItem('salas', JSON.stringify(salas));
    }

    alert('Reserva realizada com sucesso!');
    window.location.href = 'historico.html';
  } catch (err) {
    console.error(err);
    alert('Erro ao fazer reserva: ' + err.message);
  }
}