import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import PiratenStory from './pages/PiratenStory';
import HistorikStory from './pages/HistorikStory';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import 'leaflet/dist/leaflet.css';
import UpdateProgress from './pages/UpdateProgress';
import Piraten from './pages/Piraten';
import PiratenStory1 from './pages/PiratenStory_01'
import PiratenStory2 from './pages/PiratenStory_02'
import PiratenStory3 from './pages/PiratenStory_03'
import PiratenStory4 from './pages/PiratenStory_04'
import PiratenStory5 from './pages/PiratenStory_05'




// Styles für Seiten
import './styles/LoginPage.css';

// MUI Imports
import { ThemeProvider } from '@mui/material/styles';
import retroTheme from './theme';  // Importiere dein Retro-Theme


function App() {
  return (
    // ThemeProvider um die gesamte App legen, damit das Theme überall verfügbar ist
    <ThemeProvider theme={retroTheme}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/piratenstory" element={<PiratenStory />} />
          <Route path="/historik" element={<HistorikStory />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/update-progress" element={<UpdateProgress />} />
          <Route path="/piraten" element={<Piraten />} />
          <Route path="/PiratenStory_01" element={<PiratenStory1 />} />
          <Route path="/PiratenStory_02" element={<PiratenStory2 />} />
          <Route path="/PiratenStory_03" element={<PiratenStory3 />} />
          <Route path="/PiratenStory_04" element={<PiratenStory4 />} />
          <Route path="/PiratenStory_05" element={<PiratenStory5 />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
