import {
  TurnContext,
  MessageFactory,
  TeamsActivityHandler,
  CardFactory,
  ActionTypes
} from 'botbuilder';
import { XmlEntities } from 'html-entities';

class BotActivityHandler extends TeamsActivityHandler {
  constructor() {
    super();
    /* Conversation Bot */
    /*  Teams bots are Microsoft Bot Framework bots.
        If a bot receives a message activity, the turn handler sees that incoming activity
        and sends it to the onMessage activity handler.
        Learn more: https://aka.ms/teams-bot-basics.

        NOTE:   Ensure the bot endpoint that services incoming conversational bot queries is
                registered with Bot Framework.
                Learn more: https://aka.ms/teams-register-bot. 
    */
    // Registers an activity event handler for the message event, emitted for every incoming message activity.
    this.onMessage(async (context:TurnContext, next:() => Promise<void>) => {
      TurnContext.removeRecipientMention(context.activity);
      const command = context.activity.text.trim()
      switch (true) {
        case /^Hello$/i.test(command):
          await this.mentionActivityAsync(context);
          break;
        default:
          // By default for unknown activity sent by user show
          // a card with the available actions.
          const value = { count: 0 };
          const card = CardFactory.heroCard(
            'Lets talk...',
            undefined,
            [{
              type: ActionTypes.MessageBack,
              title: 'Say Hello',
              value: value,
              text: 'Hello'
            }]);
          await context.sendActivity({ attachments: [card] });
          break;
      }
      await next();
    });
    /* Conversation Bot */
    this.onConversationUpdate(async (context: TurnContext): Promise<void> => {
      if (context.activity.membersAdded && context.activity.membersAdded.length !== 0) {
        for (const idx in context.activity.membersAdded) {
          if (context.activity.membersAdded[idx].id === context.activity.recipient.id) {
            const replyActivity = MessageFactory.text("Welcome!");
            await context.sendActivity(replyActivity);
          }
        }
      }
    });
    this.onMessageReaction(async (context: TurnContext): Promise<void> => {
      const added = context.activity.reactionsAdded;
      if (added && added[0]) {
        await context.sendActivity({
          textFormat: "xml",
          text: `That was an interesting reaction (<b>${added[0].type}</b>)`
        });
      }
    });
  }

  /* Conversation Bot */
  /**
   * Say hello and @ mention the current user.
   */
  async mentionActivityAsync(context:TurnContext) {
    const TextEncoder = XmlEntities;

    const mention = {
      mentioned: context.activity.from,
      text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
      type: 'mention'
    };

    const replyActivity = MessageFactory.text(`Hi ${mention.text}`);
    replyActivity.entities = [mention];

    await context.sendActivity(replyActivity);
  }
  /* Conversation Bot */

}

export { BotActivityHandler };
