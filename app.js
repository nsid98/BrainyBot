import { Configuration, OpenAIApi } from "openai";
import pkg from '@slack/bolt';
import { config } from "dotenv";
const { App } = pkg;

config()

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.API_KEY
});

const openai = new OpenAIApi(configuration);
var completion;

//triggers when the bot is called from a slack channel
app.event('app_mention', async({event, context, client, say}) => {
  try {

    //call Slack API to get all messages from a thread
    const result = await client.conversations.replies({
      channel: event.channel,
      ts: event.thread_ts
    });

    var text = "";
    var users = {};
    //accumulate prompt for openAI by looping through all messages in thread except for the last one, since that is the one that called BrainyBot
    for(var i = 0; i < result.messages.length-1; i++){

      //if we have already queried the Slack API for the user then grab the user_name from the dictionary, else query the Slack API for the user_name and store it in the dictionary
      var user_name="";
      if(result.messages[i].user in users){
        user_name=users[result.messages[i].user];
      }
      else{
        const userResult = await client.users.info({
          user: result.messages[i].user
        });
        users[result.messages[i].user]=userResult.user.real_name;
      }
      text= text+ `${user_name} says ${result.messages[i].text} . `;
    }

    // query the OpenAI API to summarize the text 
    completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `In bullet points, summarize the following conversation: \n ${text}`,
      temperature: 0.75,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      });

    //send response from the OpenAI API back to the Slack thread it was sent from
    await client.chat.postMessage({
      channel: event.channel,
      text: "Here is the summary, " + completion.data.choices[0].text,
      thread_ts: event.thread_ts
    });
  }
  
  catch (error) {
    console.error(error);
  }
});
(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();