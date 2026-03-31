import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { TournamentProvider } from './contexts/TournamentContext.tsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006400', // Masters green
    },
    secondary: {
      main: '#ffd700', // Gold
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <TournamentProvider>
            <App />
          </TournamentProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
