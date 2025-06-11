function reserva() {
    // Pegando os valores dos inputs
    const nomeReservante = document.getElementById('nome-reservante').value.trim();
    const ua = document.getElementById('ua').value.trim();
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const tipo = document.getElementById('tipo').value;
    const bloco = document.getElementById('bloco').value;

    // Verifica se todos os campos estão preenchidos
    if (!nomeReservante || !ua || !data || !horario || !tipo || !bloco) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Validação adicional
    if (nomeReservante.length < 2) {
        alert("Por favor, digite um nome válido.");
        return;
    }

    if (ua.length < 1) {
        alert("Por favor, digite um número de UA válido.");
        return;
    }

    // Verifica se a data não é no passado
    const dataReserva = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataReserva < hoje) {
        alert("Não é possível fazer reservas para datas passadas.");
        return;
    }

    // Criando objeto da nova reserva
    const novaReserva = {
        id: Date.now(), // ID único baseado no timestamp
        nomeReservante,
        ua,
        data,
        horario,
        tipo,
        bloco,
        status: 'Pendente',
        dataReserva: new Date().toISOString() // Data em que a reserva foi feita
    };

    // Pegando o array de reservas do localStorage ou criando um novo
    let reservas = [];

    const reservasSalvas = localStorage.getItem('reservaDados');
    if (reservasSalvas) {
        try {
            reservas = JSON.parse(reservasSalvas);
            // Garante que reservas é um array
            if (!Array.isArray(reservas)) {
                reservas = [];
            }
        } catch (e) {
            console.error("Erro ao ler dados do localStorage:", e);
            reservas = [];
        }
    }

    // Adicionando a nova reserva ao array
    reservas.push(novaReserva);

    // Salvando de volta no localStorage
    try {
        localStorage.setItem('reservaDados', JSON.stringify(reservas));
        
        // Alerta de sucesso
        alert("Reserva realizada com sucesso! Você pode visualizar suas reservas na seção 'Minhas Reservas'.");
        
        // Limpa o formulário
        document.getElementById('nome-reservante').value = '';
        document.getElementById('ua').value = '';
        document.getElementById('data').value = '';
        document.getElementById('horario').value = '';
        document.getElementById('tipo').value = '';
        document.getElementById('bloco').value = '';
        
        // Opcional: redirecionar para o histórico
        // window.location.href = 'historico.html';
        
    } catch (e) {
        console.error("Erro ao salvar reserva:", e);
        alert("Erro ao salvar a reserva. Tente novamente.");
    }
}