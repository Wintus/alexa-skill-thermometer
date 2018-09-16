import { RequestHandler } from "ask-sdk-core";
import { DynamoDB } from "aws-sdk";
import { discomfortIndex } from "./lib/temperature";
import Speech = require("ssml-builder");

const skillName = "Thermometer";

const LaunchRequestHandler: RequestHandler = {
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
  },
};

const HelpIntentHandler: RequestHandler = {
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
  },
};

const CancelAndStopIntentHandler: RequestHandler = {
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
    const speech = new Speech();
    speech.sayAs({
      word: speechText,
      interpret: "interjection",
    });

    return handlerInput.responseBuilder
      .speak(speech.ssml(true))
      .withSimpleCard(skillName, speechText)
      .getResponse();
  },
};

const GetTempIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "GetTempIntent"
    );
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if (request.type !== "IntentRequest") {
      throw new Error("invalid request");
    }

    const point = getPoint(request);
    const { hour, min, temp, humid } = await fetchData(point);
    const index = discomfortIndex(temp, humid);
    const feel = feeling(index);

    const text = `${point}の${hour}時${min}分現在の温度は${temp}度、湿度は${humid}%です。不快指数は${index}です。${feel}`;

    return handlerInput.responseBuilder
      .speak(text)
      .withSimpleCard(skillName, text)
      .getResponse();
  },
};

// TODO
const getPoint = request => {
  if (request) {
    // ok
  }
  return "tokyo";
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

const doc = new DynamoDB.DocumentClient({ region: "ap-northeast-1" });

const fetchData = async (point: string) => {
  const data = await doc
    .query({
      TableName: "tf_temp_log",
      KeyConditionExpression: "#p = :p",
      ExpressionAttributeNames: {
        "#p": "point_name",
      },
      ExpressionAttributeValues: {
        ":p": point,
      },
      ScanIndexForward: false, // desc
      Limit: 1,
    })
    .promise();
  const item = data.Items[0];

  const datetime = new Date(Number.parseInt(item.timestamp) * 1000);

  return {
    hour: datetime.getHours(),
    min: datetime.getMinutes(),
    temp: item.temperature,
    humid: item.humidity,
  };
};

export const handlers: RequestHandler[] = [
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  GetTempIntentHandler,
];
