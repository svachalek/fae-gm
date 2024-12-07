"use client";

import { useEffect, useState } from "react";
import { Situation } from "../schema/situation";

export default function Input({
  prompt,
  situation,
  submitAction,
}: {
  prompt: string;
  situation: Situation;
  submitAction: (message: string) => void;
}) {
  const [text, setText] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition>();
  const [isRecognizing, setIsRecognizing] = useState(false);

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // prevent adding a newline
      submitAction(event.currentTarget.value);
      setText("");
      if (isRecognizing) {
        recognition!.stop();
        setIsRecognizing(false);
      }
    } else if (event.key >= "1" && event.key <= "9" && text.length === 0) {
      const index = Number(event.key) - 1;
      if (situation.suggestions.length > index) {
        document.onkeydown = null;
        submitAction(situation.suggestions[index]);
      }
      if (event.key === "c" && situation.compel) {
        document.onkeydown = null;
        submitAction(situation.compel);
      }
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      setRecognition(recognition);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognition) {
      return;
    } else if (isRecognizing) {
      recognition.stop();
      setIsRecognizing(false);
    } else {
      recognition.start();
      setIsRecognizing(true);

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
      };
    }
  };

  return (
    <>
      <form id="player_input">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          placeholder={prompt}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {recognition ? (
          <button
            className={isRecognizing ? "speech listening" : "speech"}
            type="button"
            onClick={toggleSpeechRecognition}
          >
            <img
              width="20px"
              height="20px"
              src={
                isRecognizing
                  ? "/9023698_microphone_fill_icon.svg"
                  : "/9025831_microphone_icon.svg"
              }
            />
          </button>
        ) : undefined}
        <button type="submit" hidden />
      </form>
    </>
  );
}
