import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { DiceResult, ZRollDice } from "../../schema/dice";

export const rollDice = tool(
  async ({
    rollType,
    characterName,
    approach,
    difficulty,
    modifiers,
  }: z.infer<typeof ZRollDice>) => {
    // Roll 4 Fate dice (-1, 0, or +1 each)
    const dice: number[] = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * 3) - 1,
    );

    // Calculate total and difference
    const diceTotal = dice.reduce((sum, value) => sum + value, 0);
    const modifiedTotal = modifiers.reduce(
      (total, { value }) => total + value,
      diceTotal,
    );
    const difference = modifiedTotal - difficulty;

    // Determine the outcome and effects
    let outcome: string;
    let effects: string;

    if (difference < 0) {
      outcome = "Failure";
      if (rollType === "defend") {
        effects =
          "The opponent's action succeeds fully. The player may want to invoke an aspect to reroll or add +2 to this roll.";
      } else {
        effects =
          "Action fails, and something else happens -- or perhaps it succeeds but at a serious cost. The player may want to invoke an aspect to reroll or add +2 to this roll.";
      }
    } else if (difference === 0) {
      outcome = "Tie";
      if (rollType === "create advantage") {
        effects =
          "Creates a Boost with the same name as the intended aspect. It can be invoked once and then disappears.";
      } else if (rollType === "attack") {
        effects =
          "Deals no damage, but creates a Boost. This can be invoked once and then disappears.";
      } else if (rollType === "defend") {
        effects = "Opponent's action succeeds, but with a minor compromise.";
      } else {
        effects =
          "Action succeeds at a minor cost or achieves a minor benefit.";
      }
    } else if (difference === 1) {
      outcome = "Success";
      if (rollType === "create advantage") {
        effects =
          "Create an advantage, a situation aspect with one free invocation.";
      } else if (rollType === "attack") {
        effects = "The attack hits the target. Deal 1 stress.";
      } else if (rollType === "defend") {
        effects = "Defense succeeds. The opponent's action is stopped.";
      } else {
        effects = "Action succeeds.";
      }
    } else {
      outcome = "Success with Style";
      if (rollType === "create advantage") {
        effects =
          "Create an advantage with style, a situation aspect with two free invocations.";
      } else if (rollType === "attack") {
        effects =
          "Attack hits with style. Deal stress equal to the difference between the roll and target's defense.";
      } else if (rollType === "defend") {
        effects =
          "Defense succeeds with style. The opponent's action is stopped, and the defender gains a Boost.";
      } else {
        effects = "Action succeeds with extra impact or benefits.";
      }
    }

    const result: DiceResult = {
      rollType,
      characterName,
      approach,
      difficulty,
      modifiers,
      dice,
      outcome,
      effects,
    };
    return result;
  },
  {
    name: "rollDice",
    description: "Call this to roll dice with proper randomness.",
    schema: ZRollDice,
    verboseParsingErrors: true,
  },
);

export default rollDice;
