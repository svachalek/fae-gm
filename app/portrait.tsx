export default function Portrait({
  name,
  physicalDescription,
  imageUrl,
  regenerateImage,
}: {
  name: string;
  physicalDescription: string;
  imageUrl?: string;
  regenerateImage: (name: string, description: string) => void;
}) {
  return imageUrl ? (
    <div className="portrait_container">
      <div className="portrait_frame">
        <div className="portrait_description">{physicalDescription}</div>
        <button
          className="portrait_button"
          onClick={() => regenerateImage(name, physicalDescription)}
        >
          Regenerate
        </button>
      </div>
      <img className="portrait" src={imageUrl} alt={physicalDescription} />
    </div>
  ) : (
    <div className="portrait_container">
      <div className="portrait_frame no_image">
        <div className="portrait_description">{physicalDescription}</div>
        <div className="portrait_generating">Generating image...</div>
      </div>
      <div className="portrait_placeholder" />
    </div>
  );
}
