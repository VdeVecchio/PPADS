function login() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        // Armazena o token no localStorage
        localStorage.setItem('token', data.token);
        alert('Login realizado com sucesso');
        // Redireciona para a página principal
        window.location.href = 'index.html';
      } else {
        alert('Email ou senha inválidos');
      }
    })
    .catch(error => console.error('Erro no login:', error));
}
