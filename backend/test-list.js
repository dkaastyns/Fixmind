import { config } from 'dotenv';
config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  );
  const body = await response.json();
  const models = body.models.map(m => m.name).filter(m => m.includes('embed'));
  console.log(models);
}

listModels();
