var builder = require('botbuilder');

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

var model = 'https://api.projectoxford.ai/luis/v1/application?id=cb2675e5-fbea-4f8b-8951-f071e9fc7b38&subscription-key=3d73cb7b546740c5972d523c4f70c883&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({recognizers: [recognizer]});

bot.dialog('/', dialog);

/*dialog.matches('builtin.intent.alarm.set_alarm', builder.DialogAction.send('Crea alarma'));
dialog.matches('builtin.intent.alarm.delete_alarm', builder.DialogAction.send('Borra alarma'));
dialog.onDefault(builder.DialogAction.send('Pero que dices? solo se crear y borrar alarmas'));*/

dialog.matches('builtin.intent.alarm.set_alarm', [
  (session, args, next) => {
    var title = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
    var time = builder.EntityRecognizer.resolveTime(args.entities);
    var alarm = session.dialogData.alarm = {
      title: title ? title.entity : null,
      timestamp: time ? time.getTime() : null
    };

    if (!alarm.title) {
      builder.Prompts.text(session, 'Como se va a llamar la alarma?');
    } else {
      next()
    }
  },
  (session, result, next) => {
    var alarm = session.dialogData.alarm;
    if (result.response) {
      alarm.title = result.response;
    }

    if (alarm.title && !alarm.timestamp) {
      builder.Prompts.time(session, 'A que hora ponemos la alarma?');
    }else {
      next();
    }
  },
  (session, result, next) => {
    var alarm = session.dialogData.alarm;
    if (result.response) {
      var time = builder.EntityRecognizer.resolveTime([result.response]);
      alarm.timestamp = time ? time.getTime() : null;
    }

    if (alarm.title && alarm.timestamp) {
      alarm.address = session.message.address;
      alarms[alarm.title] = alarm;

      var date = new Date(alarm.timestamp);
      var isAM = date.getHours() < 12;
      session.send('Alarma creada llamada "%s" a las %d/%d/%d %d:%02d%s', alarm.title,
        date.getMonth() + 1, date.getDate(), date.getFullYear(),
        isAM ? date.getHours() : date.getHours() - 12, date.getMinutes(), isAM ? 'am' : 'pm');
    }else {
      session.send('Ya estas');
    }
  }
]);

dialog.matches('builtin.intent.alarm.delete_alarm', [
  (session, args, next) => {
    var title;
    var entity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
    if (entity) {
      title = builder.EntityRecognizer.findBestMatch(alarms, entity.entity)
    }

    if (!title) {
      builder.Prompts.choice(session, 'Cual alarma es la que vas a borrar?', alarms);
    } else {
      next({response: title});
    }
  },
  (session, result) => {
    if (result.response) {
      delete alarms[result.response.entity];
      session.send("Ya se borro la alarma %s", result.response.entity);
    }else {
      session.send('Ya estas tu trancas.');
    }
  }
]);

dialog.onDefault(builder.DialogAction.send('No entendi ni madres, yo solo puedo crear o eliminar alarmas'));

var alarms = {};

setInterval(() => {
  var now = new Date().getTime();
  for (var key in alarms) {
    var alarm = alarms[key];
    if (now >= alarm.timestamp) {
      var msg = new builder.Message()
        .address(alarm.address)
        .text("Hey tu %s alarma", alarm.title);
      bot.send(msg);
      delete alarms[key];
    }
  }
}, 1000);
