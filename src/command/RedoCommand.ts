import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class RedoCommand extends CommandBase {
  readonly name = "redo";
  constructor() { super("history"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 0, "redo");
    context.requireDocument();
    return context.requireHistory().redo(context);
  }
}
