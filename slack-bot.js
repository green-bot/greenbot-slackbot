var ANNOUNCE_CHANNEL_NAME = process.env.SLACK_ANNOUNCE_CHANNEL
var SESSION_CHANNEL_NAME = process.env.SRC 
var SLACK_API_TOKEN = process.env.SLACK_API_TOKEN

if (!ANNOUNCE_CHANNEL_NAME) {
  throw new Error('SLACK_ANNOUNCE_CHANNEL env variable not defined')
}

if (!process.env.SLACK_API_TOKEN) {
  console.log('Error: Specify SLACK_API_TOKEN in environment');
  process.exit(1);
}

var slack = require('slack')

var tryCreateChannel = function(channelName) {
  return new Promise(function(resolve, reject) {
    slack.channels.create({token: SLACK_API_TOKEN, name: channelName}, function(err, data) {
      if (err) {
        var errIsNameTaken = err.toString().indexOf('name_taken') > -1
        if (errIsNameTaken) {
          resolve()
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    })
  })
}

var joinChannel = function(channelName) {
  return new Promise(function(resolve, reject) {
    slack.channels.join({token: SLACK_API_TOKEN, name: channelName}, function(err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.channel)
      }
    })
  })
}

var createAndJoinChannel = function(channelName) {
  return tryCreateChannel(channelName).then(function() {
    return joinChannel(channelName)
  })
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

function announce() {
  joinChannel(ANNOUNCE_CHANNEL_NAME).then(function(channel) {
    bot.say({
      text: "New conversation in #" + SESSION_CHANNEL_NAME,
      channel: channel.id
    });
  })
}

// delay a little bit so rtm connection can get established
setTimeout(announce, 1000)

var readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var handleChoice = function(channel) {
  readLine.question('', function(answer) {
    bot.say({
      text: answer,
      channel: channel.id
    });
    handleChoice(channel);
  })
}

createAndJoinChannel(SESSION_CHANNEL_NAME).then(function(channel) { 
  controller.on('ambient,mention,direct_mention,direct_message', function(bot, message) {
    if (message.channel === channel.id ) {
      console.log(message.text)
    }
  })
  handleChoice(channel);
})
