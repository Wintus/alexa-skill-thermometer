import { RequestHandler } from "ask-sdk-core";

const skillName = "Thermometer";

export const GetTempIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "GetTempIntent"
    );
  },
  handle(handlerInput) {
    const { point, hour, min, temp, humid } = dummyData();
    const text = `${point}の${hour}時${min}分現在の温度は${temp}度、湿度は${humid}%です。`;

    return handlerInput.responseBuilder
      .speak(text)
      .withSimpleCard(skillName, text)
      .getResponse();
  }
};

const dummyData = () => {
  const point = "Tokyo";
  const hour = 12;
  const min = 34;
  const temp = 23.4;
  const humid = 56;

  return { point, hour, min, temp, humid };
};
