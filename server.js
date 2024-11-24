const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Configuração do CORS
app.use(cors({
  origin: "https://ppads-two.vercel.app", // URL do frontend hospedado
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite o cabeçalho Authorization
}));

// Middleware para interpretar JSON
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

// Modelos
const Nota = mongoose.model('Nota', new mongoose.Schema({
  titulo: String,
  conteudo: String,
  email: String, // Associar nota ao usuário autenticado
}));

const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
}));

// Middleware para autenticar token
function autenticarToken(req, res, next) {
  const token = req.headers['authorization']?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, process.env.SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.usuario = usuario;
    next();
  });
}

// Rotas
app.post('/register', async (req, res) => {
  const { email, senha } = req.body;
  const usuarioExistente = await Usuario.findOne({ email });

  if (usuarioExistente) {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const novoUsuario = new Usuario({ email, senha: senhaHash });
  await novoUsuario.save();
  res.status(201).send('Usuário registrado com sucesso.');
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    return res.status(400).json({ message: 'Email ou senha inválidos.' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    return res.status(400).json({ message: 'Email ou senha inválidos.' });
  }

  const token = jwt.sign({ email: usuario.email }, process.env.SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Listar Notas
app.get('/notas', autenticarToken, async (req, res) => {
  const notasUsuario = await Nota.find({ email: req.usuario.email });
  res.json(notasUsuario);
});

// Criar Nota
app.post('/notas', autenticarToken, async (req, res) => {
  const { titulo, conteudo } = req.body;
  const novaNota = new Nota({ titulo, conteudo, email: req.usuario.email });
  await novaNota.save();
  res.status(201).send('Nota criada com sucesso.');
});

// Atualizar Nota
app.put('/notas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo } = req.body;

  try {
    const notaAtualizada = await Nota.findOneAndUpdate(
      { _id: id, email: req.usuario.email },
      { titulo, conteudo },
      { new: true }
    );

    if (!notaAtualizada) {
      return res.status(404).json({ message: 'Nota não encontrada.' });
    }

    res.status(200).json({ message: 'Nota atualizada com sucesso.', nota: notaAtualizada });
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ message: 'Erro ao atualizar nota.' });
  }
});

// Excluir Nota
app.delete('/notas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const notaExcluida = await Nota.findOneAndDelete({ _id: id, email: req.usuario.email });

    if (!notaExcluida) {
      return res.status(404).json({ message: 'Nota não encontrada.' });
    }

    res.status(200).json({ message: 'Nota excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    res.status(500).json({ message: 'Erro ao excluir nota.' });
  }
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
