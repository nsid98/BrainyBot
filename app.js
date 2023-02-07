import { Configuration, OpenAIApi } from "openai";
import pkg from '@slack/bolt';
const { App } = pkg;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const configuration = new Configuration({
});

const openai = new OpenAIApi(configuration);

// const completion = await openai.createCompletion({
//   model: "text-davinci-003",
//   prompt: `Summarize the Harry Potter series in a paragraph.`,
//   temperature: 0.6,
// });

// console.log(completion.data.choices[0].text);

app.message('hello', async ({ message, say }) => {
  
  // say() sends a message to the channel where the event was triggered
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message.text,
    temperature: 0.6,
  });
  console.log(completion.data.choices)
  await say(`Here is the answer, \n ${completion.data.choices[0].text}`);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();