const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Enseignant = require("../models/Enseignant");
const Eleve = require('../models/Eleve');



// Inscription d'un utilisateur
exports.inscription = async (req, res) => {
  const { nomUtilisateur, email, motDePasse, cin } = req.body;

  try {
    const utilisateurExistant = await Utilisateur.findOne({ email });
    if (utilisateurExistant) return res.status(400).json({ message: "L'utilisateur existe déjà." });

    let role = 'admin';
    if (cin.startsWith('GP')) role = 'professeur';
    else if (cin.startsWith('GE')) role = 'eleve';
    else if (cin.startsWith('GPA')) role = 'adminGPA';

    const motDePasseHache = await bcrypt.hash(motDePasse, 10);

    const utilisateur = new Utilisateur({ nomUtilisateur, email, motDePasse: motDePasseHache, role, cin });
    await utilisateur.save();

    // Générer un token JWT
    const token = jwt.sign(
      { id: utilisateur._id, role: utilisateur.role },
      process.env.JWT_SECRET, // Assurez-vous que vous avez une clé secrète dans vos variables d'environnement
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "Utilisateur inscrit avec succès.",
      user: { id: utilisateur._id, nomUtilisateur: utilisateur.nomUtilisateur, role: utilisateur.role },
      token // Ajout du token dans la réponse
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'inscription.", error: err });
  }
};



exports.connexion = async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findOne({ email });
    if (!utilisateur) return res.status(400).json({ message: "Identifiants incorrects" });

    const correspondance = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!correspondance) return res.status(400).json({ message: "Identifiants incorrects" });

    // Récupérer les données supplémentaires selon le rôle
    let userData = { 
      id: utilisateur._id, 
      nomUtilisateur: utilisateur.nomUtilisateur, 
      role: utilisateur.role 
    };

    if (utilisateur.role === 'eleve' && utilisateur.eleveId) {
      const eleve = await Eleve.findById(utilisateur.eleveId).populate('classe');
      userData = { ...userData, ...eleve.toObject() };
    } else if (utilisateur.role === 'professeur' && utilisateur.enseignantId) {
      const enseignant = await Enseignant.findById(utilisateur.enseignantId).populate('matieres');
      userData = { ...userData, ...enseignant.toObject() };
    }

    const token = jwt.sign(
      { id: utilisateur._id, role: utilisateur.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: "Connexion réussie",
      user: userData,
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la connexion", error: err });
  }
};


exports.deconnexion = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Erreur lors de la déconnexion." });
    }
    res.clearCookie('connect.sid'); // Supprime le cookie de session
    res.json({ message: "Déconnexion réussie." });
  });
};

const verifierSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Non autorisé. Veuillez vous connecter." });
  }
  next();
};

  // Récupérer l'ensemble des utilisateurs
// contrôleur pour récupérer les utilisateurs
exports.getUtilisateurs = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs
    const utilisateurs = await Utilisateur.find();

    // Calculer la répartition des utilisateurs par rôle
    const repartitionUtilisateurs = [
      { name: 'Administrateurs', value: utilisateurs.filter(u => u.role === 'administrateur').length, fill: '#8884d8' },
      { name: 'Enseignants', value: utilisateurs.filter(u => u.role === 'enseignant').length, fill: '#82ca9d' },
      { name: 'Étudiants', value: utilisateurs.filter(u => u.role === 'etudiant').length, fill: '#ffc658' },
    ];

    res.status(200).json({
      utilisateurs: utilisateurs.length,
      repartitionUtilisateurs: repartitionUtilisateurs,
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs.", error: err });
  }
};


