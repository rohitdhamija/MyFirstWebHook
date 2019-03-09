const OracleBot = require('@oracle/bots-node-sdk');
const { WebhookClient, WebhookEvent } = OracleBot.Middleware;

module.exports = (app) => {
  var self = this;


  this.randomIntInc = function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
  };    
    
  const logger = console;
  // initialize the application with OracleBot
  OracleBot.init(app, {
    logger,
  });

  // add webhook integration
  const webhook = new WebhookClient({
    channel: {
      url: process.env.BOT_WEBHOOK_URL,
      secret: process.env.BOT_WEBHOOK_SECRET,
    }
  });
  // Add webhook event handlers (optional)
  webhook
    .on(WebhookEvent.ERROR, err => logger.error('Error:', err.message))
    .on(WebhookEvent.MESSAGE_SENT, message => logger.info('Message to bot:', message))
    .on(WebhookEvent.MESSAGE_RECEIVED, message => {
      // message was received from bot. forward to messaging client.
      logger.info('Message from bot:', message);
      // TODO: implement send to client...
    });

  // Create endpoint for bot webhook channel configurtion (Outgoing URI)
  // NOTE: webhook.receiver also supports using a callback as a replacement for WebhookEvent.MESSAGE_RECEIVED.
  //  - Useful in cases where custom validations, etc need to be performed.
  app.post('/bot/receivemessage', webhook.receiver());
  
  //TESTER
  app.get('/bot/tester', (req, res) => {
    const { user, text } = {user: "Frank", text: req.query.text};
    // construct message to bot from the client message format
    const MessageModel = webhook.MessageModel();
    const message = {
      userId: user,
      messagePayload: MessageModel.textConversationMessage(text)
    };


    // send to bot webhook channel
    webhook.send(message)
      .then(() => res.send('ok'), e => res.status(400).end(e.message));
  });
  

  // Integrate with messaging client according to their specific SDKs, etc.
  app.post('/bot/sendmessage', (req, res) => {
    const { user, text } = req.body;
    logger.info("req.body"+JSON.stringify(req.body));
    // construct message to bot from the client message format
    const MessageModel = webhook.MessageModel();
    const message = {
      userId: self.randomIntInc(1000000, 9999999).toString();,
      messagePayload: MessageModel.textConversationMessage(text)
    };
    // send to bot webhook channel
    webhook.send(message)
      .then(() => res.send('ok'), e => res.status(400).end(e.message));
  });
}