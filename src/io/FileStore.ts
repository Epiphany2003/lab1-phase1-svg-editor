import { readFileSync, writeFileSync } from "node:fs";
import { EditorError } from "../core/EditorError.js";

export class FileStore {
  read(path: string): string {
    try {
      return readFileSync(path, "utf8");
    } catch {
      throw new EditorError(`cannot read file: ${path}`);
    }
  }

  write(path: string, content: string): void {
    try {
      writeFileSync(path, content, "utf8");
    } catch {
      throw new EditorError(`cannot write file: ${path}`);
    }
  }
}
