import { ZDiceResult } from "../schema/dice";
import { Message } from "./chat";

export default function DiceRoll({ message }: { message: Message }) {
  const minusDie = <span className="die">➖</span>;
  const plusDie = <span className="die">➕</span>;
  const blankDie = <span className="die">&nbsp;</span>;
  try {
    const json = JSON.parse(message.content);
    const {
      rollType,
      characterName,
      approach,
      difficulty,
      modifiers,
      dice,
      outcome,
    } = ZDiceResult.parse(json);
    return (
      <div className="dice_roll">
        <b>
          <i>Dice roll! </i>
        </b>
        {characterName} is rolling{" "}
        <span className="dice_approach">{approach}</span>
        {" to "}
        <span className="dice_rolltype">
          {rollType} (difficulty {difficulty}):
        </span>{" "}
        <span className="dice_result">
          {dice.map((die, index) => (
            <span key={index}>
              {die > 0 ? plusDie : die < 0 ? minusDie : blankDie}
            </span>
          ))}
          {modifiers.map(
            ({ name, value }) => `${value < 0 ? value : "+" + value} ${name} `,
          )}
          {" = "}
          {outcome}
        </span>
      </div>
    );
  } catch (error) {
    return <div className="message message-tool">{message.content}</div>;
  }
}
