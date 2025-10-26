const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function generateBackground() {
  const lyricsPath = path.join(__dirname, '../src/content/lyrics/you-re-it/you\'re-it!.md');
  const lyricsContent = fs.readFileSync(lyricsPath, 'utf-8');
  const lyrics = lyricsContent.split('---')[2].trim();
  const prompt = `Psychedelic image: ${lyrics}`;

  console.log('Generating image with prompt:', prompt);

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer 6f2c2b561f83b082abe87bcbe4ef744be225d7dd117f0e5a1c52958bbf10ef83'
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      steps: 4,
      n: 1,
      height: 1024,
      width: 1024,
      guidance: 3.5,
      prompt: prompt
    })
  };

  const response = await fetch('https://api.together.xyz/v1/images/generations', options);
  const data = await response.json();

  console.log('API response:', data);

  const imageUrl = data.data[0].url;
  const backgroundsDir = path.join(__dirname, '../public/assets/backgrounds');
  console.log('Backgrounds directory:', backgroundsDir);
  if (!fs.existsSync(backgroundsDir)) {
    console.log('Creating backgrounds directory...');
    fs.mkdirSync(backgroundsDir, { recursive: true });
  }
  const imagePath = path.join(backgroundsDir, 'you-re-it.jpg');
  console.log('Image path:', imagePath);
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(imagePath, imageBuffer);

  console.log(`Background image generated and saved to ${imagePath}`);
}

generateBackground().catch(console.error);