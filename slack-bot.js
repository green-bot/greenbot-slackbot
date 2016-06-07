var CHANNEL_ID = process.env.SLACK_CHANNEL_ID 
if (!CHANNEL_ID) {
  throw new Error('SLACK_CHANNEL_ID env variable not defined')
}

if (!process.env.SLACK_API_TOKEN) {
    console.log('Error: Specify SLACK_API_TOKEN in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
    debug: false,
    log: false
});

var bot = controller.spawn({
    token: process.env.SLACK_API_TOKEN
}).startRTM();

controller.on('ambient,mention,direct_mention,direct_message', function(bot, message) {
  console.log(message.text)
})

var readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var handleChoice = function() {
  readLine.question('', function(answer) {
    if(answer === 'quit'){
      readline.close()
      return
    }
    bot.say({
      text: answer,
      channel: CHANNEL_ID
    });
    handleChoice();
  })
}

handleChoice();
