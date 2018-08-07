import 'source-map-support/register'
import Alexa = require("ask-sdk-core");
import { RequestHandler, HandlerInput } from "ask-sdk-core";
import { RequestEnvelope } from "ask-sdk-model";
import { Callback, Context, Handler } from "aws-lambda";

// singleton
let skill: Alexa.Skill;

export const handler: Handler = (
  event: RequestEnvelope,
  _ctx: Context,
  _cb: Callback
) => {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(LaunchRequestHandler)
      .create();
  }
  return skill.invoke(event);
};

const LaunchRequestHandler = {
  canHandle: handlerInput => handlerInput.requestEnvelope.request.type === 'LaunchRequest',
  handle: handlerInput => {
    const re_prompt = '今の温度をたずねるには、「アレクサ、温度計で今の温度を教えて」と話しかけてください。';
    return handlerInput.responseBuilder
      .speak(re_prompt)
      .reprompt(re_prompt)
      .getResponse();
  }
};
