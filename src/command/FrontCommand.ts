import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class FrontCommand extends CommandBase {
  readonly name = "front";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 1, "front <id>");
    context.requireDocument().reorder(args[0]!, true);
    return `${args[0]} moved to front`;
  }
}
