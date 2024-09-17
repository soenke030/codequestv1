import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { TextField, Button, Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate für Weiterleitung verwenden

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // State für die Snackbar
  const navigate = useNavigate(); // Hook für Navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Versuche den Benutzer einzuloggen
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Einloggen fehlgeschlagen. Überprüfe deine E-Mail und dein Passwort.');
      setLoading(false);
      return;
    }

    // Hole die Benutzerinformationen
    const user = data?.user;

    if (!user) {
      setError('Fehler: Benutzerinformationen konnten nicht abgerufen werden.');
      setLoading(false);
      return;
    }

    console.log('Eingeloggter Benutzer:', user); // Debugging: Benutzerinformationen überprüfen

    // Profil überprüfen und ggf. anlegen
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // Nur fortfahren, wenn der Fehler NICHT "No rows found" ist
      console.log('Fehler beim Abrufen des Profils:', profileError.message);
      setError('Fehler beim Abrufen des Profils.');
      setLoading(false);
      return;
    }

    if (!profile) {
      // Profil erstellen, falls es nicht existiert
      console.log('Profil nicht gefunden, erstelle ein neues Profil mit den folgenden Daten:');
      console.log({
        id: user.id,
        email: user.email,
        nickname: null,
        progress: 0,
      });

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          id: user.id, // Verwende die Benutzer-ID
          email: user.email, 
          story: null, // Setze Standardwerte
          progress: 0,
          nickname: null, 
        }]);

      if (insertError) {
        console.log('Fehler beim Erstellen des Profils:', insertError.message);
        setError('Fehler beim Erstellen des Profils.');
        setLoading(false);
        return;
      }

      console.log('Profil erfolgreich erstellt');
    } else {
      console.log('Profil existiert bereits:', profile); // Profil existiert bereits
    }

    // Erfolgsmeldung in Snackbar anzeigen
    setOpenSnackbar(true);

    // Weiterleitung zur LandingPage nach kurzer Verzögerung
    setTimeout(() => {
      navigate('/'); // Weiterleitung zur LandingPage
    }, 3000); // 3 Sekunden Verzögerung für die Snackbar-Anzeige

    setLoading(false);
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
        Login
      </Typography>

      {/* Login Formular */}
      <Box
        component="form"
        onSubmit={handleLogin}
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

        {/* Fehlermeldung */}
        {error && (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        )}

        {/* Login Button mit Ladeanimation */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ height: 48 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
        </Button>
      </Box>

      {/* Link zur Registrierung */}
      <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
        Noch kein Konto? <Link to="/register">Hier registrieren</Link>
      </Typography>

      {/* Snackbar für Erfolgsmeldung */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} // Snackbar wird nach 3 Sekunden automatisch geschlossen
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Snackbar wird unten mittig angezeigt
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Login erfolgreich! Weiterleitung...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
