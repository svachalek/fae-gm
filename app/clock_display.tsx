import { Clock } from "../schema/clock";
import Boxes from "./boxes";

export default function ClockDisplay({ clock }: { clock: Clock }) {
  return (
    <div className="clock">
      <h4>{clock.name}</h4>
      <Boxes count={clock.segments} filled={clock.filledSegments} />
    </div>
  );
}
