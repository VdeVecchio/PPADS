const API_URL = "https://backend-bloco-de-notas.onrender.com";

async function login() {
  try {
    const email = document.querySelector("#email").value;
    const senha = document.querySelector("#senha").value;

    if (!email || !senha) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error("Erro no login. Verifique suas credenciais.");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token); // Salva o token no localStorage
    alert("Login realizado com sucesso!");
    window.location.href = "index.html"; // Redireciona para a página principal
  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
}
