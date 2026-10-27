import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class DeleteCommand extends CommandBase {
  readonly name = "delete";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 1, "delete <id>");
    const shape = context.requireDocument().delete(args[0]!);
    return `${shape.tagName}#${shape.id} deleted`;
  }
}
