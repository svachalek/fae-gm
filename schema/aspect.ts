import { z } from "zod";

export const ZAspect = z.object({
  name: z.string(),
  freeInvocations: z.number().default(0),
});

export interface Aspect extends z.output<typeof ZAspect> {}
