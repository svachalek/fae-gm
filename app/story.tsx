"use client";

import { useEffect, useRef } from "react";
import { Message } from "./chat";
import DiceRoll from "./dice_roll";
import MessageBox from "./message_box";

export default function Story({ messages }: { messages: Message[] }) {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    element.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  });

  return (
    <div ref={element} className="story">
      {messages.map((message) =>
        message.type === "tool" ? (
          <DiceRoll key={message.id} message={message} />
        ) : (
          <MessageBox key={message.id} message={message} />
        ),
      )}
    </div>
  );
}
