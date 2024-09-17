import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const UpdateProgress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateProgress = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const progress = urlParams.get('progress');

      if (progress) {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;

          if (user) {
            await supabase
              .from('profiles')
              .update({ progress: parseInt(progress, 10) })
              .eq('id', user.id);

            navigate('/piraten'); // Weiterleitung zur PiratenStory-Seite
          } else {
            navigate('/');
          }
        } catch (err) {
          setError(err.message || 'Fehler beim Aktualisieren des Fortschritts.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Kein Fortschritt angegeben.');
        setLoading(false);
      }
    };

    updateProgress();
  }, [navigate]);

  if (loading) {
    return <div>Lade...</div>;
  }

  if (error) {
    return <div>Fehler: {error}</div>;
  }

  return <div>Fortschritt aktualisiert!</div>;
};

export default UpdateProgress;
