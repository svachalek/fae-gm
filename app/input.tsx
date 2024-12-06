"use client";

import { useEffect, useState } from "react";

export default function Input({
  loading,
  prompt,
  submitAction,
}: {
  loading: boolean;
  prompt: string;
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
    <div className="input">
      {loading ? (
        <div className="loading">
          <img src="/pendulum.gif" height="12" width="12" /> Discovering your
          fate...
        </div>
      ) : (
        <form id="player_input">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
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
      )}
    </div>
  );
}
