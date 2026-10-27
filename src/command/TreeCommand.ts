import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";
import { TreeFormatter } from "../cli/TreeFormatter.js";

export class TreeCommand extends CommandBase {
  readonly name = "tree";
  constructor(private readonly formatter = new TreeFormatter()) { super("display"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireRange(args, 0, 1, "tree [id]");
    return this.formatter.format(context.requireDocument(), args[0]);
  }
}
