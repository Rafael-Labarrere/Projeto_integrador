// auth.js
const API_URL = 'https://projeto-integrador-znob.onrender.com'; // A URL base do seu backend

export async function verificarAutenticacao() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado')); 

  if (!usuario || !usuario.id || !usuario.token) { // Verifique se o token existe também
    if (!window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) { // Adicione 'cadastro.html' se existir
      alert('Você precisa fazer login para acessar esta página');
      window.location.href = 'login.html';
    }
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/verificar-sessao`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${usuario.token}`
      }
    });
    
    if (!response.ok) {
      localStorage.removeItem('usuarioLogado');
      // Não recarregue a página se for redirecionar para o login
      if (!window.location.href.includes('login.html')) {
          window.location.href = 'login.html'; // Redireciona para login se a sessão for inválida
      }
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    localStorage.removeItem('usuarioLogado'); // Limpa em caso de erro de rede também
    if (!window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
    return false;
  }
  
  return true;
}

// Nova função para realizar o logout
export async function performLogout() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuario || !usuario.id || !usuario.token) {
        // Se não há usuário logado ou token, apenas limpa e redireciona
        localStorage.removeItem('usuarioLogado');
        alert('Logout realizado com sucesso!');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuario.token}` // Envia o token para invalidar no backend
            },
            body: JSON.stringify({ usuario_id: usuario.id }) // Envia o ID do usuário para o backend
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message || 'Logout realizado com sucesso!');
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Erro ao fazer logout no servidor.');
            console.error('Erro no logout do servidor:', errorData);
        }
    } catch (error) {
        alert('Erro de conexão ao tentar fazer logout.');
        console.error('Erro de rede/conexão ao fazer logout:', error);
    } finally {
        // Sempre remove o token do localStorage, mesmo que o backend falhe
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html'; // Redireciona para a página de login
    }
}