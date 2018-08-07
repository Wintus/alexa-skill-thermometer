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
      .addRequestHandlers(dummyHandler)
      .create();
  }
  return skill.invoke(event);
};

const dummyHandler: RequestHandler = {
  canHandle: (_handlerInput: HandlerInput) => true, // catch all
  handle: (handlerInput: HandlerInput) =>
    handlerInput.responseBuilder.speak("ダミー").getResponse()
};
