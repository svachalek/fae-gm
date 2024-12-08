import { ZDiceResult } from "../schema/dice";
import { Message } from "./chat";

export default function DiceRoll({ message }: { message: Message }) {
  const minusDie = <span className="die">-</span>;
  const plusDie = <span className="die">+</span>;
  const blankDie = <span className="die">&nbsp;</span>;
  try {
    const json = JSON.parse(message.content);
    const { purpose, influences, dice, outcome } = ZDiceResult.parse(json);
    return (
      <div className="dice_roll">
        <div>
          <b>
            <i>Dice roll! </i>
          </b>
          Rolling to see if {purpose}:{" "}
          <span className="dice_result">
            {dice.map((die, index) => (
              <span key={index}>
                {die > 0 ? plusDie : die < 0 ? minusDie : blankDie}
              </span>
            ))}
          </span>
        </div>
        {influences.map(({ tag, value }) => (
          <div className="dice_modifier" key={tag}>
            {value < 0 ? (
              <span className="red_pill">{value}</span>
            ) : (
              <span className="green_pill">+{value}</span>
            )}{" "}
            {tag}
          </div>
        ))}
        {" = "}
        {outcome}!
      </div>
    );
  } catch (error) {
    return <div className="message message-tool">{message.content}</div>;
  }
}
