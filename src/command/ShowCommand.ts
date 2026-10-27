import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class ShowCommand extends CommandBase {
  readonly name = "show";
  constructor() { super("display"); }
  execute(context: CommandContext, args: string[]): string {
    this.requireCount(args, 1, "show <id>");
    const document = context.requireDocument();
    const shape = document.requireShape(args[0]!);
    const lines = [`${shape.tagName}#${shape.id}  parent=${document.parentName(shape)}`];
    if (shape.geometrySummary()) lines.push(`  ${shape.geometrySummary()}`);
    if (shape.fill !== null) lines.push(`  fill=${shape.fill}`);
    if (shape.stroke !== null) lines.push(`  stroke=${shape.stroke}`);
    if (shape.strokeWidth !== null) lines.push(`  stroke-width=${shape.strokeWidth}`);
    return lines.join("\n");
  }
}
