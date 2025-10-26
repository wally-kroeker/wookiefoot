#!/usr/bin/env node

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs'); // Import the fs module

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification about new lyrics submission
 * @param {Object} submission - The lyrics submission data
 * @param {string} submission.songTitle - Title of the song
 * @param {string} submission.albumName - Name of the album (optional)
 * @param {string} submission.submitterEmail - Email of the person submitting
 * @param {string} submission.lyrics - The submitted lyrics
 * @param {string} filePath - Path to the saved submission file
 */
async function notifyLyricsSubmission(submission, filePath) {
  const emailContent = `
New Lyrics Submission Received!

Song Title: ${submission.songTitle}
Album Name: ${submission.albumName || 'Not specified'}
Submitted By: ${submission.submitterEmail}
Submission Time: ${new Date().toLocaleString()}

Submission File: ${filePath}

Review Instructions:
1. Review the submitted lyrics in the submissions folder
2. Verify accuracy and formatting
3. If approved, move the file to the appropriate album folder in src/content/lyrics/
4. Update the song index if needed

Lyrics Preview:
-------------
${submission.lyrics.slice(0, 500)}${submission.lyrics.length > 500 ? '...' : ''}
`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'wallyk@gmail.com',
      subject: `New Lyrics Submission: ${submission.songTitle}`,
      text: emailContent
    });
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
}

// If script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: notify-lyrics-submission.js <submission-file-path>');
    process.exit(1);
  }

  const submissionPath = args[0];
  // Read file content instead of requiring it
  const submissionContent = fs.readFileSync(submissionPath, 'utf8');
  // Parse frontmatter (assuming YAML-like format)
  const frontmatterRegex = /^---([\s\S]*?)---/;
  const frontmatterMatch = submissionContent.match(frontmatterRegex);
  let submissionData = {};
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    // Simple parsing - you might need a YAML parser for more robust parsing
    frontmatter.split('\n').forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        submissionData[key] = value.replace(/^"|"$/g, ''); // Remove quotes
      }
    });
  }
  const lyrics = submissionContent.replace(frontmatterRegex, '').trim();

  notifyLyricsSubmission({ ...submissionData, lyrics }, submissionPath)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = notifyLyricsSubmission;
