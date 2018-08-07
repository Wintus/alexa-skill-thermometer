import Alexa = require("ask-sdk-core");
import { IntentRequest } from "ask-sdk-model";
import { discomfortIndex } from "../temperature";

export const DiscomfortIndexHandler: Alexa.RequestHandler = {
  canHandle: handlerInput => {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "DiscomfortIndex"
    );
  },
  handle: handlerInput => {
    const request = handlerInput.requestEnvelope.request;
    if (request.type !== "IntentRequest") {
      console.debug(request);
      throw new Error(`must be DiscomfortIndex but: ${request.type}`);
    }
    console.debug(request.intent);

    const { temperature, humidity } = request.intent.slots;
    const t = Number.parseFloat(temperature.value);
    const h = Number.parseInt(humidity.value);
    const index = discomfortIndex(t, h);

    return handlerInput.responseBuilder
      .speak(`不快指数は、${index}です。`)
      .getResponse();
  }
};
