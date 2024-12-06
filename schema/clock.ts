import { z } from "zod";

export const ZClock = z.object({
  name: z.string(),
  segments: z.number(),
  filledSegments: z.number(),
});

export interface Clock extends z.infer<typeof ZClock> {}
