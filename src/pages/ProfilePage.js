import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, CircularProgress, Avatar, Snackbar, Alert } from '@mui/material';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(''); // Für das Profilbild
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar-Status
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Nachricht für die Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar-Typ (success/error)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login');
        return;
      }

      const user = session?.user;
      if (!user) {
        setError('Benutzer nicht gefunden.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError('Fehler beim Abrufen des Profils.');
        return;
      }

      setProfile(profile);
      setNickname(profile.nickname || '');
      setAvatarUrl(profile.avatar_url || ''); // Setze das Profilbild
    };

    fetchProfile();
  }, [navigate]);

  // Funktion zum Hochladen des Bildes
  const uploadAvatar = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`; // Bild mit Benutzer-ID speichern
      const filePath = `${fileName}`;

      // Datei hochladen
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) {
        setSnackbarSeverity('error');
        setSnackbarMessage('Fehler beim Hochladen des Bildes.');
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      // Bild-URL in der profiles Tabelle speichern
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', profile.id);

      if (updateError) {
        setSnackbarSeverity('error');
        setSnackbarMessage('Fehler beim Speichern des Profilbildes.');
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      setAvatarUrl(filePath); // Zeige das neue Bild an
      setSnackbarSeverity('success');
      setSnackbarMessage('Profilbild erfolgreich hochgeladen!');
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Fehler beim Hochladen des Bildes.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Speichern des Spitznamens
  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', profile.id);

    if (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Fehler beim Speichern des Spitznamens.');
      setOpenSnackbar(true);
      return;
    }

    // Snackbar bei Erfolg anzeigen und Weiterleitung zur LandingPage
    setSnackbarSeverity('success');
    setSnackbarMessage('Spitzname erfolgreich gespeichert! Weiterleitung zur Startseite...');
    setOpenSnackbar(true);

    // Weiterleitung zur LandingPage nach 3 Sekunden
    setTimeout(() => {
      navigate('/');
    }, 3000);
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
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Courier New, monospace', color: 'primary.main' }}>
        Benutzerprofil
      </Typography>

      {/* Fehlermeldung */}
      {error && (
        <Typography variant="body2" color="error" align="center">
          {error}
        </Typography>
      )}

      {profile ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <Typography variant="body1" align="center">
            Email: {profile.email}
          </Typography>

          {/* Nickname Eingabe */}
          <TextField
            label="Spitzname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiInputLabel-root': { color: 'text.secondary' },
              '& .MuiInputBase-root': { bgcolor: 'background.paper' },
            }}
          />

          {/* Profilbild hochladen */}
          <label htmlFor="avatar-upload">
            <Typography variant="body1">Profilbild hochladen:</Typography>
            <input
              type="file"
              accept="image/*"
              id="avatar-upload"
              onChange={uploadAvatar}
              disabled={loading}
              style={{ display: 'none' }}
            />
            <Button variant="contained" component="span">
              Bild auswählen
            </Button>
          </label>

          {avatarUrl && (
            <Avatar
              src={`${supabase.storage.from('profile-images').getPublicUrl(avatarUrl).data.publicUrl}`}
              alt="Profilbild"
              sx={{ width: 150, height: 150, mx: 'auto', mt: 2 }}
            />
          )}

          {/* Speichern Button */}
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Speichern'}
          </Button>
        </Box>
      ) : (
        <Typography variant="body1" align="center">
          Profil wird geladen...
        </Typography>
      )}

      {/* Snackbar für Erfolg/Fehler-Meldungen */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
