import { z } from "zod";
import { ZTag } from "./tag";

export const ZScene = z.object({
  name: z.string(),
  description: z
    .string()
    .describe("Describe the setting and what is happening."),
  tags: ZTag.array().min(2),
});

export interface Scene extends z.output<typeof ZScene> {}
