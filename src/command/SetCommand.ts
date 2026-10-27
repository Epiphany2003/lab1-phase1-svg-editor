import { CommandBase } from "./CommandBase.js";
import { Group } from "../model/Group.js";
import type { CommandContext } from "./CommandContext.js";

export class SetCommand extends CommandBase {
  readonly name = "set";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 3, "set <id> <attr> <value>");
    const shape = context.requireDocument().requireShape(args[0]!);
    shape.setAttribute(args[1]!, args[2]!);
    if (args[1] === "text") return `${shape.tagName}#${shape.id} updated: text=${JSON.stringify(args[2])}`;
    if (shape instanceof Group && args[1] === "fill") return `g#${shape.id} fill updated to ${args[2]}`;
    return `${shape.tagName}#${shape.id} updated: ${args[1]}=${args[2]}`;
  }
}
