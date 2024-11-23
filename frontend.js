const API_URL = "https://backend-bloco-de-notas.onrender.com";

// Função para criar uma nova nota
async function criarNota(titulo, conteudo) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/notas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ titulo, conteudo }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar nota');
    }

    const data = await response.json();
    console.log('Nota criada com sucesso:', data);
    alert('Nota criada com sucesso!');
    carregarNotas(); // Atualiza a lista de notas
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    alert('Erro ao criar nota: ' + error.message);
  }
}

// Função para carregar as notas do usuário
async function carregarNotas() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/notas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar notas');
    }

    const notas = await response.json();
    console.log('Notas carregadas:', notas);
    exibirNotas(notas); // Função que renderiza as notas na página
  } catch (error) {
    console.error('Erro ao carregar notas:', error);
    alert('Erro ao carregar notas: ' + error.message);
  }
}

// Função para exibir as notas no frontend
function exibirNotas(notas) {
  const lista = document.querySelector("#listaNotas");
  lista.innerHTML = ""; // Limpa a lista antes de renderizar novamente
  notas.forEach((nota) => {
    const item = document.createElement("li");
    item.textContent = `${nota.titulo}: ${nota.conteudo}`;
    lista.appendChild(item);
  });
}

// Evento de criação de nota
document.querySelector("#criarNotaButton").onclick = () => {
  const titulo = document.querySelector("#titulo").value;
  const conteudo = document.querySelector("#conteudo").value;
  criarNota(titulo, conteudo);
};

// Carrega as notas quando a página for carregada
document.addEventListener("DOMContentLoaded", carregarNotas);
