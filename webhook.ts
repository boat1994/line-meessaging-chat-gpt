import * as express from 'express';
import * as line from '@line/bot-sdk';
import * as openai from 'openai';

const app = express();

// Replace these values with your own LINE Channel ID and Secret Key
const lineConfig = {
    channelId: 'YOUR_LINE_CHANNEL_ID',
    channelSecret: 'YOUR_LINE_CHANNEL_SECRET',
    channelAccessToken: 'YOUR_LINE_CHANNEL_ACCESS_TOKEN'
};

// Replace these values with your own OpenAI API Key and Model ID
const openaiConfig = {
    apiKey: 'YOUR_OPENAI_API_KEY',
    modelId: 'YOUR_GPT3_MODEL_ID'
};

// Initialize the LINE SDK
const lineClient = new line.Client(lineConfig);

// Initialize the OpenAI client
const openaiClient = new openai.Client(openaiConfig);

// Set up the webhook
app.post('/webhook', line.middleware(lineConfig), (req, res) => {
    // Parse the incoming message
    const event = req.body.events[0];
    if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;
        const message = event.message.text;

        // Send the message to GPT-3 for processing
        openaiClient.completions
            .create({
                prompt: message,
                model: openaiConfig.modelId,
                max_tokens: 2048,
                temperature: 0.5,
            })
            .then((response) => {
                // Send the response back to the user
                return lineClient.pushMessage(userId, {
                    type: 'text',
                    text: response.choices[0].text,
                });
            })
            .catch((error) => {
                console.error(error);
                return lineClient.pushMessage(userId, {
                    type: 'text',
                    text: 'Error: Could not process your message.',
                });
            });
    }

    // Send a 200 OK response to acknowledge receipt of the event
    res.sendStatus(200);
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});


