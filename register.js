function registrar() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmaSenha = document.getElementById('confirmaSenha').value;

  if (senha !== confirmaSenha) {
    alert('As senhas não correspondem!');
    return;
  }

  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  })
    .then(response => {
      if (response.ok) {
        alert('Usuário registrado com sucesso!');
        window.location.href = 'login.html';  // Redireciona para a página de login
      } else {
        alert('Erro ao registrar usuário');
      }
    })
    .catch(error => console.error('Erro no registro:', error));
}
