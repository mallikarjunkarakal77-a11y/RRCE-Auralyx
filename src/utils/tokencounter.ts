import { encoding_for_model } from "tiktoken";

const enc = encoding_for_model("gpt-3.5-turbo");

export function countTokens(text: string): number {
  return enc.encode(text).length;
}