export interface LyricsSubmission {
  songTitle: string;
  albumName?: string;
  lyrics: string;
  submitterEmail: string;
}

export interface LyricsSubmissionResponse {
  success: boolean;
  message: string;
}