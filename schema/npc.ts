import { z } from "zod";
import { ZAspect } from "./aspect";
import { ZStress } from "./stress";

export const ZNPC = z.object({
  name: z.string(),
  physicalDescription: z
    .string()
    .describe(
      "Include details suitable for image generation, including any equipment they are wearing or carrying. Make it about 100 words.",
    ),
  aspects: ZAspect.array(),
  skilledAt: z.string().array(),
  badAt: z.string().array(),
  stress: ZStress,
});

export interface NPC extends z.infer<typeof ZNPC> {}
