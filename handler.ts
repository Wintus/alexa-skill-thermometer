import "source-map-support/register";
import { Handler } from "aws-lambda";
import { RequestEnvelope, ResponseEnvelope } from "ask-sdk-model";
import { handlers } from "./alexa";
import Alexa = require("ask-sdk-core");

// reuse
const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(...handlers)
  .create();

export const handler: Handler<
  RequestEnvelope,
  ResponseEnvelope
> = async event => await skill.invoke(event);
