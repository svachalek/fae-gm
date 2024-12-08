import React from "react";
import { Tag } from "../schema/tag";

export default function TagDisplay({ tag }: { tag: Tag }) {
  return (
    <span className={tag.active ? "tag" : "tag inactive"}>{tag.name}</span>
  );
}
