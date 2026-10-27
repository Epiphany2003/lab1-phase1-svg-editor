import { CommandBase } from "./CommandBase.js";
import type { MutationKind } from "./Command.js";
import type { CommandContext } from "./CommandContext.js";

export class CanvasCommand extends CommandBase {
  readonly name = "canvas";
  constructor() { super("display"); }
  override mutationKind(args: string[]): MutationKind { return args.length === 0 ? "display" : "io"; }
  execute(context: CommandContext, args: string[]): string {
    const document = context.requireDocument();
    if (args.length === 0) return `canvas ${document.width}x${document.height}`;
    this.requireCount(args, 2, "canvas [w] [h]");
    const width = this.number(args[0]!, "width");
    const height = this.number(args[1]!, "height");
    document.resize(width, height);
    return `canvas resized to ${width}x${height}`;
  }
}
