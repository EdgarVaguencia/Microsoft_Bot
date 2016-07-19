var builder = require('botbuilder');

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

/**
 * Bot basico que nos devulve un msg
 */
/* bot.dialog('/', function(session) {
  session.send('Buenos días maestro pokémon');
}); */

/**
 * Bot que interactua devolviendo el texto que le pasemos siguiendo una secuencia (waterfall)
 */
/* bot.dialog('/', [
  function (session) {
    builder.Prompts.text(session, 'Hola maestro pokémon, ¿cual es tu nombre?');
  },
  function (session, result) {
    session.send('Bienvenido %s', result.response);
  }
]); */

/**
 * Bot que almacena la información que nos solicita a travez de una secuencia determinada
 */
bot.dialog('/', [
  (session, args, next) =>  {
    if (!session.userData.name) {
      session.beginDialog('/profile');
    } else {
      next();
    }
  },
  (session, result) => {
    session.send('Hola %s', session.userData.name);
  }
]);
bot.dialog('/profile', [
  (session) => {
    builder.Prompts.text(session, 'Cual es tu color favorito?');
  },
  (session, result) => {
    session.userData.name = result.response;
    session.endDialog();
  }
]);
