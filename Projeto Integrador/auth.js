// auth.js
export async function verificarAutenticacao() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  // Verifica se o token/usuário existe e não está expirado
  if (!usuario || !usuario.id) {
    if (!window.location.href.includes('login.html')) {
      alert('Você precisa fazer login para acessar esta página');
      window.location.href = 'login.html';
    }
    return false;
  }
  
  // Verificação adicional com a API 
  try {
    const response = await fetch(`${API_URL}/verificar-sessao`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${usuario.token}`
      }
    });
    
    if (!response.ok) {
      localStorage.removeItem('usuarioLogado');
      window.location.reload();
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
  }
  
  return true;
}

//menu de navegação
export function atualizarEstadoLogin() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const loginItem = document.querySelector('.login');
  
  if (!loginItem) return;
  
  if (usuario && usuario.id) {
    loginItem.innerHTML = `
      <a href="#" id="logout-link">Sair (${usuario.nome})</a>
    `;
    
    document.getElementById('logout-link').addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = 'login.html';
    });
  } else {
    loginItem.innerHTML = `
      <a href="login.html">Entrar</a>
    `;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  atualizarEstadoLogin();
  
  // Verificar autenticação em páginas protegidas
  const paginasProtegidas = [
    'reservar.html', 
    'historico.html',
    'cancelar.html',
    'loggedin.html'
  ];
  
  const paginaAtual = window.location.pathname.split('/').pop();
  if (paginasProtegidas.includes(paginaAtual)) {
    verificarAutenticacao();
  }
});
// Função para fazer logout
export function logout() {
  // Remover dados do usuário do localStorage
  localStorage.removeItem('usuarioLogado');
  
  // Redirecionar para a página de login
  window.location.href = 'login.html';
}

// Função para atualizar o estado do login/logout
export function atualizarEstadoLogin() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  const loginItem = document.querySelector('.login');
  
  if (!loginItem) return;
  
  if (usuario && usuario.id) {
    loginItem.innerHTML = `
      <a href="#" id="logout-link">Sair (${usuario.nome})</a>
    `;
    
    // Adicionar evento de logout
    document.getElementById('logout-link').addEventListener('click', (e) => {
      e.preventDefault();
      logout(); // Chamar função de logout
    });
  } else {
    loginItem.innerHTML = `
      <a href="login.html">Entrar</a>
    `;
  }
}
// auth.js
const API_URL = "https://projeto-integrador-znob.onrender.com";

export async function logout() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
  
  // Limpar token no servidor
  if (usuario && usuario.id) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
  
  // Remover dados locais
  localStorage.removeItem('usuarioLogado');
  
  // Redirecionar para login
  window.location.href = 'login.html';
}