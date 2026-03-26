import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [nickname, setNickname] = useState(searchParams.get('u') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(nickname.trim(), password);
    setLoading(false);
    if (error) {
      setError('Invalid nickname or password. Please try again.');
    } else {
      navigate('/picks');
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
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          mx: 2,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: '#006747', fontWeight: 'bold' }}>
            Masters Pool 2026
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sign in to submit your picks
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nickname"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            autoFocus={!nickname}
            sx={{ mb: 2 }}
            inputProps={{ autoCapitalize: 'off', autoCorrect: 'off' }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus={!!nickname}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !nickname || !password}
            sx={{
              backgroundColor: '#006747',
              '&:hover': { backgroundColor: '#005238' },
              py: 1.25,
              fontSize: '1rem',
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
          </Button>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, textAlign: 'center' }}
        >
          Didn't receive credentials? Contact the pool admin.
        </Typography>
      </Paper>
    </Box>
  );
}
