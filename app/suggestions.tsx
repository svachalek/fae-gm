import Markdown from "react-markdown";
import { GameState } from "../schema/game";

export default function Suggestions({
  situation,
  submitAction,
}: {
  situation: GameState;
  submitAction: (message: string) => void;
}) {
  return situation.suggestions.length > 0 ? (
    <div className="suggestions">
      <h4>Some ideas:</h4>
      {situation.suggestions.map((suggestion, index) => (
        <div key={index} className="suggestion">
          <button
            onClick={() => {
              submitAction(suggestion);
            }}
          >
            {index + 1}
          </button>
          <Markdown>{suggestion}</Markdown>
        </div>
      ))}
    </div>
  ) : undefined;
}
