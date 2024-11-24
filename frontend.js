const API_URL = "https://backend-bloco-de-notas.onrender.com";
let notaAtual = null; // Armazena a nota que está sendo editada

// Verifica se o usuário está autenticado
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// Função para carregar as notas do backend
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
    exibirNotas(notas);
  } catch (error) {
    console.error(error.message);
    alert("Erro ao carregar notas: " + error.message);
  }
}

// Função para exibir notas na interface
function exibirNotas(notas) {
  const lista = document.querySelector("#notasList");
  lista.innerHTML = ""; // Limpa a lista antes de renderizar

  notas.forEach((nota) => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";

    const textoNota = document.createElement("span");
    textoNota.textContent = `${nota.titulo}: ${nota.conteudo.substring(0, 15)}...`; // Limita o conteúdo a 15 caracteres

    const editarBtn = document.createElement("button");
    editarBtn.textContent = "Editar";
    editarBtn.className = "btn btn-sm btn-warning mx-1";
    editarBtn.onclick = () => editarNota(nota);

    const excluirBtn = document.createElement("button");
    excluirBtn.textContent = "Excluir";
    excluirBtn.className = "btn btn-sm btn-danger";
    excluirBtn.onclick = () => excluirNota(nota._id);

    item.appendChild(textoNota);
    const botoesContainer = document.createElement("div");
    botoesContainer.className = "d-flex align-items-center"; // Mantém os botões fixos
    botoesContainer.appendChild(editarBtn);
    botoesContainer.appendChild(excluirBtn);

    item.appendChild(botoesContainer);
    lista.appendChild(item);
  });
}

// Função para salvar ou atualizar uma nota
async function salvarNota() {
  const titulo = document.querySelector("#notaTitulo").value;
  const conteudo = document.querySelector("#notaContent").value;

  try {
    const token = localStorage.getItem("token");

    // Verifica se está editando uma nota existente
    if (notaAtual) {
      await fetch(`${API_URL}/notas/${notaAtual}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, conteudo }),
      });
      alert("Nota atualizada com sucesso!");
      notaAtual = null; // Reseta o ID da nota atual após edição
    } else {
      await fetch(`${API_URL}/notas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo, conteudo }),
      });
      alert("Nota criada com sucesso!");
    }

    carregarNotas(); // Atualiza a lista de notas
    document.querySelector("#notaTitulo").value = "";
    document.querySelector("#notaContent").value = "";
  } catch (error) {
    console.error(error.message);
    alert("Erro ao salvar nota: " + error.message);
  }
}

// Função para editar nota
function editarNota(nota) {
  document.querySelector("#notaTitulo").value = nota.titulo;
  document.querySelector("#notaContent").value = nota.conteudo;
  notaAtual = nota._id; // Armazena o ID da nota sendo editada
}

// Função para excluir nota
async function excluirNota(id) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/notas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir nota");
    }

    alert("Nota excluída com sucesso!");
    carregarNotas(); // Atualiza a lista de notas
  } catch (error) {
    console.error(error.message);
    alert("Erro ao excluir nota: " + error.message);
  }
}

// Função de logout
function logout() {
  localStorage.removeItem("token");
  alert("Logout realizado com sucesso!");
  window.location.href = "login.html"; // Redireciona para a página de login
}

// Inicializa os eventos e carrega as notas
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#criarNotaButton").onclick = salvarNota;
  carregarNotas();
});
