import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class GroupCommand extends CommandBase {
  readonly name = "group";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireRange(args, 3, Number.MAX_SAFE_INTEGER, "group <newGid> <id1> <id2>…");
    const group = context.requireDocument().group(args[0]!, args.slice(1));
    return `g#${group.id} created with ${group.children.length} children`;
  }
}
