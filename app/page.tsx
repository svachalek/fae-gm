"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import Markdown from "react-markdown";
import { Situation } from "../schema/situation";
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
import TagDisplay from "./tag_display";

const initialMessages: Message[] = [
  {
    id: "greeting",
    type: "system",
    content: `Welcome! I am your Game Master for Tagz. 
    I can answer questions about the game or just get started. We can create a scenario and a character for you, or just ask me to Quick Start a game and I'll get right into the action.`,
  },
];

const initialSituation: Situation = {
  outcome: "",
  suggestions: [],
  scenario: "Tagz Game Master",
  scene: { name: "Getting Started", description: "", tags: [] },
  npcs: [],
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
          ` Setting: ${situation.scenario}, ${situation.scene?.name} ${situation.scene?.description}`,
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
    const pc = situation.playerCharacter;
    if (pc && !images[pc.name]) {
      generatePortrait(pc.name, pc.physicalDescription);
    }
    for (const npc of situation.npcs) {
      if (!images[npc.name]) {
        generatePortrait(npc.name, npc.physicalDescription);
      }
    }
  }, [situation]);

  useEffect(() => {
    void saveGame({ messages, situation, images });
  }, [situation, messages, images]);

  return (
    <>
      <header>
        <span className="scenario">{situation.scenario}</span>{" "}
        <span className="scene_name">{situation.scene?.name}</span>
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
        {situation.playerCharacter ? (
          <section className="situation">
            <CharacterSheet
              character={situation.playerCharacter}
              imageUrl={images[situation.playerCharacter.name]}
              regenerateImage={generatePortrait}
            />
            {situation.scene ? (
              <div className="scene">
                <h3>Scene: {situation.scene.name}</h3>
                <Markdown>{situation.scene.description}</Markdown>
                <ul>
                  {situation.scene.tags.map((aspect, index) => (
                    <li key={index}>
                      <TagDisplay tag={aspect} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {situation.npcs.map((npc, index) => (
              <CharacterSheet
                key={npc.name + index}
                character={npc}
                imageUrl={images[npc.name]}
                regenerateImage={generatePortrait}
              />
            ))}
          </section>
        ) : undefined}
      </main>
    </>
  );
}
