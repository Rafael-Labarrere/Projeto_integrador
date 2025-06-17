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