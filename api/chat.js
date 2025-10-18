export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'GROQ_API_KEY not configured'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': Bearer ${GROQ_API_KEY},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert environmental scientist and sustainability consultant. Answer questions about climate, recycling, renewable energy, water conservation, wildlife, sustainable living, and environmental topics. Be helpful, accurate, and conversational.'
          },
          ...(Array.isArray(conversationHistory) ? conversationHistory : []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API Error:', response.status, errorData);
      return res.status(500).json({
        success: false,
        error: Groq API error: ${response.status}
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from Groq'
      });
    }

    const botResponse = data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      response: botResponse
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
}
