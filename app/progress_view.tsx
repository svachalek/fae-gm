import { ProgressTrack } from "../schema/game";
import Boxes from "./boxes";

export default function ProgressView({
  progress,
}: {
  progress: ProgressTrack;
}) {
  return (
    <div className="progress">
      <h4>
        {progress.name} ({progress.rank})
      </h4>
      <p>{progress.description}</p>
      <Boxes count={10} filled={progress.progress} />
    </div>
  );
}
