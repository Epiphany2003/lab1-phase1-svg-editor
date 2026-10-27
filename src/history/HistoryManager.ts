import { EditorError } from "../core/EditorError.js";
import type { Command } from "../command/Command.js";
import type { CommandContext } from "../command/CommandContext.js";
import { SvgDocument } from "../model/SvgDocument.js";

interface HistoryEntry {
  readonly description: string;
  readonly before: SvgDocument;
  readonly after: SvgDocument;
}

export class HistoryManager {
  private readonly undoStack: HistoryEntry[] = [];
  private readonly redoStack: HistoryEntry[] = [];
  private blockedByIo = false;

  execute(command: Command, context: CommandContext, args: string[]): string {
    const current = context.requireDocument();
    const before = current.clone();
    const working = current.clone();
    context.document = working;
    try {
      const output = command.execute(context, args);
      this.undoStack.push({ description: `${command.name} ${args.join(" ")}`.trim(), before, after: working.clone() });
      this.redoStack.length = 0;
      this.blockedByIo = false;
      return output;
    } catch (error) {
      context.document = current;
      throw error;
    }
  }

  undo(context: CommandContext): string {
    if (this.blockedByIo) throw new EditorError("undo not allowed after io command");
    const entry = this.undoStack.pop();
    if (!entry) throw new EditorError("nothing to undo");
    context.document = entry.before.clone();
    this.redoStack.push(entry);
    return `undid ${entry.description}`;
  }

  redo(context: CommandContext): string {
    if (this.blockedByIo) throw new EditorError("redo not allowed after io command");
    const entry = this.redoStack.pop();
    if (!entry) throw new EditorError("nothing to redo");
    context.document = entry.after.clone();
    this.undoStack.push(entry);
    return `redid ${entry.description}`;
  }

  markIoBoundary(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.blockedByIo = true;
  }
}
