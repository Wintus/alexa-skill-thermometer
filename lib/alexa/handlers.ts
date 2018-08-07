import { RequestHandler } from "ask-sdk-core";
import { discomfortIndex } from "../temperature";
import DynamoDB = require("aws-sdk/clients/dynamodb");

const skillName = "Thermometer";

export const GetTempIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "GetTempIntent"
    );
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if (request.type!=='IntentRequest'){
      throw new Error('')
    }
    // const p = request.intent.slots.point.value || 'tokyo';
    const {point, hour, min, temp, humid} = await fetchData("tokyo");
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

let doc: DynamoDB.DocumentClient;

const fetchData = async (point: string) => {
  if (!doc) {
    doc = new DynamoDB.DocumentClient({region: 'ap-northeast-1'})
  }
  const now = (new Date()).getTime() / 1000;
  const data = await doc.query({
      TableName: "tf-temp-log",
      KeyConditionExpression: "#p = :p AND #t < :t",
      ExpressionAttributeNames: {
        "#p": "point_name",
        "#t": "timestamp",
      },
      ExpressionAttributeValues: {
        ":p": point,
        ":t": now,
      },
      ScanIndexForward: false, // desc
      Limit: 1,
    })
    .promise();
  const item = data.Items[0];

  const datetime = new Date(Number.parseInt(item.timestamp));

  return {
    point,
    hour: datetime.getHours(),
    min: datetime.getMinutes(),
    temp: item.temperature,
    humid: item.humidity,
  };
};
