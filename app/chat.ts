"use server";

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { DallEAPIWrapper } from "@langchain/openai";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "path";
import { z, ZodSchema } from "zod";
import { printNode, zodToTs } from "zod-to-ts";
import { Situation, ZSituation } from "../schema/situation";
import logger from "../src/logger";
import { graph } from "../src/model";

const mainThread: RunnableConfig = { configurable: { thread_id: "main" } };

interface StreamOutput {
  messages: BaseMessage[];
}
interface StreamUpdates {
  [node: string]: {
    messages: BaseMessage[];
  };
}

const ZToolCall = z.object({
  id: z.string(),
  name: z.string(),
  args: z.record(z.any()),
});

const ZJsonMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("human"), content: z.string(), id: z.string() }),
  z.object({ type: z.literal("system"), content: z.string(), id: z.string() }),
  z.object({
    type: z.literal("ai"),
    content: z.string(),
    outcome: z.string(), // we just pull out the message part to render efficiently
    id: z.string(),
    toolCalls: ZToolCall.array().optional(),
  }),
  z.object({
    type: z.literal("tool"),
    content: z.string(),
    id: z.string(),
    toolCallId: z.string(),
  }),
]);

export type Message = z.infer<typeof ZJsonMessage>;

export interface Updates {
  messages: Message[];
  situation: Situation;
}

let sentInstructions = false;

function generateId() {
  return new Date().toString();
}

async function getInstructions(): Promise<BaseMessage[]> {
  const gameInstructions = await readFile("prompts/instructions.md", "utf-8");
  const responseInstructions =
    `## Response Format\n\nRespond only as a JSON document, and strictly conform to the following TypeScript schema, paying attention to comments as additional requirements:\n` +
    printNode(zodToTs(ZSituation).node);
  return [
    new SystemMessage(gameInstructions),
    new SystemMessage(responseInstructions),
  ];
}

async function send(
  messages: BaseMessage[],
  config = mainThread,
): Promise<Message[]> {
  if (!sentInstructions) {
    sentInstructions = true;
    try {
      // feed instructions and the saved messages if any
      await loadGame();
    } catch (error) {
      // probably no saved game, that's ok
      console.warn(error);
    }
  }

  const stream = await graph.invoke(
    { messages },
    { streamMode: ["updates"], ...config },
  );

  const response: BaseMessage[] = [];
  for await (const [kind, data] of stream) {
    switch (kind) {
      case "values":
        response.push(...(data as StreamOutput).messages);
        break;
      case "updates":
        const updates = data as StreamUpdates;
        for (const value of Object.values(updates)) {
          for (const message of value.messages) {
            logger.info(message);
            response.push(message);
          }
        }
        break;
      case "debug":
        logger.info(data);
        break;
      default:
        logger.warn(`unknown update: ${kind}`);
    }
  }

  return response.map((m): Message => {
    const id = m.id ?? generateId();
    const content = m.content.toString();
    switch (m.getType()) {
      case "human":
        return {
          type: "human",
          content,
          id,
        };
      case "system":
        return {
          type: "system",
          content,
          id,
        };
      case "tool":
        return {
          type: "tool",
          content,
          id,
          toolCallId: (m as ToolMessage).tool_call_id,
        };
      case "ai":
        return {
          type: "ai",
          content,
          outcome: "",
          id,
          toolCalls: (m as AIMessage).tool_calls?.map((tc) => ({
            id: tc.id ?? generateId(),
            name: tc.name,
            args: tc.args,
          })),
        };
      default:
        throw new Error();
    }
  });
}

export async function regen() {
  let config = mainThread;
  let history = graph.getStateHistory(config);
  for await (const state of history) {
    const messages: BaseMessage[] = state.values["messages"];
    const lastMessage = messages[messages.length - 1];
    if (["human", "system"].includes(lastMessage?.getType())) {
      return send([], state.config);
    }
  }
  throw new Error("no human or system messages found in history");
}

function parseJson(json: string): unknown {
  if (json[0] !== "{") {
    // sometimes it wraps it in markdown ticks or something, clean that up
    json = json.substring(json.indexOf("{"), json.lastIndexOf("}") + 1);
  }
  return JSON.parse(json);
}

export async function request<T extends ZodSchema>(
  schema: T,
  prompt: string,
  validate?: (response: T) => string | undefined,
): Promise<[Message[], z.infer<T>]> {
  let message = prompt;
  let parsed: T | undefined;
  let tries = 0;
  let response = [] as Message[];
  while (parsed === undefined && tries < 3) {
    console.log(message);
    response = await send([new HumanMessage(message)]);
    ++tries;
    let json = response.findLast((m) => m.type === "ai")!.content;
    console.log(json);
    let preparse: unknown;
    try {
      preparse = parseJson(json);
    } catch (error) {
      message =
        "Response was not a valid JSON object. Please check the syntax carefully and try again.";
      continue;
    }
    try {
      parsed = schema.parse(preparse);
    } catch (error) {
      message = `Please fix this error: ${error}`;
      continue;
    }
    if (validate && parsed) {
      const error = validate(parsed);
      if (error) {
        console.log(error);
        parsed = undefined; // clear it to loop
        message = `Please fix this error: ${error}`;
      }
    }
  }
  if (parsed === undefined) {
    throw new Error(`Max retries exceeded on request: ${prompt}`);
  }
  return [response, parsed];
}

export async function sendMessage(
  message: string,
  situation: Situation,
): Promise<Updates> {
  if (message.startsWith("/")) {
    switch (message) {
      case "/regen":
        const messages = await regen();
        return { messages, situation };
      default:
        return {
          messages: [
            {
              id: generateId(),
              type: "system",
              content: `Command "${message}" was not understood.`,
            },
          ],
          situation,
        };
    }
  } else {
    const [messages, newSituation] = await request(ZSituation, message);
    for (const message of messages) {
      if (message.type === "ai" && message.content.length > 0) {
        // this has already passed validation so just cast it
        message.outcome = (parseJson(message.content) as Situation).outcome;
      }
    }
    return {
      messages,
      situation: { ...situation, ...newSituation },
    };
  }
}

const ZSaveGame = z.object({
  messages: ZJsonMessage.array(),
  situation: ZSituation,
  images: z.record(z.string()),
});

interface SaveGame extends z.infer<typeof ZSaveGame> {}

export async function saveGame(
  game: SaveGame,
  filename = "game.json",
): Promise<void> {
  return await writeFile(filename, JSON.stringify(game), "utf-8");
}

export async function loadGame(filename = "game.json"): Promise<SaveGame> {
  try {
    const json = await readFile(filename, "utf-8");
    const game = ZSaveGame.parse(JSON.parse(json));
    const graphMessages = game.messages.map((m) => {
      switch (m.type) {
        case "ai":
          return new AIMessage({
            id: m.id,
            content: m.content,
            tool_calls: m.toolCalls,
          });
        case "human":
          return new HumanMessage({ id: m.id, content: m.content });
        case "system":
          return new SystemMessage({ id: m.id, content: m.content });
        case "tool":
          return new ToolMessage({
            id: m.id,
            content: m.content,
            tool_call_id: m.toolCallId,
          });
      }
    });
    await graph.updateState(mainThread, {
      messages: [...(await getInstructions()), ...graphMessages],
    });
    return game;
  } catch (error) {
    // just feed the instructions
    await graph.updateState(mainThread, {
      messages: await getInstructions(),
    });
    throw error;
  }
}

async function downloadFile(
  url: string,
  outputFilePath: string,
): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const dir = path.dirname(outputFilePath);
    await mkdir(dir, { recursive: true });
    await writeFile(outputFilePath, buffer);
    console.log(`Downloaded successfully to: ${outputFilePath}`);
  } catch (error) {
    console.error(`Failed to download: ${error}`);
  }
}

export async function generateImage(name: string, prompt: string) {
  const tool = new DallEAPIWrapper({
    n: 1,
    modelName: "dall-e-3",
    openAIApiKey: process.env.OPENAI_API_KEY,
    size: "1024x1024",
  });

  const imageURL = await tool.invoke(prompt);
  await downloadFile(imageURL, `generated_images/${name}.png`);
  return encodeURI(`/images/${name}.png`);
}
