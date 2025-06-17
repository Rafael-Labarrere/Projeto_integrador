
// Função para filtrar salas
function filtrarSalas() {
    const filtro = document.getElementById('filtro').value;
    const salas = document.querySelectorAll('#salas-lista li');
    
    salas.forEach(sala => {
        const tipo = sala.getAttribute('data-tipo') || 'sala_aula';
        if (filtro === 'todas' || tipo === filtro) {
            sala.style.display = 'block';
        } else {
            sala.style.display = 'none';
        }
    });
}
// Função para exibir detalhes da sala
  import { verificarAutenticacao, atualizarEstadoLogin } from './auth.js';
  
  document.addEventListener('DOMContentLoaded', async () => {
    await verificarAutenticacao();
    atualizarEstadoLogin();
  });

// Função para fazer reserva
function fazerReserva(event) {
    event.preventDefault();
    
    const sala = document.getElementById('sala').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    
    if (!sala || !data || !horario) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Simular envio para o servidor
    alert(`Reserva confirmada para:\nSala: ${sala}\nData: ${data}\nHorário: ${horario}`);
    document.getElementById('form-reserva').reset();
}

// Função para cancelar reserva
function cancelarReserva(reservaId) {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
        // Simular cancelamento
        const reserva = document.getElementById(`reserva-${reservaId}`);
        if (reserva) {
            reserva.remove();
            alert('Reserva cancelada com sucesso!');
        }
    }
}

// Login simulation
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validação simples
    if (email && password) {
        // Redirecionar para página logada
        window.location.href = 'loggedin.html';
    } else {
        document.getElementById('error-message').textContent = 'Por favor, preencha todos os campos!';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está na página de login
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    }
    
    // Verificar se está na página de reserva
    if (document.getElementById('form-reserva')) {
        document.getElementById('form-reserva').addEventListener('submit', fazerReserva);
    }
    
    // Menu hambúrguer para usuário logado
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', function() {
            dropdownMenu.classList.toggle('show');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.user-menu')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // Logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
        });
    }
});

// Funções para as páginas do menu hambúrguer

// Perfil Page
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está na página de perfil
    if (document.getElementById('profile-form')) {
        document.getElementById('profile-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Perfil atualizado com sucesso!');
            // Aqui você adicionaria o código para salvar as alterações
        });
    }

    // Minhas Reservas Page
    if (document.querySelector('.reservations-tabs')) {
        function filterReservations(filter) {
            document.querySelectorAll('.reservations-list').forEach(list => {
                list.classList.add('hidden');
            });
            document.getElementById(filter).classList.remove('hidden');
            
            // Atualizar tabs ativas
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
        
        window.filterReservations = filterReservations;
    }

    // Mensagens Page
    if (document.querySelector('.messages-tabs')) {
        function filterMessages(filter) {
            document.querySelectorAll('.messages-list').forEach(list => {
                list.classList.add('hidden');
            });
            document.getElementById(filter).classList.remove('hidden');
            
            // Atualizar tabs ativas
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
        
        function showNewMessageForm() {
            document.getElementById('message-form').classList.remove('hidden');
            document.querySelector('.new-message-btn').classList.add('hidden');
        }
        
        function hideNewMessageForm() {
            document.getElementById('message-form').classList.add('hidden');
            document.querySelector('.new-message-btn').classList.remove('hidden');
            document.getElementById('message-form').reset();
        }
        
        window.filterMessages = filterMessages;
        window.showNewMessageForm = showNewMessageForm;
        window.hideNewMessageForm = hideNewMessageForm;
        
        // Enviar mensagem
        document.getElementById('message-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mensagem enviada com sucesso!');
            hideNewMessageForm();
        });
    }

    // Configurações Page
    if (document.querySelector('.settings-tabs')) {
        function showSettingsTab(tab) {
            document.querySelectorAll('.settings-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(tab).classList.remove('hidden');
            
            // Atualizar tabs ativas
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }
        
        function confirmAccountDeletion() {
            if (confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
                alert('Sua conta será excluída. Você será redirecionado para a página inicial.');
                // Aqui você adicionaria o código para deletar a conta
                window.location.href = 'inicio.html';
            }
        }
        
        window.showSettingsTab = showSettingsTab;
        window.confirmAccountDeletion = confirmAccountDeletion;
    }
});

// Função para inicializar a página
async function initPage() {
  // Verificar autenticação
  await verificarAutenticacao();
  
  // Atualizar estado do login/logout
  atualizarEstadoLogin();
  
  // ... resto do seu código de inicialização ...
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initPage);

// Adicione logout também como função global se necessário
window.logout = logout;