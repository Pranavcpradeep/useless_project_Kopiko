import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export type GameEntry = {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  component: ComponentType;
};

export const GAMES: GameEntry[] = [
  {
    id: "catch-aladeen",
    title: "Catch Aladeen",
    emoji: "🎯",
    tagline: "The flagship game. Chase him around the arena. You will never catch him.",
    component: dynamic(() => import("./CatchAladeen"), {
      ssr: false,
    }),
  },
  {
    id: "dodge-the-dictator",
    title: "Dodge the Dictator",
    emoji: "🔫",
    tagline: "Aladeen has two guns and unbreakable hearts. You have one gun and three chances.",
    component: dynamic(() => import("./DodgeTheDictator"), {
      ssr: false,
    }),
  },
  // Add future games here, e.g. a rigged Rock-Paper-Scissors where he
  // always throws the exact counter to your move:
  // {
  //   id: "rock-paper-scissors",
  //   title: "Rigged Rock-Paper-Scissors",
  //   emoji: "✊",
  //   tagline: "He always knows what you'll throw.",
  //   component: dynamic(() => import("./RiggedRPS"), { ssr: false }),
  // },
];