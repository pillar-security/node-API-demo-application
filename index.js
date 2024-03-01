const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require("openai");

const app = express();
const port = 8000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function agent(prompt) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant. Only use the functions you have been provided with.`,
      },
      {
        role: "user",
        content: prompt,
      }
    ];

    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
      });

      const { finish_reason, message } = response.choices[0];

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
