import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useNavigate } from 'react-router-dom'; // Import für die Navigation

const Piraten = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Ladezustand
  const [error, setError] = useState(null); // Fehlerzustand
  const [map, setMap] = useState(null); // Zustand für die Karte
  const [cameraActive, setCameraActive] = useState(false); // Zustand für die Kamera
  const videoRef = useRef(null); // Ref für das Video-Element
  const navigate = useNavigate(); // Hook für Navigation

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          setProfile(profile);
        } else {
          setError('Benutzer nicht authentifiziert.');
        }
      } catch (err) {
        setError(err.message || 'Fehler beim Laden des Profils.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Initialisiere die Leaflet-Karte nur, wenn sie noch nicht existiert
    if (profile && profile.progress === 0 && !map) {
      const initializedMap = L.map('map').setView([53.691712548796104, 7.802534736928744], 15);

      // OpenStreetMap-Tiles hinzufügen
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(initializedMap);

      // Marker hinzufügen
      L.marker([53.691712548796104, 7.802534736928744]).addTo(initializedMap)
        .bindPopup('Startpunkt der Piratengeschichte')
        .openPopup();

      setMap(initializedMap); // Karte speichern
    }
  }, [profile, map]);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();

      codeReader
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            handleQRCodeScan(result.text); // Verwende handleQRCodeScan zur Weiterleitung
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
  }, [cameraActive, videoRef.current]);

  const handleQRCodeScan = async (qrCodeData) => {
    try {
      if (qrCodeData) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ progress: profile.progress + 1 }) // Fortschritt um 1 erhöhen
          .eq('id', profile.id)
          .select(); // `.select()` anstelle von `.single()`

        if (error) throw error;

        if (data && data.length > 0) {
          setProfile(data[0]);
          // Navigieren basierend auf dem neuen Fortschritt
          navigateToStory(data[0].progress);
        } else {
          console.error('Keine Daten zurückgegeben oder kein Profil gefunden.');
        }
      }
    } catch (err) {
      console.error('Fehler beim Verarbeiten des QR-Codes:', err);
    }
  };

  const navigateToStory = (progress) => {
    switch (progress) {
      case 1:
        navigate('/piratenstory_01');
        break;
      case 2:
        navigate('/piratenstory_02');
        break;
      case 3:
        navigate('/piratenstory_03');
        break;
      case 4:
        navigate('/piratenstory_04');
        break;
      case 5:
        navigate('/piratenstory_05');
        break;
      default:
        navigate('/piraten'); // Standard-Seite oder eine Fehlerseite
        break;
    }
  };

  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

  // Lade- und Fehlerzustände behandeln
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography>Lade dein Profil...</Typography>
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
        Die Piraten Geschichte
      </Typography>

      {profile ? (
        <Box>
          <Typography variant="h6">Willkommen, {profile.email}. Dein Fortschritt: {profile.progress}/5 Anlaufpunkte</Typography>
          
          {profile.progress === 0 && (
            <Box mt={3} width="100%">
              <Typography variant="h6">Gehe zum Startpunkt, um die Geschichte zu beginnen!</Typography>
              <Box id="map" mt={2} sx={{ width: '100%', height: '400px', borderRadius: '10px', boxShadow: 3 }}></Box>
              <Typography mt={2}>
                Standort: <strong>53.691712548796104, 7.802534736928744</strong>
              </Typography>
              <Typography>Scanne den QR-Code, um den ersten Punkt zu aktivieren!</Typography>
              
              {/* QR-Code-Scanner */}
              <Box mt={2} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button variant="contained" onClick={toggleCamera} sx={{ mb: 2 }}>
                  {cameraActive ? 'Kamera Deaktivieren' : 'Kamera Aktivieren'}
                </Button>
                {cameraActive && (
                  <video ref={videoRef} style={{ width: '100%' }} />
                )}
              </Box>
            </Box>
          )}

          {profile.progress > 0 && (
            <Box mt={3}>
              <Typography>Du hast bereits begonnen! Gehe zum nächsten Punkt, um fortzufahren.</Typography>
              <Button variant="contained" onClick={() => navigateToStory(profile.progress)} sx={{ mt: 2 }}>
                Weiter zum nächsten Punkt
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Typography>Profil konnte nicht geladen werden.</Typography>
      )}
    </Box>
  );
};

export default Piraten;
