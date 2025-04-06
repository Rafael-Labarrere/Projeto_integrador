function reserva() {
    // Pegando os valores dos inputs
    const nomeReservante = document.getElementById('nome-reservante').value;
    const ua = document.getElementById('ua').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const tipo = document.getElementById('tipo').value;
    const bloco = document.getElementById('bloco').value;

    // Verifica se todos os campos estão preenchidos
    if (!nomeReservante || !ua || !data || !horario || !tipo || !bloco) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Criando objeto da nova reserva
    const novaReserva = {
        nomeReservante,
        ua,
        data,
        horario,
        tipo,
        bloco
    };

    // Pegando o array de reservas do localStorage ou criando um novo
    let reservas = [];

    const reservasSalvas = localStorage.getItem('reservaDados');
    if (reservasSalvas) {
        try {
            reservas = JSON.parse(reservasSalvas);
        } catch (e) {
            console.error("Erro ao ler dados do localStorage:", e);
            reservas = [];
        }
    }

    // Adicionando a nova reserva ao array
    reservas.push(novaReserva);

    // Salvando de volta no localStorage
    localStorage.setItem('reservaDados', JSON.stringify(reservas));

    // Alerta de sucesso
    alert("Reserva salva com sucesso!");
}