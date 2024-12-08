import { z } from "zod";

export const ZRollDice = z.object({
  purpose: z
    .string()
    .describe(
      `What will happen on a successful roll? Complete the sentence "Rolling to see if..."`,
    ),
  influences: z
    .object({
      tag: z.string(),
      value: z
        .number()
        .describe(
          "a rating from -2 (strongly hindering the action) to +2 (strongly supporting the action)",
        ),
    })
    .array(),
});

export const ZDiceResult = z
  .object({
    dice: z.number().array(),
    outcome: z.string(),
    credit: z.string(),
    blame: z.string(),
  })
  .extend(ZRollDice.shape);

export interface DiceResult extends z.infer<typeof ZDiceResult> {}
