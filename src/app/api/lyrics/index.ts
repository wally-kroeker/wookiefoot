import { NextApiRequest, NextApiResponse } from 'next';

const mockSongIndex = [
  {
    Album: 'Ready or Not...',
    Year: '2023',
    'Song Title': 'Song 1',
    'Track Number': '1',
    'Has Lyrics': 'Yes',
  },
  {
    Album: 'Ready or Not...',
    Year: '2023',
    'Song Title': 'Song 2',
    'Track Number': '2',
    'Has Lyrics': 'No',
  },
  // Add more mock entries as needed
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ songs: mockSongIndex });
}