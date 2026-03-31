import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { clearMustChangePassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      clearMustChangePassword();
      navigate('/picks', { replace: true });
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)),
          url("${import.meta.env.BASE_URL}background.svg"),
          url("${import.meta.env.BASE_URL}augusta.jpg")`,
        backgroundSize: '100% 100%, 100% 100%, cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 400, mx: 2, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: '#006747', fontWeight: 'bold' }}>
            Set Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Choose a password you'll use going forward
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !password || !confirm}
            sx={{
              backgroundColor: '#006747',
              '&:hover': { backgroundColor: '#005238' },
              py: 1.25,
              fontSize: '1rem',
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Set Password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
