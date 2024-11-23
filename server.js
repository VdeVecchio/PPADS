const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Configuração do CORS para permitir requisições do frontend hospedado no Vercel
app.use(cors({
  origin: 'https://ppads-vincius-projects-d504bb97.vercel.app/', // URL do frontend 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para interpretar JSON
app.use(express.json());

// Conexão com o MongoDB Atlas
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch((error) => console.error('Erro de conexão com MongoDB:', error));

// Configuração do esquema e modelos de dados
const notaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  email: String,
});

const usuarioSchema = new mongoose.Schema({
  email: String,
  senha: String,
});

const Nota = mongoose.model('Nota', notaSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Configuração de rotas

// Rota para registrar usuário
app.post('/register', async (req, res) => {
  const { email, senha } = req.body;
  const usuarioExistente = await Usuario.findOne({ email });

  if (usuarioExistente) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = new Usuario({ email, senha: senhaHash });
  await novoUsuario.save();

  res.status(201).send('Usuário registrado com sucesso');
});

// Rota para login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    return res.status(400).json({ message: 'Email ou senha inválidos' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    return res.status(400).json({ message: 'Email ou senha inválidos' });
  }

  const token = jwt.sign({ email: usuario.email }, process.env.SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware para autenticar token
function autenticarToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  jwt.verify(token, process.env.SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
}

// Rotas para notas

// Criar uma nova nota
app.post('/notas', autenticarToken, async (req, res) => {
  const { titulo, conteudo } = req.body;
  const novaNota = new Nota({ titulo, conteudo, email: req.usuario.email });
  await novaNota.save();
  res.status(201).send('Nota criada com sucesso');
});

// Obter todas as notas do usuário
app.get('/notas', autenticarToken, async (req, res) => {
  const notasUsuario = await Nota.find({ email: req.usuario.email });
  res.json(notasUsuario);
});

// Atualizar uma nota por ID
app.put('/notas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo } = req.body;
  const nota = await Nota.findById(id);

  if (nota && nota.email === req.usuario.email) {
    nota.titulo = titulo;
    nota.conteudo = conteudo;
    await nota.save();
    res.status(200).send('Nota atualizada com sucesso');
  } else {
    res.status(404).send('Nota não encontrada ou sem permissão');
  }
});

// Excluir uma nota por ID
app.delete('/notas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const nota = await Nota.findById(id);

  if (nota && nota.email === req.usuario.email) {
    await Nota.findByIdAndDelete(id);
    res.status(200).send('Nota excluída com sucesso');
  } else {
    res.status(404).send('Nota não encontrada ou sem permissão');
  }
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
