const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");

// Configuração do banco de dados MongoDB
mongoose
  .connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

const app = express();

// Middleware CORS com configuração específica
app.use(
  cors({
    origin: "https://ppads-two.vercel.app", // Substitua pela URL correta do frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Permite os métodos necessários
    allowedHeaders: ["Content-Type", "Authorization"], // Permite o cabeçalho Authorization
  })
);

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());

// Modelo para notas no MongoDB
const NotaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  email: String, // Associado ao usuário
});

const Nota = mongoose.model("Nota", NotaSchema);

// Middleware para autenticar token JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extrai o token do cabeçalho

  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  jwt.verify(token, process.env.SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado." });
    }
    req.usuario = usuario; // Armazena os dados do usuário no request
    next();
  });
}

// Rota para carregar notas (requer autenticação)
app.get("/notas", autenticarToken, async (req, res) => {
  try {
    const notas = await Nota.find({ email: req.usuario.email }); // Busca notas pelo email do usuário
    res.status(200).json(notas);
  } catch (error) {
    console.error("Erro ao carregar notas:", error);
    res.status(500).json({ message: "Erro ao carregar notas." });
  }
});

// Rota para salvar nota (requer autenticação)
app.post("/notas", autenticarToken, async (req, res) => {
  console.log("Token recebido:", req.headers["authorization"]); // Log do token
  console.log("Usuário autenticado:", req.usuario); // Log do usuário

  const { titulo, conteudo } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
  }

  try {
    const novaNota = new Nota({ titulo, conteudo, email: req.usuario.email });
    await novaNota.save();
    res.status(201).json({ message: "Nota criada com sucesso!", nota: novaNota });
  } catch (error) {
    console.error("Erro ao salvar nota:", error);
    res.status(500).json({ message: "Erro ao salvar nota." });
  }
});

// Rota para autenticação de login (exemplo)
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  // Exemplo básico: substitua por autenticação real
  if (email && senha) {
    const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } else {
    res.status(400).json({ message: "Email e senha são obrigatórios." });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
