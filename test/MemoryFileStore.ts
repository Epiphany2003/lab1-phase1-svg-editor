import { FileStore } from "../src/io/FileStore.js";
import { EditorError } from "../src/core/EditorError.js";

export class MemoryFileStore extends FileStore {
  readonly files = new Map<string, string>();

  override read(path: string): string {
    const value = this.files.get(path);
    if (value === undefined) throw new EditorError(`cannot read file: ${path}`);
    return value;
  }

  override write(path: string, content: string): void { this.files.set(path, content); }
}
