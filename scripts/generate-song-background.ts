import fs from 'fs';
import path from 'path';
import Together from 'together-ai';

const together = new Together();

async function generateBackground() {
  const lyricsPath = path.join(__dirname, '../src/content/lyrics/you-re-it/you\'re-it!.md');
  const lyricsContent = fs.readFileSync(lyricsPath, 'utf-8');
  const lyrics = lyricsContent.split('---')[2].trim();

  const response = await together.images.create({
    model: 'black-forest-labs/FLUX.1-depth',
    width: 1024,
    height: 1024,
    steps: 28,
    prompt: lyrics,
  });

  const imageUrl = response.data[0].url;
  const imagePath = path.join(__dirname, '../public/assets/backgrounds/you-re-it.jpg');
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(imagePath, imageBuffer);

  console.log(`Background image generated and saved to ${imagePath}`);
}

generateBackground().catch(console.error);