const API_URL = "https://backend-bloco-de-notas.onrender.com";

async function login(email, senha) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    if (!response.ok) {
      throw new Error("Erro no login");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token); // Armazena o token
    alert("Login realizado com sucesso!");
    window.location.href = "index.html"; // Redireciona para a página principal
  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
}

document.querySelector("#loginButton").onclick = () => {
  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#senha").value;
  login(email, senha);
};
