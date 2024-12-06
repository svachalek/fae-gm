import { z } from "zod";
import { ZAspect } from "./aspect";
import { ZStress } from "./stress";

export const approaches = [
  "careful",
  "clever",
  "flashy",
  "forceful",
  "quick",
  "sneaky",
] as const;

const ZStunt = z.object({ name: z.string(), description: z.string() });

// Keeping this flat and simple for local models.
export const ZCharacter = z.object({
  name: z.string(),
  physicalDescription: z
    .string()
    .describe("Include details suitable for image generation, including any equipment they are wearing or carrying. Make it about 100 words."),
  aspects: ZAspect.array().min(2),
  careful: z.number(),
  clever: z.number(),
  flashy: z.number(),
  forceful: z.number(),
  quick: z.number(),
  sneaky: z.number(),
  stunts: ZStunt.array(),
  stress: ZStress,
  mildConsequence: z.string().nullish(),
  moderateConsequence: z.string().nullish(),
  severeConsequence: z.string().nullish(),
  fatePoints: z.number(),
});

export interface Character extends z.output<typeof ZCharacter> {}
