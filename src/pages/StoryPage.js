import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';

const StoryPage = () => {
  const { storyId } = useParams(); // Story-ID aus der URL
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (error) throw error;

        setStory(data);
      } catch (err) {
        setError(err.message || 'Fehler beim Laden der Geschichte.');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography>Lade die Geschichte...</Typography>
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
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Courier New, monospace', color: 'primary.main' }}>
        {story.title}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {story.content}
      </Typography>
    </Box>
  );
};

export default StoryPage;
