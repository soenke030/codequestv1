import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // useNavigate für Weiterleitung verwenden

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); // State für den Spitznamen
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar-State
  const navigate = useNavigate(); // Hook für Navigation

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Benutzer ohne E-Mail-Bestätigung registrieren
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Wenn der Benutzer erstellt wurde, in der 'profiles'-Tabelle den Spitznamen speichern
    const userId = user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId, // Benutzer-ID
            email,      // E-Mail
            nickname,   // Spitzname
            story: null,
            progress: 0,
          },
        ]);

      if (profileError) {
        setError('Fehler beim Speichern des Profils.');
        setLoading(false);
        return;
      }
    }

    // Erfolgsmeldung in der Snackbar anzeigen
    setMessage('Vielen Dank für die Registrierung!');
    setOpenSnackbar(true); // Snackbar öffnen
    setLoading(false);

    // Weiterleitung zur Login-Seite nach einer kurzen Verzögerung
    setTimeout(() => {
      navigate('/login'); // Weiterleitung zur Login-Seite
    }, 3000); // 3 Sekunden Verzögerung für die Snackbar-Anzeige
  };

  // Funktion zum Schließen der Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 3,
      }}
    >
      {/* Titel der Seite */}
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Courier New, monospace', color: 'primary.main' }}>
        Registrieren
      </Typography>

      {/* Registrierungsformular */}
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* E-Mail Eingabefeld */}
        <TextField
          label="E-Mail"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiInputBase-root': { bgcolor: 'background.paper' },
          }}
        />

        {/* Passwort Eingabefeld */}
        <TextField
          label="Passwort"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiInputBase-root': { bgcolor: 'background.paper' },
          }}
        />

        {/* Spitzname Eingabefeld */}
        <TextField
          label="Spitzname"
          type="text"
          fullWidth
          variant="outlined"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiInputBase-root': { bgcolor: 'background.paper' },
          }}
        />

        {/* Fehlermeldung */}
        {error && (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        )}

        {/* Erfolgsmeldung */}
        {message && (
          <Typography variant="body2" color="success.main" align="center">
            {message}
          </Typography>
        )}

        {/* Registrieren Button mit Ladeanimation */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ height: 48 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Registrieren'}
        </Button>
      </Box>

      {/* Snackbar für Erfolgsmeldung */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Snackbar wird nach 3 Sekunden automatisch geschlossen
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Snackbar wird unten mittig angezeigt
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Registrierung erfolgreich! Weiterleitung zum Login...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;
