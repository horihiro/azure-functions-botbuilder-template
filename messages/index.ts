import { AzureFunction, Context } from "@azure/functions"

import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
// Import bot definitions
import { BotActivityHandler } from './botActivityHandler';
import { WebRequest, WebResponse } from './WebMessages';

const adapter = new BotFrameworkAdapter({
  // Set botId/password
  appId: process.env.BotId,
  appPassword: process.env.BotPassword
});

adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Create bot handlers
const botActivityHandler = new BotActivityHandler();

const httpTrigger: AzureFunction = async function (context: Context) {
  const req = new WebRequest(context);
  const res = new WebResponse(context);
  await adapter.processActivity(req, res, async (context: TurnContext) => {
    // Process bot activity
    await botActivityHandler.run(context);
  });
};

export default httpTrigger;
