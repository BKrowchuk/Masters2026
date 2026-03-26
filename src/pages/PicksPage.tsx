import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Chip,
  Snackbar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import golfers from '../data/golfers.json';

// Tournament lock date — picks close when the Masters begins
const LOCK_DATE = new Date('2026-04-10T08:00:00-04:00');

type GolferEntry = { name: string; group: number };

function buildGroups(players: GolferEntry[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const p of players) {
    if (!map.has(p.group)) map.set(p.group, []);
    map.get(p.group)!.push(p.name);
  }
  return map;
}

export default function PicksPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const isLocked = new Date() >= LOCK_DATE;
  const groups = buildGroups(golfers as GolferEntry[]);
  const sortedGroupNums = Array.from(groups.keys()).sort((a, b) => a - b);
  const totalGroups = sortedGroupNums.length;
  const totalSelected = Object.keys(selections).length;
  const allSelected = totalSelected === totalGroups;

  useEffect(() => {
    if (!user) return;
    loadExistingPicks();
  }, [user]);

  async function loadExistingPicks() {
    setLoadingPicks(true);
    const { data } = await supabase
      .from('picks')
      .select('selections')
      .eq('user_id', user!.id)
      .eq('year', 2026)
      .single();
    if (data?.selections) setSelections(data.selections);
    setLoadingPicks(false);
  }

  function handleSelect(group: number, player: string) {
    if (isLocked) return;
    setSelections((prev) => ({ ...prev, [String(group)]: player }));
  }

  async function handleSave() {
    if (!user || !allSelected || isLocked) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase.from('picks').upsert(
      {
        user_id: user.id,
        year: 2026,
        selections,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,year' }
    );

    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSuccessOpen(true);
    }
  }

  if (loadingPicks) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}>
        <CircularProgress sx={{ color: '#006747' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        pb: 4,
      }}
    >
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
        <Button
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'white', minWidth: 0, px: 1 }}
        >
          Back
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
          My Picks — {profile?.nickname ?? ''}
        </Typography>
        {isLocked ? (
          <Chip icon={<LockIcon />} label="Picks Locked" color="warning" size="small" />
        ) : (
          <Chip
            label={`${totalSelected} / ${totalGroups}`}
            sx={{ bgcolor: allSelected ? '#FFD700' : 'rgba(255,255,255,0.2)', color: allSelected ? '#000' : 'white', fontWeight: 'bold' }}
            size="small"
          />
        )}
      </Box>

      <Box sx={{ maxWidth: 700, mx: 'auto', px: 2, pt: 3 }}>
        {isLocked && (
          <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3 }}>
            The Masters has started — picks are now locked.
          </Alert>
        )}

        {saveError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {saveError}
          </Alert>
        )}

        {sortedGroupNums.map((groupNum, idx) => {
          const players = groups.get(groupNum)!;
          const selected = selections[String(groupNum)];
          return (
            <Paper key={groupNum} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  bgcolor: selected ? '#006747' : '#e0e0e0',
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', color: selected ? 'white' : '#555' }}
                >
                  Group {groupNum}
                </Typography>
                {selected && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {selected}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ px: 2, py: 1 }}>
                <FormControl component="fieldset" disabled={isLocked}>
                  <RadioGroup
                    value={selected ?? ''}
                    onChange={(e) => handleSelect(groupNum, e.target.value)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                      gap: 0,
                    }}
                  >
                    {players.map((player) => (
                      <FormControlLabel
                        key={player}
                        value={player}
                        control={
                          <Radio
                            size="small"
                            sx={{
                              color: '#006747',
                              '&.Mui-checked': { color: '#006747' },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {player}
                          </Typography>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
              {idx < sortedGroupNums.length - 1 && <Divider />}
            </Paper>
          );
        })}

        {!isLocked && (
          <Box sx={{ position: 'sticky', bottom: 16, mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSave}
              disabled={!allSelected || saving}
              sx={{
                bgcolor: '#006747',
                '&:hover': { bgcolor: '#005238' },
                '&.Mui-disabled': { bgcolor: '#ccc' },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {saving ? (
                <CircularProgress size={22} sx={{ color: 'white' }} />
              ) : allSelected ? (
                'Save Picks'
              ) : (
                `Select ${totalGroups - totalSelected} more group${totalGroups - totalSelected !== 1 ? 's' : ''}`
              )}
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Picks saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
