import Markdown from "react-markdown";
import { z } from "zod";
import { Message } from "./chat";

const ZMetadata = z.object({
  tokenUsage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
  finish_reason: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    prompt_tokens_details: z.object({
      cached_tokens: z.number(),
      audio_tokens: z.number(),
    }),
    completion_tokens_details: z.object({
      reasoning_tokens: z.number(),
      audio_tokens: z.number(),
      accepted_prediction_tokens: z.number(),
      rejected_prediction_tokens: z.number(),
    }),
  }),
  system_fingerprint: z.string().optional(),
});

interface Metadata extends z.infer<typeof ZMetadata> {}

export default function MessageBox({ message }: { message: Message }) {
  let metadata: Metadata | undefined = undefined;
  // if (message.metadata) {
  //   try {
  //     metadata = ZMetadata.parse(JSON.parse(message.metadata));
  //   } catch (error) {
  //     // forget it
  //   }
  // }
  return (
    <div id={message.id} className={`message message-${message.type}`}>
      <Markdown>
        {message.type === "ai" ? message.outcome : message.content}
      </Markdown>
      {/* {metadata ? (
        <div className="metadata">
          {metadata.tokenUsage.promptTokens} prompt{" -> "}
          {metadata.tokenUsage.completionTokens} completion tokens
        </div>
      ) : null} */}
    </div>
  );
}
