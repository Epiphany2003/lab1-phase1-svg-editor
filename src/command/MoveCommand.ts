import { CommandBase } from "./CommandBase.js";
import { Group } from "../model/Group.js";
import type { CommandContext } from "./CommandContext.js";

export class MoveCommand extends CommandBase {
  readonly name = "move";
  constructor() { super("edit"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 3, "move <id> <dx> <dy>");
    const [id, dxText, dyText] = args;
    const dx = this.number(dxText!, "dx");
    const dy = this.number(dyText!, "dy");
    const shape = context.requireDocument().requireShape(id!);
    shape.move(dx, dy);
    if (shape instanceof Group) return `g#${id} moved by (${dx},${dy})`;
    return `${shape.tagName}#${id} moved: ${shape.geometrySummary()}`;
  }
}
