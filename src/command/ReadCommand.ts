import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class ReadCommand extends CommandBase {
  readonly name = "read";
  constructor() { super("io"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 1, "read <file.svg>");
    const path = args[0]!;
    const { document, warnings } = context.svgReader.read(context.fileStore.read(path));
    document.filePath = path;
    context.document = document;
    return [...warnings, `read ${path} (${document.elementCount} elements)`].join("\n");
  }
}
