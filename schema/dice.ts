import { z } from "zod";

export const ZRollType = z.enum([
  "attack",
  "defend",
  "overcome",
  "create advantage",
]);

export const ZModifier = z.object({ name: z.string(), value: z.number() });

export const ZRollDice = z.object({
  rollType: ZRollType,
  characterName: z
    .string()
    .describe("the name of the player character or NPC who wants to roll"),
  approach: z.string().describe("the approach being used here"),
  difficulty: z.number(),
  modifiers: ZModifier.array()
    .min(1)
    .describe(
      "modifiers from approach rating, skilled at/bad at ratings, invokes, stunts, etc",
    ),
});

export const ZDiceResult = z
  .object({
    dice: z.number().array(),
    outcome: z.string(),
    effects: z.string(),
  })
  .extend(ZRollDice.shape);

export interface DiceResult extends z.infer<typeof ZDiceResult> {}
