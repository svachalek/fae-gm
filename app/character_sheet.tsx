import { Character } from "../schema/game";
import Bar from "./bar";
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

      <table>
        <tbody>
          {Object.entries(character.stats).map(([stat, value]) => (
            <tr key={stat}>
              <th>{stat}</th>
              <td>
                <Bar length={value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p />
      <h4>Status</h4>
      <ul>
        {(["health", "spirit", "supply"] as const).map((stat) => (
          <li className="stunt" key={character[stat]}>
            <b>{stat}</b>: {character[stat]}
          </li>
        ))}
        {character.debilities.join(", ")}
      </ul>
      <p />
    </div>
  );
}
