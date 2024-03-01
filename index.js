const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require("openai");
const axios = require('axios');

const app = express();
const port = 8000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function secureInput(prompt) {
  try {
    const response = await axios.post('https://pillarseclabs.com/api/v1/scan/prompt', {
      message: prompt,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PILLAR_API_KEY}`
      }
    });

    let detectedIssues = [];
    Object.entries(response.data).forEach(([key, value]) => {
      if (value) detectedIssues.push(key)
    });
    if (detectedIssues.length > 0) {
      throw new Error(`Threat detected in user input: ${detectedIssues.join(', ')}`);
    }

    return prompt;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function secureOutput(openaiResponse) {
  try {
    const response = await axios.post('https://pillarseclabs.com/api/v1/scan/response', {
      message: openaiResponse.choices[0].message.content,
      scanners: {
        pii: true,
        secrets: true,
        toxic_language: true,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PILLAR_API_KEY}`
      }
    });

    let detectedIssues = [];
    Object.entries(response.data).forEach(([key, value]) => {
      if (value) detectedIssues.push(key)
    });
    if (detectedIssues.length > 0) {
      throw new Error(`Threat detected in LLM response: ${detectedIssues.join(', ')}`);
    }

    return openaiResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function agent(prompt) {
  const securePrompt = await secureInput(prompt);
  try {
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant. Only use the functions you have been provided with.`,
      },
      {
        role: "user",
        content: securePrompt,
      }
    ];

    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
      });

      const secureResponse = await secureOutput(response);

      const { finish_reason, message } = secureResponse.choices[0];

      if (finish_reason === "stop") {
        messages.push(message);
        return message.content;
      }
    }
    return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";
  } catch (error) {
    throw new Error('Error in agent function: ' + error.message);
  }
}

// Endpoint to interact with the agent
app.post('/interact', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await agent(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
