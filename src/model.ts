import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import tools from "./tools/index";

const modelType = z
  .enum(["openai", "ollama"])
  .parse(process.env.MODEL_TYPE ?? "openai");
const modelName = process.env.MODEL_NAME || "gpt-4o-mini";

let model: BaseChatModel;

if (modelType === "ollama") {
  // For tool usage, qwen2.5 seems far better than any other model I've found.
  // The 3b model doesn't manage to build tool calls very well syntactically but 14b+ is pretty reliable.
  // llama3.2:3b seems to build correct JSON tool calls often but forgets the tool_call protocol.
  model = new ChatOllama({
    model: modelName,
    temperature: 0.8,
    numCtx: 64 * 1024,
  });
} else if (modelType === "openai") {
  model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: modelName,
  });
}

export const graph = createReactAgent({
  llm: model!,
  tools,
  checkpointSaver: new MemorySaver(),
});
