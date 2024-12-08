"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { GameState } from "../schema/game";
import CharacterSheet from "./character_sheet";
import {
  generateImage,
  loadGame,
  Message,
  saveGame,
  sendMessage,
} from "./chat";
import Input from "./input";
import "./main.css";
import Story from "./story";
import Suggestions from "./suggestions";

const initialMessages: Message[] = [
  {
    id: "greeting",
    type: "system",
    content: `Welcome! I am your Game Master for [Ironsworn](https://tomkinpress.com/pages/ironsworn). 
    I can answer questions about the game or just get started. We can create a scenario and a character for you, or just ask me to Quick Start a game and I'll get right into the action.`,
  },
];

const initialSituation: GameState = {
  outcome: "",
  suggestions: [],
  scenario: "Ironsworn Game Master",
  scene: "Getting Started",
  character: undefined,
  vows: [],
  connections: [],
  inventory: [],
  progress_tracks: [],
};

function incrementVersion(url: string): string {
  const match = url.match(/(?:.*\/)?(.*?)(?:\s+v(\d+))?(\.[a-zA-Z0-9]+)?$/);
  if (match) {
    const name = match[1].trim();
    const version = match[2];
    if (version) {
      return `${name} v${parseInt(version, 10) + 1}`;
    } else {
      return `${name} v2`;
    }
  }
  return url; // Fallback in case of unexpected input
}

function imageReducer(
  images: Record<string, string>,
  newImages: Record<string, string>,
): Record<string, string> {
  return { ...images, ...newImages };
}

export default function Page() {
  const [messages, setMessages] = useState(initialMessages);
  const [situation, setSituation] = useState(initialSituation);
  const [images, addImages] = useReducer(
    imageReducer,
    {} as Record<string, string>,
  );
  const [loading, setLoading] = useState(false);

  async function submit(content: string) {
    setLoading(true);
    const message: Message = {
      id: `client-${Date.now()}`,
      type: "human",
      content,
    };
    setMessages([...messages, message]);
    const response = await sendMessage(message.content, situation);
    const newMessages = [...messages, message, ...response.messages];
    setMessages(newMessages);
    setSituation(response.situation);
    setLoading(false);
  }

  const generatePortrait = useCallback(
    (name: string, description: string) => {
      let versionedName = name;
      const existingUrl = images[name];
      if (existingUrl) {
        versionedName = incrementVersion(decodeURI(existingUrl));
        addImages({ [name]: "" });
      }
      generateImage(
        versionedName,
        `Painting of a fictional person in a realistic style. Show their face, waist, and knees. Rich color palettes, dramatic lighting, dynamic composition. ` +
          ` Subject: ${description}` +
          ` Setting: ${situation.scenario}, ${situation.scene}`,
      )
        .then((imageUrl) => addImages({ [name]: imageUrl }))
        .catch((error) => console.error(error));
    },
    [images],
  );

  useEffect(() => {
    loadGame()
      .then((saveGame) => {
        setMessages(saveGame.messages);
        setSituation(saveGame.situation);
        addImages(saveGame.images);
      })
      .catch((error) => {
        console.warn(error);
      });
  }, []);

  useEffect(() => {
    const pc = situation.character;
    if (pc && !images[pc.name]) {
      generatePortrait(pc.name, pc.physicalDescription);
    }
  }, [situation]);

  useEffect(() => {
    void saveGame({ messages, situation, images });
  }, [situation, messages, images]);

  return (
    <>
      <header>
        <span className="scenario">{situation.scenario}</span>{" "}
        <span className="scene">{situation.scene}</span>
      </header>
      <main>
        <section className="main">
          <Story messages={messages} />

          {loading ? (
            <div className="loading">Discovering your fate...</div>
          ) : (
            <div className="input">
              <Suggestions submitAction={submit} situation={situation} />
              <Input
                prompt={"What would you like to do?"}
                situation={situation}
                submitAction={submit}
              />
            </div>
          )}
        </section>
        {situation.character ? (
          <section className="situation">
            <CharacterSheet
              character={situation.character}
              imageUrl={images[situation.character.name]}
              regenerateImage={generatePortrait}
            />
          </section>
        ) : undefined}
      </main>
    </>
  );
}
