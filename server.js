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

app.use(
  cors({
    origin: "https://ppads-two.vercel.app", // Substitua pela URL do frontend no Vercel
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Modelo de Nota
const NotaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  email: String,
});

const Nota = mongoose.model("Nota", NotaSchema);

// Middleware de Autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  jwt.verify(token, process.env.SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido." });
    }
    req.usuario = usuario;
    next();
  });
}

// Rotas
app.get("/notas", autenticarToken, async (req, res) => {
  const notas = await Nota.find({ email: req.usuario.email });
  res.status(200).json(notas);
});

app.post("/notas", autenticarToken, async (req, res) => {
  const { titulo, conteudo } = req.body;
  if (!titulo || !conteudo) {
    return res.status(400).json({ message: "Título e conteúdo obrigatórios." });
  }
  const novaNota = new Nota({ titulo, conteudo, email: req.usuario.email });
  await novaNota.save();
  res.status(201).json({ message: "Nota salva com sucesso!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
