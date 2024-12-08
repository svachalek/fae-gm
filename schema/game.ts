import { z } from "zod";

const CharacterSchema = z.object({
  name: z.string(),
  physicalDescription: z
    .string()
    .describe(
      "Include details suitable for image generation, including any equipment they are wearing or carrying. Make it about 100 words.",
    ),
  stats: z.object({
    edge: z.number().min(0),
    heart: z.number().min(0),
    iron: z.number().min(0),
    shadow: z.number().min(0),
    wits: z.number().min(0),
  }),
  momentum: z.object({
    current: z.number(),
    max: z.number(),
    min: z.number(),
  }),
  health: z.number().min(0).max(5),
  spirit: z.number().min(0).max(5),
  supply: z.number().min(0).max(5),
  debilities: z.array(z.string()),
});

export interface Character extends z.infer<typeof CharacterSchema> {}

const RankSchema = z.enum([
  "Troublesome",
  "Dangerous",
  "Formidable",
  "Extreme",
  "Epic",
]);

const VowSchema = z.object({
  description: z.string(),
  rank: RankSchema,
  progress: z.number().min(0).max(10),
  sworn: z.boolean(),
});

export interface Vow extends z.infer<typeof VowSchema> {}

const ConnectionSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
  progress: z.number().min(0).max(10),
});

export interface Connection extends z.infer<typeof ConnectionSchema> {}

const ProgressTrackSchema = z.object({
  name: z.string(),
  description: z.string(),
  rank: RankSchema,
  progress: z.number().min(0).max(10),
});

export interface ProgressTrack extends z.infer<typeof ProgressTrackSchema> {}

export const GameStateSchema = z.object({
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

  character: CharacterSchema.optional(),
  vows: z.array(VowSchema),
  connections: z.array(ConnectionSchema),
  inventory: z.array(z.string()),
  progress_tracks: z.array(ProgressTrackSchema),
  notes: z.string().optional(),
});

export interface GameState extends z.infer<typeof GameStateSchema> {}
