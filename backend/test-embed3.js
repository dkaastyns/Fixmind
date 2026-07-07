import { config } from 'dotenv';
config();

async function testEmbedding() {
  const text = "Hello world";
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text }] },
      }),
    },
  );
  const body = await response.json();
  console.log('gemini-embedding-2 length:', body.embedding?.values?.length);
}

testEmbedding();
