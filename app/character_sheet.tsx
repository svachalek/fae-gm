import { approaches, Character } from "../schema/character";
import AspectDisplay from "./aspect_display";
import Bar from "./bar";
import Boxes from "./boxes";
import Portrait from "./portrait";

export default function CharacterSheet({
  character,
  imageUrl,
  regenerateImage,
}: {
  character: Character;
  imageUrl?: string;
  regenerateImage: (name: string, description: string) => void;
}) {
  return (
    <div className="character">
      <h3>{character.name}</h3>

      <Portrait
        imageUrl={imageUrl}
        name={character.name}
        physicalDescription={character.physicalDescription}
        regenerateImage={regenerateImage}
      />

      <h4>Aspects</h4>
      <ul>
        {character.aspects.map((aspect, index) => (
          <li key={index}>
            <AspectDisplay aspect={aspect} />
          </li>
        ))}
      </ul>
      <table>
        <tbody>
          {approaches.map((approach) => (
            <tr key={approach}>
              <th>{approach}</th>
              <td>
                <Bar length={character[approach]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p />
      <h4>Stunts</h4>
      <ul>
        {character.stunts.map((value, index) => (
          <li className="stunt" key={index}>
            <b>{value.name}</b>: {value.description}
          </li>
        ))}
      </ul>
      <table>
        <tbody>
          <tr>
            <th>Fate Points</th>
            <td>
              <Boxes count={5} filled={character.fatePoints} />
            </td>
          </tr>
        </tbody>
      </table>
      <p />
      <table>
        <tbody>
          <tr>
            <th>Stress</th>
            <td>
              <Boxes
                count={character.stress.numberOfBoxes}
                filled={character.stress.filledBoxes}
              />
            </td>
          </tr>
          {character.severeConsequence ||
          character.moderateConsequence ||
          character.mildConsequence ? (
            <tr>
              <th>Consequences</th>
              <td>
                <ul className="consequences">
                  {character.severeConsequence ? (
                    <li className="consequence">
                      {character.severeConsequence} (severe)
                    </li>
                  ) : undefined}
                  {character.moderateConsequence ? (
                    <li className="consequence">
                      {character.moderateConsequence} (moderate)
                    </li>
                  ) : undefined}
                  {character.mildConsequence ? (
                    <li className="consequence">
                      {character.mildConsequence} (mild)
                    </li>
                  ) : undefined}
                </ul>
              </td>
            </tr>
          ) : undefined}
        </tbody>
      </table>
    </div>
  );
}
