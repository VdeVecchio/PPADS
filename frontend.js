let notaEmEdicao = null;  // Variável para armazenar o índice da nota que está sendo editada

// Função para salvar uma nova nota ou atualizar uma existente
function salvarNota() {
  const titulo = document.getElementById('notaTitulo').value;
  const conteudo = document.getElementById('notaContent').value;

  // Verifica se há conteúdo e título antes de salvar
  if (titulo.trim() === '' || conteudo.trim() === '') {
    alert('Por favor, preencha o título e o conteúdo da nota.');
    return;
  }

  if (notaEmEdicao === null) {
    // Criar uma nova nota (POST)
    fetch('http://localhost:3000/notas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ titulo, conteudo }),  // Enviar o título e o conteúdo da nota como JSON
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao salvar nota');
      }
      return response.text();
    })
    .then(data => {
      console.log(data);  // Exibir a resposta no console
      atualizarListaNotas();  // Atualizar a lista de notas
      limparCampos();  // Limpar os campos de título e conteúdo após salvar
    })
    .catch(error => console.error('Erro ao salvar nota:', error));
  } else {
    // Atualizar uma nota existente (PUT)
    fetch(`http://localhost:3000/notas/${notaEmEdicao}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ titulo, conteudo }),
    })
    .then(response => response.text())
    .then(data => {
      console.log(data);  // Exibir a resposta no console
      atualizarListaNotas();  // Atualizar a lista de notas
      notaEmEdicao = null;  // Limpar a variável após a edição
      limparCampos();  // Limpar os campos de título e conteúdo
    })
    .catch(error => console.error('Erro ao editar nota:', error));
  }
}

// Função para limpar os campos de título e conteúdo
function limparCampos() {
  document.getElementById('notaTitulo').value = '';
  document.getElementById('notaContent').value = '';
}

// Função para buscar e exibir as notas salvas no backend
function atualizarListaNotas() {
  const notasList = document.getElementById('notasList');

  // Fazer uma requisição GET para pegar as notas do backend
  fetch('http://localhost:3000/notas')
    .then(response => response.json())  // Pegar a resposta como JSON
    .then(notas => {
      // Limpar a lista de notas
      notasList.innerHTML = '';

      // Adicionar cada nota na lista com os botões de edição e exclusão
      notas.forEach((nota, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = nota.titulo;  // Exibir o título da nota na lista

        // Criar um container flexível para os botões
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group-nota';

        // Botão de editar
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-warning btn-sm';
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => editarNota(index, nota.titulo, nota.conteudo);

        // Botão de excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn btn-danger btn-sm';
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => excluirNota(index);  // Chamar a função de excluir nota

        // Adicionar os botões ao container flexível
        btnGroup.appendChild(btnEditar);
        btnGroup.appendChild(btnExcluir);

        // Adicionar o grupo de botões ao item da lista
        li.appendChild(btnGroup);
        notasList.appendChild(li);
      });
    })
    .catch(error => console.error('Erro ao carregar notas:', error));
}

// Função para carregar uma nota no campo de texto para edição
function editarNota(id, titulo, conteudo) {
  notaEmEdicao = id;  // Armazenar o índice da nota que está sendo editada
  document.getElementById('notaTitulo').value = titulo;  // Carregar o título da nota no campo de título
  document.getElementById('notaContent').value = conteudo;  // Carregar o conteúdo da nota no campo de texto
}

// Função para excluir uma nota
function excluirNota(id) {
  // Fazer uma requisição DELETE para o backend
  fetch(`http://localhost:3000/notas/${id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        atualizarListaNotas();  // Atualizar a lista de notas após a exclusão
      } else {
        console.error('Erro ao excluir nota:', response.statusText);
      }
    })
    .catch(error => console.error('Erro ao excluir nota:', error));
}

// Atualiza a lista de notas quando a página é carregada
window.onload = atualizarListaNotas;
