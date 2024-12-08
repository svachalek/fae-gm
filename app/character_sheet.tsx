import { Character } from "../schema/character";
import Portrait from "./portrait";
import TagDisplay from "./tag_display";

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

      <ul>
        {character.tags.map((tag, index) => (
          <li key={index}>
            <TagDisplay tag={tag} />
          </li>
        ))}
      </ul>
    </div>
  );
}
