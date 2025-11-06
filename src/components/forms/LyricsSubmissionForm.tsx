'use client';

import { useState } from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import type { LyricsSubmission } from '@/types/lyrics-submission';

interface FormState {
  isSubmitting: boolean;
  error?: string;
  success?: string;
}

interface LyricsSubmissionFormProps {
  songTitle: string;
  albumName?: string;
}

export function LyricsSubmissionForm({ songTitle, albumName = '' }: LyricsSubmissionFormProps) {
  const [formData, setFormData] = useState<LyricsSubmission>({
    songTitle,
    albumName,
    lyrics: '',
    submitterEmail: '',
  });

  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.lyrics.trim()) {
      setFormState({ isSubmitting: false, error: 'Lyrics are required' });
      return;
    }
    if (!formData.submitterEmail.trim()) {
      setFormState({ isSubmitting: false, error: 'Email is required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitterEmail)) {
      setFormState({ isSubmitting: false, error: 'Please enter a valid email address' });
      return;
    }

    setFormState({ isSubmitting: true });

    try {
      const response = await fetch('/api/lyrics-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit lyrics');
      }

      setFormState({
        isSubmitting: false,
        success: 'Thank you! Your lyrics submission has been received.',
      });
      
      // Reset form except for song title and album
      setFormData({
        songTitle,
        albumName,
        lyrics: '',
        submitterEmail: '',
      });
    } catch (error) {
      setFormState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit lyrics',
      });
    }
  };

  const inputClasses = "w-full px-3 py-2 bg-gray-700/90 border border-accent-green/20 rounded focus:outline-none focus:border-accent-green/40 text-retro-paper placeholder-retro-paper/50";

  return (
    <RetroCard variant="secondary" className="w-full p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-retro-paper text-center mb-6">
          Submit Missing Lyrics
        </h2>

        {formState.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm">
            {formState.error}
          </div>
        )}

        {formState.success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded text-sm">
            {formState.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="songTitle" className="block text-sm font-medium text-retro-paper/80 mb-1">
              Song Title
            </label>
            <input
              type="text"
              id="songTitle"
              value={formData.songTitle}
              className={`${inputClasses} bg-gray-800/90`}
              onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="albumName" className="block text-sm font-medium text-retro-paper/80 mb-1">
              Album Name
            </label>
            <input
              type="text"
              id="albumName"
              value={formData.albumName}
              className={`${inputClasses} bg-gray-800/90`}
              onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="submitterEmail" className="block text-sm font-medium text-retro-paper/80 mb-1">
              Your Email *
            </label>
            <input
              type="email"
              id="submitterEmail"
              value={formData.submitterEmail}
              onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-retro-paper/80 mb-1">
              Lyrics *
            </label>
            <textarea
              id="lyrics"
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              className={`${inputClasses} min-h-[200px]`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full btn-retro disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formState.isSubmitting ? 'Submitting...' : 'Submit Lyrics'}
          </button>
        </form>
      </div>
    </RetroCard>
  );
}