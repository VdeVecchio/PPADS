const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

const mongoURI = 'mongodb+srv://PPADS:PP@D5M@CK@cluster0.jdl8v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Conectando ao MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch((error) => console.error('Erro de conexão com MongoDB:', error));

// Definindo o esquema de dados
const notaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  email: String,
});

const usuarioSchema = new mongoose.Schema({
  email: String,
  senha: String,
});

// Criando os modelos de dados
const Nota = mongoose.model('Nota', notaSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);

app.use(cors());
app.use(express.json());

const SECRET = 'seu_segredo_jwt';

// Rota para registrar usuário
app.post('/register', async (req, res) => {
  const { email, senha } = req.body;

  // Verifica se o usuário já existe
  const usuarioExistente = await Usuario.findOne({ email });
  if (usuarioExistente) {
    return res.status(400).json({ message: 'Usuário já existe' });
  }

  // Criptografa a senha
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

  const token = jwt.sign({ email: usuario.email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware para verificar o token
function autenticarToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  jwt.verify(token, SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
}

// Rota protegida - criação de notas
app.post('/notas', autenticarToken, async (req, res) => {
  const { titulo, conteudo } = req.body;
  const novaNota = new Nota({ titulo, conteudo, email: req.usuario.email });
  await novaNota.save();
  res.status(201).send('Nota criada com sucesso');
});

// Rota protegida - obter notas do usuário
app.get('/notas', autenticarToken, async (req, res) => {
  const notasUsuario = await Nota.find({ email: req.usuario.email });
  res.json(notasUsuario);
});

// Rota protegida - editar nota por ID
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

// Rota protegida - excluir nota por ID
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

// Inicializar o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
