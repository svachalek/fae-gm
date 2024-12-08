import { z } from "zod";

export const ZTag = z.object({
  name: z.string(),
  active: z.boolean().default(true),
});

export interface Tag extends z.output<typeof ZTag> {}
