const API_URL = "https://backend-bloco-de-notas.onrender.com";

async function registrar() {
  try {
    const email = document.querySelector("#email").value;
    const senha = document.querySelector("#senha").value;
    const confirmaSenha = document.querySelector("#confirmaSenha").value;

    if (!email || !senha || !confirmaSenha) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    if (senha !== confirmaSenha) {
      alert("As senhas não conferem!");
      return;
    }

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error("Erro ao registrar. Tente novamente.");
    }

    alert("Registro realizado com sucesso!");
    window.location.href = "login.html"; // Redireciona para a página de login
  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
}
