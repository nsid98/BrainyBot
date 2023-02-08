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
var completion;
app.event('app_mention', async({event, context, client, say}) => {
  try {

    const result = await client.conversations.replies({
      channel: event.channel,
      ts: event.thread_ts
    });

    var text = "";
    for(var i = 0; i < result.messages.length-1; i++){
      const userResult = await client.users.info({
        user: result.messages[i].user
      });
      text= text+ `${userResult.user.real_name} says ${result.messages[i].text} . `;

      if(i==result.messages.length-2){
        console.log(text)
        completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `summarize the following conversation in point form: \n ${text}`,
          temperature: 0.7,
          max_tokens: 256,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          });
        console.log(completion.data.choices)
        await say("Here is the answer, " + completion.data.choices[0].text)
      }
    }
  }
  
  catch (error) {
    console.error(error);
  }
});
(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();