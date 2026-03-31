import React, { createContext, useContext } from 'react';
import { useTournamentData, type TournamentData } from '../hooks/useTournamentData';

const TournamentContext = createContext<TournamentData | null>(null);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const data = useTournamentData();
  return (
    <TournamentContext.Provider value={data}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament(): TournamentData {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
}
