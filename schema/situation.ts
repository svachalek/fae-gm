import { z } from "zod";
import { ZAspect } from "./aspect";
import { ZCharacter } from "./character";
import { ZClock } from "./clock";
import { ZNPC } from "./npc";

export const ZSituation = z.object({
  outcome: z
    .string()
    .describe(
      "Outcome of the player's action, in Markdown format. This is also where you can put answers to questions or other out-of-game content.",
    ),
  suggestions: z
    .string()
    .array()
    .describe("Possible actions the player can take, in Markdown format."),
  scenario: z
    .string()
    .optional()
    .describe("Name of the scenario the character is playing, if applicable."),
  scene: z
    .string()
    .optional()
    .describe("Name of the scene the character is playing, if applicable."),
  playerCharacter: ZCharacter.optional().describe(
    "The player character's current status, if a character is created.",
  ),
  npcs: ZNPC.array().describe("NPCs relevant to the current scene"),
  situationAspects: ZAspect.array().describe(
    "Aspects on the situation, including ones created by the Create an Advantage action",
  ),
  compel: z
    .string()
    .describe(
      "If there is action that seems fitting to the one of player character's aspects, but likely to cause trouble and make things difficult for the player, you can put it here. Be specific and be sure to cite the aspect. Give the player a Fate Point if they do it. (Empty string for N/A)",
    ),
  clocks: ZClock.array(),
});

export interface Situation extends z.output<typeof ZSituation> {}
