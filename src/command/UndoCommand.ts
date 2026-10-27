import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class UndoCommand extends CommandBase {
  readonly name = "undo";
  constructor() { super("history"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 0, "undo");
    context.requireDocument();
    return context.requireHistory().undo(context);
  }
}
