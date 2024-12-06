import { NPC } from "../schema/npc";
import AspectDisplay from "./aspect_display";
import Boxes from "./boxes";
import Portrait from "./portrait";

export default function NPCSheet({
  npc,
  imageUrl,
  regenerateImage,
}: {
  npc: NPC;
  imageUrl?: string;
  regenerateImage: (name: string, description: string) => void;
}) {
  return (
    <div className="npc">
      <h4>NPC: {npc.name}</h4>
      <Portrait
        imageUrl={imageUrl}
        name={npc.name}
        physicalDescription={npc.physicalDescription}
        regenerateImage={regenerateImage}
      />
      <h4>Aspects</h4>
      <ul>
        {npc.aspects.map((aspect, index) => (
          <li key={index}>
            <AspectDisplay aspect={aspect} />
          </li>
        ))}
      </ul>
      <h4>Skilled at (+2)</h4>
      <div>{npc.skilledAt.join(", ")}</div>
      <h4>Bad at (-2)</h4>
      <div>{npc.badAt.join(", ")}</div>
      <p />
      {npc.stress.numberOfBoxes > 0 ? (
        <table>
          <tbody>
            <tr>
              <th>Stress</th>
              <td>
                <Boxes
                  count={npc.stress.numberOfBoxes}
                  filled={npc.stress.filledBoxes}
                />
              </td>
            </tr>
          </tbody>
        </table>
      ) : undefined}
    </div>
  );
}
