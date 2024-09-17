import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import placeholderImage from '../assets/logo.png'; // Ersetze diesen Pfad mit dem tatsächlichen Pfad zu deinem Platzhalterbild

const PiratenStory05 = () => {
  const [profile, setProfile] = useState(null);
  const [storyContent, setStoryContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

          if (profileData.progress < 4) {
            navigate('/');
            return;
          }

          const { data: storyData, error: storyError } = await supabase
            .from('stories')
            .select('content')
            .eq('id', 5)
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

  const handleBackToStart = async () => {
    if (profile) {
      // Setze den Fortschritt auf 0 zurück
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ progress: 0 })
          .eq('id', profile.id);

        if (error) throw error;

        // Navigiere zur Startseite
        navigate('/');
      } catch (err) {
        console.error('Fehler beim Zurücksetzen des Fortschritts:', err);
      }
    } else {
      navigate('/');
    }
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
        Herzlichen Glückwunsch!
      </Typography>
      
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
        <Button variant="contained" onClick={handleBackToStart} sx={{ mb: 2 }}>
          Zur Startseite
        </Button>
      </Box>
    </Box>
  );
};

export default PiratenStory05;
