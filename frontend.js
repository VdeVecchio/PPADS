let notaEmEdicao = null;  // Variável para armazenar o índice da nota que está sendo editada

// Função para salvar uma nova nota ou atualizar uma existente
function salvarNota() {
  const titulo = document.getElementById('notaTitulo').value;
  const conteudo = document.getElementById('notaContent').value;
  const token = localStorage.getItem('token');

  if (!titulo || !conteudo) {
    alert('Preencha o título e o conteúdo da nota');
    return;
  }

  if (notaEmEdicao === null) {
    // Criar uma nova nota
    fetch('http://localhost:3000/notas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ titulo, conteudo }),
    })
      .then(response => response.text())
      .then(() => {
        atualizarListaNotas();
        limparCampos();
      })
      .catch(error => console.error('Erro ao salvar nota:', error));
  } else {
    // Atualizar uma nota existente
    fetch(`http://localhost:3000/notas/${notaEmEdicao}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ titulo, conteudo }),
    })
      .then(response => response.text())
      .then(() => {
        atualizarListaNotas();
        limparCampos();
        notaEmEdicao = null;  // Limpar a edição
      })
      .catch(error => console.error('Erro ao editar nota:', error));
  }
}

// Função para carregar e exibir as notas
function atualizarListaNotas() {
  const token = localStorage.getItem('token');
  fetch('http://localhost:3000/notas', {
    method: 'GET',
    headers: {
      'Authorization': token,
    },
  })
    .then(response => response.json())
    .then(notas => {
      const notasList = document.getElementById('notasList');
      notasList.innerHTML = '';  // Limpar a lista

      notas.forEach((nota, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        // Limita o conteúdo a 15 caracteres e adiciona "..." se for maior
        const conteudoPreview = nota.conteudo.length > 15 ? nota.conteudo.substring(0, 15) + '...' : nota.conteudo;

        li.innerHTML = `<strong>${nota.titulo}</strong> - ${conteudoPreview}`;

        // Botões de Editar e Excluir
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        // Botão Editar
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-warning btn-sm';
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => editarNota(index, nota.titulo, nota.conteudo);

        // Botão Excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn btn-danger btn-sm';
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => excluirNota(index);

        btnGroup.appendChild(btnEditar);
        btnGroup.appendChild(btnExcluir);
        li.appendChild(btnGroup);

        notasList.appendChild(li);
      });
    })
    .catch(error => console.error('Erro ao carregar notas:', error));
}

// Função para carregar uma nota no campo para edição
function editarNota(id, titulo, conteudo) {
  document.getElementById('notaTitulo').value = titulo;
  document.getElementById('notaContent').value = conteudo;
  notaEmEdicao = id;  // Define a nota que está sendo editada
}

// Função para excluir uma nota
function excluirNota(id) {
  const token = localStorage.getItem('token');
  fetch(`http://localhost:3000/notas/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token,
    },
  })
    .then(response => {
      if (response.ok) {
        atualizarListaNotas();  // Atualiza a lista após exclusão
      } else {
        console.error('Erro ao excluir nota:', response.statusText);
      }
    })
    .catch(error => console.error('Erro ao excluir nota:', error));
}

// Função para limpar os campos de título e conteúdo
function limparCampos() {
  document.getElementById('notaTitulo').value = '';
  document.getElementById('notaContent').value = '';
}

// Função de logout
function logout() {
  localStorage.removeItem('token');  // Remove o token do localStorage
  window.location.href = 'login.html';  // Redireciona para a página de login
}

// Atualizar a lista de notas quando a página é carregada
window.onload = atualizarListaNotas;
