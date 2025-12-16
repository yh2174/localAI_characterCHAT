export type EmotionKey =
  | "happy"
  | "sad"
  | "angry"
  | "shy"
  | "sleepy"
  | "flirty"
  | "neutral";

export type Character = {
  id: number;
  name: string;
  gender?: string;
  age?: number;
  bio?: string;
  description?: string;
  hashtags?: string[];
  tone?: string;
  boundaries?: string[];
  imageDefault?: string;
  imageByEmotion?: Partial<Record<EmotionKey, string>>;
};

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isAction?: boolean;
  emotion?: EmotionKey;
  createdAt?: string;
};

