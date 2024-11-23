const API_URL = "https://backend-bloco-de-notas.onrender.com";

// Função para criar uma nova nota
async function criarNota(titulo, conteudo) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/notas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ titulo, conteudo }),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar nota");
    }

    alert("Nota criada com sucesso!");
    carregarNotas(); // Atualiza a lista de notas
  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
}

// Função para carregar as notas
async function carregarNotas() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/notas`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar notas");
    }

    const notas = await response.json();
    exibirNotas(notas); // Renderiza as notas
  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
}

// Função para exibir notas na interface
function exibirNotas(notas) {
  const lista = document.querySelector("#listaNotas");
  lista.innerHTML = ""; // Limpa a lista antes de renderizar

  notas.forEach((nota) => {
    const item = document.createElement("li");
    item.textContent = `${nota.titulo}: ${nota.conteudo}`;
    lista.appendChild(item);
  });
}

// Função de logout
function logout() {
  localStorage.removeItem("token"); // Remove o token do localStorage
  alert("Logout realizado com sucesso!");
  window.location.href = "login.html"; // Redireciona para a página de login
}

// Eventos de clique
document.querySelector("#criarNotaButton").onclick = () => {
  const titulo = document.querySelector("#titulo").value;
  const conteudo = document.querySelector("#conteudo").value;
  criarNota(titulo, conteudo);
};

document.querySelector("#logoutButton").onclick = logout;

// Carregar notas ao carregar a página
document.addEventListener("DOMContentLoaded", carregarNotas);
