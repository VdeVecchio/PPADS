const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Conexão ao MongoDB
mongoose
  .connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

// Configuração do middleware CORS
app.use(
  cors({
    origin: "https://ppads-two.vercel.app", // Substitua pela URL do frontend no Vercel
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Inclui Authorization para autenticação
  })
);

// Middleware para interpretar JSON
app.use(express.json());

// Modelos no MongoDB
const UsuarioSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  senha: { type: String, required: true },
});

const NotaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);
const Nota = mongoose.model("Nota", NotaSchema);

// Middleware de autenticação JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  jwt.verify(token, process.env.SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado." });
    }
    req.usuario = usuario;
    next();
  });
}

// Rota para registro de usuário
app.post("/register", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: "Email já registrado." });
    }

    const novoUsuario = new Usuario({ email, senha });
    await novoUsuario.save();
    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ message: "Erro ao registrar usuário." });
  }
});

// Rota para login de usuário
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const usuario = await Usuario.findOne({ email, senha });
    if (!usuario) {
      return res.status(400).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign({ id: usuario._id, email: usuario.email }, process.env.SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    res.status(500).json({ message: "Erro ao realizar login." });
  }
});

// Rota para listar notas
app.get("/notas", autenticarToken, async (req, res) => {
  try {
    const notas = await Nota.find({ usuarioId: req.usuario.id }); // Busca notas pelo usuário autenticado
    res.status(200).json(notas);
  } catch (error) {
    console.error("Erro ao carregar notas:", error);
    res.status(500).json({ message: "Erro ao carregar notas." });
  }
});

// Rota para salvar nota
app.post("/notas", autenticarToken, async (req, res) => {
  const { titulo, conteudo } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
  }

  try {
    const novaNota = new Nota({
      titulo,
      conteudo,
      usuarioId: req.usuario.id,
    });
    await novaNota.save();
    res.status(201).json({ message: "Nota criada com sucesso!", nota: novaNota });
  } catch (error) {
    console.error("Erro ao salvar nota:", error);
    res.status(500).json({ message: "Erro ao salvar nota." });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
