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
    const index = discomfortIndex(temp, humid);
    const feel = feeling(index);
    const text =
      `${point}の${hour}時${min}分現在の温度は${temp}度、湿度は${humid}%です。` +
      `不快指数は${index}です。${feel}`;

    return handlerInput.responseBuilder
      .speak(text)
      .withSimpleCard(skillName, text)
      .getResponse();
  }
};

// index = discomfort index
const feeling = (index: number) => {
  if (85 <= index) {
    return "暑くてたまらないですねー";
  } else if (80 <= index && index < 85) {
    return "暑くて汗が出ますねー";
  } else if (75 <= index && index < 80) {
    return "ちょっと暑いですねー";
  } else if (70 <= index && index < 75) {
    return "暑くはないですねー";
  } else if (65 <= index && index < 70) {
    return "過ごしやすいですねー";
  } else if (60 <= index && index < 65) {
    return "何も感じません。";
  } else if (65 <= index && index < 70) {
    return "少し肌寒いですね。";
  } else if (index < 55) {
    return "寒いです…";
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
