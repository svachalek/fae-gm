import {
  AIMessage,
  BaseMessage,
  MessageContent,
  MessageContentText,
} from "@langchain/core/messages";
import chalk from "chalk";
import { createInterface } from "readline/promises";
import wordwrap from "wordwrap";
import logger from "./logger";

const debug = true;

export function printMessage(message: BaseMessage) {
  logger.info({
    type: message.getType(),
    content: message.content,
    tool_calls: message instanceof AIMessage ? message.tool_calls : undefined,
  });
  if (message.content !== "") {
    let text: string;
    switch (message.getType()) {
      case "tool":
      case "system":
      case "human":
        if (debug) {
          display(message.content, "gray");
        }
        break;
      case "ai":
        display(message.content, "white");
        break;
      default:
        console.error("unexpected message type", message);
    }
  }
}

export function printMessages(messages: BaseMessage[]) {
  for (const message of messages) {
    printMessage(message);
  }
}

interface StreamOutput {
  messages: BaseMessage[];
}

export interface Updates {
  [node: string]: {
    messages: BaseMessage[];
  };
}

export async function printStream(stream: AsyncIterable<[string, unknown]>) {
  let accepted = true;
  for await (const [kind, data] of stream) {
    switch (kind) {
      case "values":
        printMessages((data as StreamOutput).messages);
        break;
      case "updates":
        const updates = data as Updates;
        for (const value of Object.values(updates)) {
          for (const message of value.messages) {
            const messageString =
              typeof message.content === "string"
                ? message.content
                : message.content
                    .filter((m) => m.type === "text")
                    .map((m) => (m as MessageContentText).text)
                    .join(" ");
            if (messageString.includes("tool_call")) {
              printMessage(message);
              accepted = false;
            } else {
              printMessage(message);
            }
          }
        }
        break;
      case "debug":
        logger.info(data);
        break;
      default:
        console.warn(`unknown update: ${kind}`);
    }
  }
  return accepted;
}

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (text: string) => string ? K : never;
}[keyof T];

export function display(
  text: MessageContent,
  color: FunctionPropertyNames<typeof chalk>,
) {
  console.log(wordwrap(process.stdout.columns)(chalk[color](text)));
}

export function announce(text: string) {
  display(text, "blue");
}

export function remind(text: string) {
  display(text, "gray");
}

const reader = createInterface({
  input: process.stdin,
  output: process.stdout,
}).on("close", () => {
  console.log("<eof>");
  process.exit(0);
});

export async function readHuman() {
  return reader.question(chalk.green("> "));
}

export function printError(error: unknown) {
  console.error(chalk.red("Error:"), error);
}
