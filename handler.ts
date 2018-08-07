import "source-map-support/register";
import Alexa = require("ask-sdk-core");
import { RequestEnvelope } from "ask-sdk-model";
import { Callback, Context, Handler } from "aws-lambda";
import { GetTempIntentHandler } from "./lib/alexa/handlers";

const skillName = "Thermometer";

// singleton
let skill: Alexa.Skill;

export const handler: Handler = (
  event: RequestEnvelope,
  _ctx: Context,
  _cb: Callback
) => {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        GetTempIntentHandler
      )
      .create();
  }
  return skill.invoke(event);
};

const LaunchRequestHandler = {
  canHandle: handlerInput =>
    handlerInput.requestEnvelope.request.type === "LaunchRequest",
  handle: handlerInput => {
    const speechText =
      "今の温度をたずねるには、「アレクサ、温度計で今の温度を教えて」と話しかけてください。";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(skillName, speechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "「アレクサ、温度計で今の温度を教えて」と話しかけてください。";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(skillName, speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "AMAZON.CancelIntent" ||
        request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "さようなら";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(skillName, speechText)
      .getResponse();
  }
};
