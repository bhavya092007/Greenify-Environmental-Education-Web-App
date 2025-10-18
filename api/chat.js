import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // Debug log
    console.log('GROQ_API_KEY:', GROQ_API_KEY ? 'Set' : 'NOT SET');
    console.log('Message:', message);

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GROQ_API_KEY environment variable not set'
      });
    }

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert environmental scientist and sustainability consultant. Answer questions about climate, recycling, renewable energy, water conservation, wildlife, sustainable living, and environmental topics. Be helpful, accurate, and conversational.'
        },
        ...conversationHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const botResponse = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      response: botResponse
    });

  } catch (error) {
    console.error('API Error:', error.response?.status, error.response?.data);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || error.message
    });
  }
}
