const express = require('express');
const router = express.Router();
const controleurAuth = require('../controllers/controleurAuth');
const { getUtilisateurs } = require('../controllers/controleurAuth');
// Routes d'authentification
router.post('/inscription', controleurAuth.inscription);
router.post('/connexion', controleurAuth.connexion);
router.get('/utilisateurs', getUtilisateurs);
router.get('/', (req, res) => {
  res.json({
    message: "Bienvenue dans l'API Auth",
    endpoints: {
      inscription: "POST /inscription",
      connexion: "POST /connexion",
      liste_utilisateurs: "GET /utilisateurs"
    }
  });
});
module.exports = router;
