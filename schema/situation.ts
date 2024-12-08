import { z } from "zod";
import { ZCharacter } from "./character";
import { ZScene } from "./scene";

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
  scene: ZScene.optional().describe(
    "The scene the character is playing, if applicable.",
  ),
  playerCharacter: ZCharacter.optional().describe(
    "The player character's current status, if a character is created.",
  ),
  npcs: ZCharacter.array().describe("NPCs relevant to the current scene"),
});

export interface Situation extends z.output<typeof ZSituation> {}
