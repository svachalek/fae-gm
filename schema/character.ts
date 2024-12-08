import { z } from "zod";
import { ZTag } from "./tag";

export const ZCharacter = z.object({
  name: z.string(),
  physicalDescription: z
    .string()
    .describe(
      "Include details suitable for image generation, including any equipment they are wearing or carrying. Make it about 100 words.",
    ),
  tags: ZTag.array().min(2),
});

export interface Character extends z.output<typeof ZCharacter> {}
