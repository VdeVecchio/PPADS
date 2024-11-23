const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Configuração do banco de dados MongoDB
mongoose
  .connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

const app = express();

// Configuração do middleware CORS
app.use(
  cors({
    origin: "https://ppads-two.vercel.app", // Substitua pela URL correta do frontend no Vercel
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Adiciona suporte ao cabeçalho Authorization
  })
);

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());

// Modelo de Nota no MongoDB
const NotaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
});

const Nota = mongoose.model("Nota", NotaSchema);

// Rota para carregar notas (sem autenticação)
app.get("/notas", async (req, res) => {
  try {
    const notas = await Nota.find(); // Busca todas as notas no banco
    res.status(200).json(notas);
  } catch (error) {
    console.error("Erro ao carregar notas:", error);
    res.status(500).json({ message: "Erro ao carregar notas." });
  }
});

// Rota para salvar uma nova nota (sem autenticação)
app.post("/notas", async (req, res) => {
  const { titulo, conteudo } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ message: "Título e conteúdo são obrigatórios." });
  }

  try {
    const novaNota = new Nota({ titulo, conteudo });
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
