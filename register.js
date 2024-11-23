const API_URL = "https://backend-bloco-de-notas.onrender.com";

async function registrar(email, senha) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error('Erro no registro');
    }

    const data = await response.json();
    console.log('Usuário registrado com sucesso:', data);
    alert('Registro realizado com sucesso!');
    window.location.href = "login.html"; // Redireciona para a página de login
  } catch (error) {
    console.error('Erro no registro:', error);
    alert('Erro ao registrar: ' + error.message);
  }
}

document.querySelector("#registerButton").onclick = () => {
  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#senha").value;
  registrar(email, senha);
};
