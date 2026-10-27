import { EditorError } from "../core/EditorError.js";
import { CommandBase } from "./CommandBase.js";
import { Group } from "../model/Group.js";
import type { CommandContext } from "./CommandContext.js";

export class ScaleCommand extends CommandBase {
  readonly name = "scale";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 2, "scale <id> <factor>");
    const factor = this.number(args[1]!, "factor");
    if (factor <= 0) throw new EditorError("scale factor must be positive");
    const shape = context.requireDocument().requireShape(args[0]!);
    shape.scale(factor);
    if (shape instanceof Group) return `g#${shape.id} scaled by ${factor}`;
    return `${shape.tagName}#${shape.id} scaled by ${factor}: ${shape.geometrySummary()}`;
  }
}
