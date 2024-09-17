import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Verwende Link für die Navigation
import { AppBar, Toolbar, Typography, Button, Grid, Box, Card, CardMedia, CardContent } from '@mui/material';

const LandingPage = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log('Fehler beim Abrufen der Sitzung:', error);
      } else {
        setSession(data?.session);
      }
    };

    getSession();

    // AuthStateChange-Listener abonnieren
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Cleanup-Funktion (wenn keine Unsubscribe-Methode erforderlich ist, kann sie entfernt werden)
    return () => {
      // Cleanup-Code entfernt, da unsubscribe möglicherweise nicht erforderlich ist
      console.log('Cleanup durchgeführt, falls nötig.');
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log('Fehler beim Abmelden:', error.message);
    setSession(null);
    alert('Erfolgreich abgemeldet');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'secondary.main' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Courier New, monospace', color: 'white' }}>
            Schnitzeljagd Retro
          </Typography>
          {session !== null ? (
            <>
              <Button color="inherit" component={Link} to="/profil">
                Profil
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Registrieren
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Inhalt der Seite */}
      <Box sx={{ pt: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontFamily: 'Courier New, monospace', mt: 8, color: 'primary.main' }}
        >
          Willkommen zur Schnitzeljagd!
        </Typography>

        {/* Buttons mit Bildern */}
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
          <Grid item>
            <Card sx={{ maxWidth: 300, bgcolor: 'primary.light' }}>
              <CardMedia
                component="img"
                height="200"
                image={`${process.env.PUBLIC_URL}/historik-preview.jpg`} // Pfad auf den Public-Ordner anpassen
                alt="Historik Vorschau"
              />
              <CardContent>
                <Typography variant="h6" align="center" component={Link} to="/historik" sx={{ textDecoration: 'none', color: 'secondary.dark' }}>
                  Historik Geschichte
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card sx={{ maxWidth: 300, bgcolor: 'primary.light' }}>
              <CardMedia
                component="img"
                height="200"
                image={`${process.env.PUBLIC_URL}/piraten-preview.jpg`} // Pfad auf den Public-Ordner anpassen
                alt="Piraten Vorschau"
              />
              <CardContent>
                <Typography variant="h6" align="center" component={Link} to="/piraten" sx={{ textDecoration: 'none', color: 'secondary.dark' }}>
                  Piraten Geschichte
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Infotext */}
        <Typography
          variant="body1"
          align="center"
          sx={{ mt: 4, mx: 'auto', maxWidth: 600, fontFamily: 'Courier New, monospace', color: 'text.secondary' }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum varius ante nec enim tincidunt, non fermentum arcu dignissim. Fusce auctor, lorem in aliquet pretium, ligula purus vulputate orci, id porttitor lorem risus sit amet dolor.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
