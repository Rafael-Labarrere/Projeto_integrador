// Simulação de autenticação
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validação simples
            if (email && password) {
                // Simular login bem-sucedido
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'loggedin.html';
            } else {
                document.getElementById('error-message').textContent = 'Por favor, preencha todos os campos!';
            }
        });
    }
    
    // Verificar se usuário está logado
    if (localStorage.getItem('isLoggedIn') === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'loggedin.html';
    }
});