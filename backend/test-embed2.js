import { config } from 'dotenv';
config();

async function testEmbedding() {
  const text = "Hello world";
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      }),
    },
  );
  console.log(response.status);
  const body = await response.json();
  console.log('Embedding length:', body.embedding?.values?.length);
}

testEmbedding();
