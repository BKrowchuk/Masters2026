import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAuth } from '../contexts/AuthContext';
import { supabase, nicknameToEmail, type Profile } from '../lib/supabase';

type UserRow = Profile & { has_picks: boolean };

export default function AdminPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [nickname, setNickname] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    const { data: profiles } = await supabase.from('profiles').select('*').order('nickname');
    const { data: picks } = await supabase.from('picks').select('user_id').eq('year', 2026);
    const pickSet = new Set((picks ?? []).map((p: { user_id: string }) => p.user_id));
    setUsers(
      (profiles ?? []).map((p: Profile) => ({ ...p, has_picks: pickSet.has(p.id) }))
    );
    setLoadingUsers(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname) return;
    setCreating(true);
    setCreateError(null);
    setTempPassword(null);

    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      if (!res.ok) {
        const body = await res.text();
        try {
          setCreateError(JSON.parse(body).error ?? `Server error (${res.status})`);
        } catch {
          setCreateError(`Server error (${res.status}). Make sure you're running on Vercel.`);
        }
        setCreating(false);
        return;
      }
      var result = await res.json();
    } catch (err) {
      setCreateError('Network error — the /api/create-user endpoint is only available when deployed to Vercel.');
      setCreating(false);
      return;
    }

    setCreating(false);
    if (result.error) {
      setCreateError(result.error);
    } else {
      const created = nickname.trim();
      setNickname('');
      setTempPassword(result.tempPassword);
      setSuccessMsg(`User "${created}" created.`);
      setSuccessOpen(true);
      loadUsers();
    }
  }

  function loginLink(nick: string) {
    const base = window.location.origin;
    return `${base}/login?u=${encodeURIComponent(nick)}`;
  }

  function copyLink(nick: string) {
    navigator.clipboard.writeText(loginLink(nick));
    setSuccessMsg('Link copied to clipboard!');
    setSuccessOpen(true);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#006747',
          color: 'white',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} sx={{ color: 'white', px: 1 }}>
          Back
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Admin — User Management
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, pt: 3 }}>
        {/* Create user form */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#006747', fontWeight: 'bold', mb: 2 }}>
            Create New User
          </Typography>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}
          {tempPassword && (
            <Alert severity="info" sx={{ mb: 2 }} onClose={() => setTempPassword(null)}>
              <strong>Temporary password:</strong> {tempPassword}<br />
              Share this with the user. They will be prompted to set their own password on first login.
            </Alert>
          )}
          <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              size="small"
              sx={{ flex: '1 1 200px' }}
              helperText="Shown on the leaderboard"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={creating || !nickname}
              sx={{ bgcolor: '#006747', '&:hover': { bgcolor: '#005238' }, alignSelf: 'flex-start', mt: 0.25 }}
            >
              {creating ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Create'}
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Users table */}
        <Typography variant="h6" sx={{ color: '#006747', fontWeight: 'bold', mb: 2 }}>
          Users ({users.length})
        </Typography>
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#006747' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#006747' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nickname</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Picks (2026)</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Login Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{u.nickname}</TableCell>
                    <TableCell>
                      {u.is_admin && <Chip label="Admin" size="small" sx={{ bgcolor: '#FFD700', fontWeight: 'bold', fontSize: '0.7rem' }} />}
                    </TableCell>
                    <TableCell>
                      {u.has_picks ? (
                        <Chip label="Submitted" color="success" size="small" />
                      ) : (
                        <Chip label="No picks" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={loginLink(u.nickname)}>
                        <IconButton size="small" onClick={() => copyLink(u.nickname)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
