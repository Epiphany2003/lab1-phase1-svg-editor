import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class AddToCommand extends CommandBase {
  readonly name = "addto";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 2, "addto <gid> <id>");
    context.requireDocument().addTo(args[0]!, args[1]!);
    return `${args[1]} moved into g#${args[0]}`;
  }
}
