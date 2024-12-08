import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { DiceResult, ZRollDice } from "../../schema/dice";

function chooseOne(tags: { tag: string; value: number }[]): string {
  // weighted by absolute value
  const max = tags.reduce((total, tag) => total + Math.abs(tag.value), 0);
  const index = Math.floor(Math.random() * max);
  let n = 0;
  for (const tag of tags) {
    n += Math.abs(tag.value);
    if (n > index) {
      return tag.tag;
    }
  }
  return "random chance"; // should only happen when tags is empty
}

export const rollDice = tool(
  async ({ purpose, influences }: z.infer<typeof ZRollDice>) => {
    const dice: number[] = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 3) - 1,
    );

    const positiveTags = influences.filter((i) => i.value > 0);
    const negativeTags = influences.filter((i) => i.value < 0);

    let diceTotal =
      dice.reduce((sum, value) => sum + value, 0) +
      influences.reduce((sum, i) => sum + i.value, 0);

    let outcome: string;
    let credit = "";
    let blame = "";
    if (diceTotal < 0) {
      outcome = "Failure";
      blame = chooseOne(negativeTags);
    } else if (diceTotal === 0) {
      outcome = "Complicated";
      blame = chooseOne(negativeTags);
      credit = chooseOne(positiveTags);
    } else {
      outcome = "Success";
      credit = chooseOne(positiveTags);
    }

    const result: DiceResult = {
      purpose,
      influences,
      dice,
      outcome,
      credit,
      blame,
    };
    return result;
  },
  {
    name: "rollDice",
    description:
      "Call this to roll dice with proper randomness and select tags for credit/blame.",
    schema: ZRollDice,
    verboseParsingErrors: true,
  },
);

export default rollDice;
