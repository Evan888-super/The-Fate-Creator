const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api/grok' 
  : 'https://your-production-backend.com/api/grok';

export const generateAlternateHistory = async (conversation) => {
  // conversation = array of previous messages (user + assistant alternated)
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'grok-4-fast-reasoning',
      messages: [
        { role: 'system', content: 'You are Grok, a masterful storyteller of alternate histories. Respond with vivid, detailed, historically plausible narratives that explore realistic technological, strategic, political, and cultural consequences. Write in an engaging, novel-like style. When the user is continuing a previous scenario, seamlessly pick up exactly where the last response left off without summarizing or repeating prior events.' }, // Your system prompt
        ...conversation
      ],
      temperature: 0.9,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Raw text for debugging
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = {};
    }
    console.error('Grok API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      body: errorData || errorText,
    });
    throw new Error(errorData.error?.message || `Grok API request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};