import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, AppBar, Toolbar, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import placeholderImage from '../assets/logo.png';
import { BrowserMultiFormatReader } from '@zxing/library';

const PiratenStory = () => {
  const [profile, setProfile] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchProfileAndStory = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          setProfile(profileData);

          const progress = profileData.progress || 0;

          if (progress === 0) {
            navigate('/'); // Weiterleiten zur Landingpage
            return;
          }

          const { data: storyData, error: storyError } = await supabase
            .from('stories')
            .select('content')
            .eq('id', progress)
            .single();

          if (storyError) throw storyError;

          setStoryContent(storyData.content);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Fehler beim Laden des Profils oder der Geschichte:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStory();
  }, [navigate]);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();

      codeReader
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            handleQRCodeScan(result.text);
          }
          if (error) {
            console.error(error);
          }
        })
        .catch((err) => console.error(err));

      return () => {
        codeReader.reset();
      };
    }
  }, [cameraActive]);

  const handleQRCodeScan = async (qrCodeData) => {
    console.log('Gescanntes QR-Code-Daten:', qrCodeData);
    try {
      const url = new URL(qrCodeData);
      const newProgress = url.searchParams.get('progress');

      if (newProgress) {
        const newProgressNumber = parseInt(newProgress, 10);
        if (newProgressNumber === 1) { // Annahme: Der erste QR-Code startet die Geschichte
          if (profile) {
            setLoading(true);
            setCameraActive(false); // Kamera deaktivieren

            // Aktualisiere den Fortschritt in der Datenbank
            await supabase
              .from('profiles')
              .update({ progress: newProgressNumber })
              .eq('id', profile.id);

            // Nach 5 Sekunden zur Piratenstory-Seite weiterleiten
            setTimeout(() => {
              navigate('/piratenstory', { replace: true });
            }, 5000);
          } else {
            alert('Profil nicht gefunden.');
          }
        } else {
          alert('Falscher QR-Code. Bitte scanne den richtigen Code.');
        }
      } else {
        alert('Falscher QR-Code. Bitte scanne den richtigen Code.');
      }
    } catch (err) {
      console.error('Fehler beim Verarbeiten des QR-Codes:', err);
    }
  };

  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (path) => {
    setAnchorEl(null);
    if (path) navigate(path);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography>Lade...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        paddingTop: '64px',
        backgroundColor: '#f0f0f0',
      }}
    >
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Piraten Story
          </Typography>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleMenuClose('/')}>Startseite</MenuItem>
        <MenuItem onClick={() => handleMenuClose('/profile')}>Profil</MenuItem>
      </Menu>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 2,
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            overflow: 'hidden',
            mb: 2,
          }}
        >
          <img 
            src={placeholderImage} 
            alt="Platzhalter" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        <Box
          sx={{
            p: 2,
            mt: 2,
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              wordBreak: 'break-word',
              p: 2,
              overflow: 'visible',
            }}
          >
            {storyContent}
          </Typography>
        </Box>

        <Box mt={3} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Button variant="contained" onClick={toggleCamera} sx={{ mb: 2 }}>
            {cameraActive ? 'Kamera Deaktivieren' : 'Kamera Aktivieren'}
          </Button>
          {cameraActive && (
            <video ref={videoRef} style={{ width: '100%', maxWidth: '500px' }} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PiratenStory;
