import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class UngroupCommand extends CommandBase {
  readonly name = "ungroup";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 1, "ungroup <gid>");
    const group = context.requireDocument().ungroup(args[0]!);
    return `g#${group.id} ungrouped`;
  }
}
