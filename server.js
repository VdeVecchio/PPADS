const express = require('express');
const cors = require('cors');
const app = express();
const notas = [];

// Middleware
app.use(cors());
app.use(express.json());

// Rota para obter as notas
app.get('/notas', (req, res) => {
  res.json(notas);
});

// Rota para criar uma nova nota
app.post('/notas', (req, res) => {
  const { titulo, conteudo } = req.body;
  notas.push({ titulo, conteudo });
  res.status(201).send('Nota criada com sucesso');
});

// Rota para editar uma nota por índice
app.put('/notas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, conteudo } = req.body;
  if (id >= 0 && id < notas.length) {
    notas[id] = { titulo, conteudo };  // Atualizar título e conteúdo
    res.status(200).send('Nota atualizada com sucesso');
  } else {
    res.status(404).send('Nota não encontrada');
  }
});

// Rota para excluir uma nota por índice
app.delete('/notas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < notas.length) {
    notas.splice(id, 1);
    res.status(200).send('Nota excluída com sucesso');
  } else {
    res.status(404).send('Nota não encontrada');
  }
});

// Inicializar o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
