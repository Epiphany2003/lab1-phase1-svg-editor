import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class BackCommand extends CommandBase {
  readonly name = "back";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 1, "back <id>");
    context.requireDocument().reorder(args[0]!, false);
    return `${args[0]} moved to back`;
  }
}
