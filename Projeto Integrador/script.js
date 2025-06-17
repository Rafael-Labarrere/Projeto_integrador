
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