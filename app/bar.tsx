import Boxes from "./boxes";

export default function Bar({ length }: { length: number }) {
  return (
    <span className="bar">
      <Boxes count={length} filled={length} />
    </span>
  );
}
