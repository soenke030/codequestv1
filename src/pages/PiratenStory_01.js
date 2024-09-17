import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { BrowserMultiFormatReader } from '@zxing/library';
import placeholderImage from '../assets/logo.png'; // Ersetze diesen Pfad mit dem tatsächlichen Pfad zu deinem Platzhalterbild

const PiratenStory01 = () => {
  const [profile, setProfile] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [qrCodeResult, setQrCodeResult] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [hint, setHint] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

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

          if (profileData.progress < 1) {
            navigate('/');
            return;
          }

          const { data: storyData, error: storyError } = await supabase
            .from('stories')
            .select('content')
            .eq('id', 1)
            .single();

          if (storyError) throw storyError;

          setStoryContent(storyData.content);
        } else {
          navigate('/');
        }
      } catch (err) {
        setError(err.message || 'Fehler beim Laden des Profils oder der Geschichte.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStory();
  }, [navigate]);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      codeReader
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            setQrCodeResult(result.text);
            console.log('QR-Code erfasst:', result.text); // Debugging-Ausgabe
            handleQRCodeScan(result.text);
          }
          if (error) {
            console.error('QR Code Scanner Error:', error);
          }
        })
        .catch((err) => console.error('QR Code Reader Error:', err));
    } else if (!cameraActive && codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [cameraActive]);

  const handleQRCodeScan = async (qrCodeData) => {
    console.log('Verarbeite QR-Code-Daten:', qrCodeData); // Debugging-Ausgabe

    try {
      const url = new URL(qrCodeData);
      const progress = url.searchParams.get('progress');

      if (progress === '2') {
        if (!profile) {
          console.error('Kein Profil geladen.');
          return;
        }

        console.log('Aktualisiere Fortschritt auf 2'); // Debugging-Ausgabe

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ progress: 2 })
          .eq('id', profile.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setProfile(updatedProfile);

        console.log('Aktualisierter Fortschritt:', updatedProfile.progress); // Debugging-Ausgabe

        if (updatedProfile.progress === 2) {
          navigate('/piratenstory_02');
        } else {
          alert('Fortschritt konnte nicht aktualisiert werden.');
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

  const handleHintRequest = async () => {
    setOpenDialog(true);
  };

  const fetchHint = async () => {
    try {
      const { data: hintData, error: hintError } = await supabase
        .from('hints')
        .select('content')
        .eq('story_id', 1) // Ändere dies entsprechend der aktuellen Geschichte
        .single();

      if (hintError) throw hintError;
      setHint(hintData.content);
    } catch (err) {
      console.error('Fehler beim Laden des Hinweises:', err);
    }
  };

  const handleDialogClose = (confirm) => {
    if (confirm) {
      fetchHint();
    }
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography>Lade...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Fehler: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      px={3}
    >
      <Typography variant="h4" gutterBottom>
        Piraten Story 01
      </Typography>
      
      {/* Platzhalterbild */}
      <Box 
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          overflow: 'hidden',
          mb: 2
        }}
      >
        <img 
          src={placeholderImage} 
          alt="Platzhalter" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      
      {/* Sprechblasen-Stil Box für den Text */}
      <Box
        sx={{
          position: 'relative',
          p: 2,
          mt: 2,
          maxWidth: '600px',
          minHeight: '200px',
          borderRadius: '8px',
          backgroundColor: '#f0f0f0',
          boxShadow: 3,
          overflowY: 'auto',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: '100%',
            left: '20px',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '10px solid #f0f0f0',
          }
        }}
      >
        <Typography variant="body1">
          {storyContent}
        </Typography>
      </Box>

      <Box mt={3} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button variant="contained" onClick={toggleCamera} sx={{ mb: 2 }}>
          {cameraActive ? 'Kamera Deaktivieren' : 'Kamera Aktivieren'}
        </Button>
        {cameraActive && (
          <video ref={videoRef} style={{ width: '100%' }} />
        )}
        <Button variant="contained" onClick={handleHintRequest} sx={{ mt: 2 }}>
          Hinweis erhalten
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Hinweis Anfordern</DialogTitle>
        <DialogContent>
          <Typography>Willst du wirklich einen Hinweis erhalten? Dies kann deinen Fortschritt beeinflussen.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Abbrechen
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary">
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>

      {hint && (
        <Box mt={3}>
          <Typography variant="h6">Hinweis:</Typography>
          <Typography>{hint}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default PiratenStory01;
