import { Aspect } from "../schema/aspect";

export default function AspectDisplay({ aspect }: { aspect: Aspect }) {
  return (
    <span className="aspect">
      {aspect.name}
      {aspect.freeInvocations > 0 ? ` (${aspect.freeInvocations})` : ""}
    </span>
  );
}
