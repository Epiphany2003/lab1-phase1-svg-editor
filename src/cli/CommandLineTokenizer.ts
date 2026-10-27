import { EditorError } from "../core/EditorError.js";

export class CommandLineTokenizer {
  tokenize(line: string): string[] {
    if (line.trim() === "" || line.trimStart().startsWith("#")) return [];
    const tokens: string[] = [];
    let current = "";
    let quoted = false;
    let tokenStarted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index]!;
      if (quoted && character === "\\") {
        const next = line[index + 1];
        if (next === '"' || next === "\\") {
          current += next;
          index += 1;
        } else current += character;
        tokenStarted = true;
      } else if (character === '"') {
        quoted = !quoted;
        tokenStarted = true;
      } else if (/\s/.test(character) && !quoted) {
        if (tokenStarted) {
          tokens.push(current);
          current = "";
          tokenStarted = false;
        }
      } else {
        current += character;
        tokenStarted = true;
      }
    }
    if (quoted) throw new EditorError("unterminated quoted argument");
    if (tokenStarted) tokens.push(current);
    return tokens;
  }
}
