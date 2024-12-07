import Markdown from "react-markdown";
import { Situation } from "../schema/situation";

export default function Suggestions({
  situation,
  submitAction,
}: {
  situation: Situation;
  submitAction: (message: string) => void;
}) {
  return situation.suggestions.length > 0 || situation.compel ? (
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
      {situation.compel ? (
        <div key="compel" className="suggestion compel">
          <button
            onClick={() => {
              submitAction(situation.compel);
            }}
          >
            C
          </button>
          <Markdown>{situation.compel}</Markdown>
        </div>
      ) : undefined}
    </div>
  ) : undefined;
}
