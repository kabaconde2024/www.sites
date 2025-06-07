import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  CircularProgress, 
  Chip,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Person, 
  PersonOutline, 
  Email, 
  Phone, 
  Book, 
  School,
  Error as ErrorIcon,
  CheckCircle
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import SidebarAdmin from './SidebarAdmin';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const PageAjouterEnseignant = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    matieres: [],
    telephone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/matieres', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatieres(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des matières');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatieres();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMatiereChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      matieres: Array.isArray(value) ? value : [value]
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prenom || !formData.email || 
        !formData.telephone || formData.matieres.length === 0) {
      setError('Tous les champs doivent être remplis.');
      return;
    }
  
    try {
      setError('');
      setSubmitLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/enseignants/ajout', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        matieres: formData.matieres,
        telephone: formData.telephone
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          matieres: [],
          telephone: '',
        });
        
        // Optionnel: Redirection après un délai
        setTimeout(() => {
          navigate('/dashboardAdmin'); // Redirige vers la liste des enseignants
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Une erreur est survenue lors de l\'ajout de l\'enseignant';
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleCloseSuccessSnackbar = () => {
    setSuccess(false);
  };

  const handleCloseErrorSnackbar = () => {
    setError('');
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, pt: '64px', height: 'calc(100vh - 64px)' }}>
      <Header/>
      <SidebarAdmin />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5', p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <School sx={{ mr: 1 }} />
                  Ajouter un Enseignant
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutline />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutline />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        name="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Matières enseignées</InputLabel>
                        <Select
                          multiple
                          label="Matières enseignées"
                          value={formData.matieres}
                          onChange={handleMatiereChange}
                          disabled={loading}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((matiereId) => {
                                const matiere = matieres.find(m => m._id === matiereId);
                                return matiere ? (
                                  <Chip 
                                    key={matiereId} 
                                    label={`${matiere.nom} (Coef: ${matiere.coefficient})`}
                                    icon={<Book fontSize="small" />}
                                  />
                                ) : null;
                              })}
                            </Box>
                          )}
                        >
                          {loading ? (
                            <MenuItem disabled>
                              <CircularProgress size={24} />
                            </MenuItem>
                          ) : (
                            matieres.map((matiere) => (
                              <MenuItem key={matiere._id} value={matiere._id}>
                                <Book sx={{ mr: 1 }} fontSize="small" />
                                {matiere.nom} (Coefficient: {matiere.coefficient})
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        fullWidth
                        disabled={submitLoading}
                        startIcon={submitLoading ? <CircularProgress size={24} /> : <Person />}
                      >
                        {submitLoading ? 'Ajout en cours...' : 'Ajouter Enseignant'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar pour afficher le message de succès */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccessSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
          icon={<CheckCircle fontSize="inherit" />}
        >
          Enseignant ajouté avec succès!
        </Alert>
      </Snackbar>

      {/* Snackbar pour afficher les erreurs */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
          icon={<ErrorIcon fontSize="inherit" />}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PageAjouterEnseignant;