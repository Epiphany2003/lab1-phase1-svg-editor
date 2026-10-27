import { EditorError } from "../core/EditorError.js";
import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class SaveCommand extends CommandBase {
  readonly name = "save";
  constructor() { super("io"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireRange(args, 0, 1, "save [file.svg]");
    const document = context.requireDocument();
    const path = args[0] ?? document.filePath;
    if (!path) throw new EditorError("no save path; use save <file.svg>");
    context.fileStore.write(path, context.svgWriter.write(document));
    document.filePath = path;
    return `saved to ${path} (${document.elementCount} elements)`;
  }
}
