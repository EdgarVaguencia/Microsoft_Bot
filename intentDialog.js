var builder = require('botbuilder');

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();

bot.dialog('/', intents);

intents.matches(/^change name/i, [
  (session) => {
    session.beginDialog('/profile');
  },
  (session, result) => {
    session.send('Muy bien... parace que a hora decisite cambiar de nombre por el de %s', session.userData.name);
  }
]);

intents.onDefault([
  (session, args, next) => {
    if (!session.userData.name) {
      session.beginDialog('/profile');
    }else {
      next();
    }
  },
  (session, result) => {
    session.send('Hola %s', session.userData.name);
  }
]);

bot.dialog('/profile', [
  (session) => {
    builder.Prompts.text(session, 'Hola, ¿cual es tu nombre?');
  },
  (session, result) => {    
    if (result.response) {
      session.userData.name = result.response;
      session.endDialog();
    }else {
      session.beginDialog('/profile');
    }
  }
]);
