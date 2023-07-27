// Make importing .css files in TypeScript code work
declare module '*.css';

export type Profile = {
  username: string;
};

export type Event = {
  title: string;
  description: string;
  location: string;
  happening_at: number;
  created_at: number;
};

export type Reaction = {
  event: string;
};

export type Comment = {
  text: string;
  event: string;
  created_at: number;
};
