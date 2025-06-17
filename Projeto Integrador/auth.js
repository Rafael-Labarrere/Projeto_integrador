// auth.js
const API_URL = 'https://projeto-integrador-znob.onrender.com/api';


export async function verificarAutenticacao() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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


