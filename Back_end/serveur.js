const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');

// Import des routes
const enseignantRoutes = require("./routes/routesEnseignant");
const emploiDuTempsRoutes = require("./routes/routesEmploi");
const routesAuth = require('./routes/routesAuth');
const routesEleve = require('./routes/routesEleve');
const routesPaiement = require("./routes/routesPaiement");
const routesOffre = require("./routes/routesOffre");
const routesCandidature = require("./routes/routesCandidature");
const routesClasse = require('./routes/classeRoutes');
const routesMatiere = require('./routes/matiereRoutes');
const noteRoutes = require('./routes/noteRoutes');

// Configuration environnement
dotenv.config();
const app = express();
const server = http.createServer(app);

// Configuration dynamique pour CORS et Socket.IO
const isProduction = process.env.NODE_ENV === 'production';
const localFrontend = 'http://localhost:3000';
const productionFrontend = process.env.FRONTEND_URL;

const allowedOrigins = [
  localFrontend,
  ...(isProduction && productionFrontend ? [productionFrontend] : [])
].filter(Boolean);

// Configuration Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Configuration CORS avancée
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Requête bloquée par CORS depuis: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Authorization', 'Set-Cookie']
}));

// Connexion MongoDB avec gestion d'erreur améliorée
// Nouvelle version simplifiée
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB Atlas avec succès"))
  .catch(err => {
    console.error("❌ Erreur de connexion:", err.message);
    process.exit(1);
  });

// Configuration des sessions avec options de production
app.use(session({
  name: 'kankadi.sid',
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 1 jour
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    ...(isProduction && { domain: process.env.COOKIE_DOMAIN })
  }
}));

// Route d'accueil (à placer avant app.use(404))
app.get("/", (req, res) => {
  res.json({
    message: "API Kankadi Internationale",
    status: "En ligne ✅",
    endpoints: {
      auth: "/api/auth",
      élèves: "/api/eleves",
      enseignants: "/api/enseignants",
      emploiDuTemps: "/api/emploi",
      paiements: "/api/paiements",
    },
  });
});

// Routes API
app.use('/api/auth', routesAuth);
app.use('/api/eleves', routesEleve);
app.use("/api/enseignants", enseignantRoutes);
app.use("/api/emploi", emploiDuTempsRoutes);
app.use("/api/paiements", routesPaiement);
app.use("/api/offres", routesOffre);
app.use("/api/candidatures", routesCandidature);
app.use("/api/classes", routesClasse);
app.use("/api/matieres", routesMatiere);
app.use('/api/notes', noteRoutes);

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`Nouvelle connexion Socket.IO: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Déconnexion Socket.IO: ${socket.id}`);
  });

  // Ajoutez ici vos événements Socket.IO personnalisés
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPPEMENT'}`);
  console.log(`Origines autorisées: ${allowedOrigins.join(', ') || 'Aucune'}`);
  console.log(`URL MongoDB: ${mongoose.connection.host}`);
});