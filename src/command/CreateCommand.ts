import { EditorError } from "../core/EditorError.js";
import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class CreateCommand extends CommandBase {
  readonly name = "create";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireRange(args, 2, Number.MAX_SAFE_INTEGER, "create <type> <id> [params…] [in <containerId>]");
    const [type, id] = args;
    let shapeArgs = args.slice(2);
    let containerId: string | undefined;
    const inIndex = shapeArgs.length >= 2 && shapeArgs.at(-2) === "in" ? shapeArgs.length - 2 : -1;
    if (inIndex !== -1) {
      containerId = shapeArgs[inIndex + 1]!;
      shapeArgs = shapeArgs.slice(0, inIndex);
    }
    const shape = context.shapeFactory.create(type!, id!, shapeArgs);
    context.requireDocument().add(shape, containerId);
    const destination = containerId ? ` in g#${containerId}` : "";
    return `${shape.tagName}#${shape.id} created${destination}`;
  }
}
