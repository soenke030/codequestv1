import { createTheme } from '@mui/material/styles';

// Retro-Stil-Theme erstellen
const retroTheme = createTheme({
  palette: {
    primary: {
      main: '#ffb703',  // Retro-Gelb/Orange
      light: '#fbf3c2',  // Helles Gelb
    },
    secondary: {
      main: '#8ecae6',  // Dunkelblau
      light: '#8ecae6',  // Hellblau
      dark: '#023e8a',
    },
    background: {
      default: '#fdfcdc',  // Hellbeige als Hintergrundfarbe
    },
    text: {
      primary: '#000000',
      secondary: '#5f6368',
    },
  },
  typography: {
    fontFamily: 'Courier New, monospace',  // Retro-Schriftart
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#ffb703',  // Setzt die Farbe für Links auf das Retro-Gelb/Orange
          textDecoration: 'none', // Entfernt die Standard-Unterstreichung
          '&:hover': {
            textDecoration: 'underline',  // Fügt eine Unterstreichung bei Hover hinzu
            color: '#fbf3c2',  // Ändert die Farbe bei Hover zu Hellgelb
          },
        },
      },
    },
  },
});

export default retroTheme;
