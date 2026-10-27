import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";
import { SvgDocument } from "../model/SvgDocument.js";

export class InitCommand extends CommandBase {
  readonly name = "init";
  constructor() { super("io"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireRange(args, 0, 2, "init [w] [h]");
    const width = args[0] === undefined ? 800 : this.number(args[0], "width");
    const height = args[1] === undefined ? 600 : this.number(args[1], "height");
    context.document = new SvgDocument(width, height);
    return `canvas ${width}x${height} created`;
  }
}
