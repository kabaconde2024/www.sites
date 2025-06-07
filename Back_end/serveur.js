const express = require('express');  
const mongoose = require('mongoose');  
const dotenv = require('dotenv');  
const cors = require('cors');  
const session = require('express-session');  
const MongoStore = require('connect-mongo');  
const http = require('http');  
const socketIo = require('socket.io');  

const enseignantRoutes = require("./routes/routesEnseignant");  
const emploiDuTempsRoutes = require("./routes/routesEmploi");  
const routesAuth = require('./routes/routesAuth');  
const routesEleve = require('./routes/routesEleve');  
const routesPaiement = require("./routes/routesPaiement");  
const routesOffre = require("./routes/routesOffre");  
const routesCandidature = require("./routes/routesCandidature");
const routesClasse = require('./routes/classeRoutes');
const routesMatiere = require('./routes/matiereRoutes');
// Ajoutez cette ligne dans votre app.js après les autres routes
const noteRoutes = require('./routes/noteRoutes');
// Charger les variables d'environnement  
dotenv.config();  
const app = express();  
const server = http.createServer(app); // Création du serveur HTTP  
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Autoriser l'accès depuis ton frontend
    methods: ["GET", "POST"]
  }
});

// Middleware  
app.use(express.json());  
app.use(cors({  
  origin: 'http://localhost:3000',  
  credentials: true,  
  exposedHeaders: ['Authorization'],  
}));  

// Connexion à MongoDB  
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })  
  .then(() => console.log("Base de données connectée"))  
  .catch(err => console.log("Erreur de connexion à la base de données : ", err));  

// Configuration des sessions  
app.use(session({  
  secret: process.env.JWT_SECRET,  
  resave: false,  
  saveUninitialized: false,  
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),  
  cookie: {  
    httpOnly: true,  
    maxAge: 1000 * 60 * 60 * 24,  
  },  
}));  

// Routes  
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

// Écouter les connexions Socket.IO  
io.on('connection', (socket) => {  
  console.log('Un utilisateur est connecté : ' + socket.id);  

  socket.on('disconnect', () => {  
    console.log('Un utilisateur est déconnecté : ' + socket.id);  
  });  
});  

// Lancer le serveur  
const PORT = process.env.PORT || 5000;  
server.listen(PORT, () => {  
  console.log(`Serveur démarré sur le port ${PORT}`);  
});
