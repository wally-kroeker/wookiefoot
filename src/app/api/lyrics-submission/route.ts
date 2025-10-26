import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { LyricsSubmission } from '@/types/lyrics-submission';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const submission: LyricsSubmission = await request.json();

    // Validate required fields
    if (!submission.songTitle || !submission.lyrics || !submission.submitterEmail) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.submitterEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create markdown content
    const timestamp = new Date().toISOString();
    const markdownContent = `---
songTitle: "${submission.songTitle}"
albumName: "${submission.albumName || ''}"
submitterEmail: "${submission.submitterEmail}"
submittedAt: "${timestamp}"
---

${submission.lyrics}
`;

    // Generate unique filename
    const safeTitle = submission.songTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `${safeTitle}-${Date.now()}.md`;
    const submissionsDir = join(process.cwd(), 'public/content/submissions');
    const filePath = join(submissionsDir, filename);

    // Ensure submissions directory exists
    await writeFile(filePath, markdownContent);

    // Trigger email notification
    const scriptPath = join(process.cwd(), 'scripts/notify-lyrics-submission.cjs');
    await execAsync(`node scripts/notify-lyrics-submission.cjs ${filePath}`);

    return NextResponse.json({
      success: true,
      message: 'Lyrics submitted successfully'
    });
  } catch (error) {
    console.error('Error handling lyrics submission:', error);
    return NextResponse.json(
      { message: 'Failed to process submission' },
      { status: 500 }
    );
  }
}