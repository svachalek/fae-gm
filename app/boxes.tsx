export default function Boxes({
  count,
  filled,
}: {
  count: number;
  filled: number;
}) {
  const boxes = [];
  for (let i = 0; i < count; ++i) {
    boxes.push(<span key={i} className={i < filled ? "box filled" : "box"} />);
  }
  return <span className="boxes">{boxes}</span>;
}
