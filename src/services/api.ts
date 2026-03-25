import axios from 'axios';
import { Player } from '../types';

const API_BASE_URL = 'https://api.masters.com'; // Replace with actual API endpoint

export const fetchMastersLeaderboard = async (): Promise<Player[]> => {
  try {
    // This is a placeholder. You'll need to replace this with the actual API endpoint
    // and handle any authentication requirements
    const response = await axios.get(`${API_BASE_URL}/leaderboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Masters leaderboard:', error);
    // For development, return mock data
    return [
      {
        id: '1',
        name: 'Scottie Scheffler',
        rounds: { round1: -6, round2: -3, round3: -2, round4: -4 },
        total: -15,
        position: 1,
      },
      {
        id: '2',
        name: 'Rory McIlroy',
        rounds: { round1: -4, round2: -2, round3: -3, round4: -5 },
        total: -14,
        position: 2,
      },
      // Add more mock players as needed
    ];
  }
}; 