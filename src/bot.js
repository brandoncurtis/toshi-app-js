const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')
const ID = require('./lib/IdService')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  welcome(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'test':
      test(session)
      break
    case 'newvote':
      count(session)
      break
    case 'vote':
      donate(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  let userId = session.get('tokenId')
  ID.getUser(userId).then((user) => { 
    let userName = formatName(user);
    let msg = 'Hello ' + userName + ', system online!';
    sendMessage(session, msg) })
  }
}

function test(session) {
  let userId = session.get('tokenId');
  let msg = 'voting system is online!';
  sendMessage(session, msg)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}

// HELPERS

function formatName(user) {
  if (!user) {
    return "<Unknown>";
  } else if (user.name) {
    return user.name + " (@" + user.username + ")";
  } else if (user.username) {
    return "@" + user.username;
  } else {
    return "<Unknown>";
  }
}

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Test', value: 'test'},
    {type: 'button', label: 'New Vote', value: 'newvote'},
    {type: 'button', label: 'Existing Vote', value: 'vote'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
