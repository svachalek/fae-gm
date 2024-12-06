import { z } from "zod";

export const ZStress = z.object({
  numberOfBoxes: z.number(),
  filledBoxes: z.number().default(0),
});

export interface Stress extends z.output<typeof ZStress> {}
