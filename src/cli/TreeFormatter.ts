import { Group } from "../model/Group.js";
import { Shape } from "../model/Shape.js";
import { SvgDocument } from "../model/SvgDocument.js";

export class TreeFormatter {
  format(document: SvgDocument, rootId?: string): string {
    if (rootId === undefined) {
      const lines = [`svg (${document.width}x${document.height})`];
      document.children.forEach((shape, index) => this.appendShape(lines, shape, "", index === document.children.length - 1));
      return lines.join("\n");
    }
    const root = document.requireShape(rootId);
    const lines = [this.describe(root)];
    if (root instanceof Group) root.children.forEach((shape, index) => this.appendShape(lines, shape, "", index === root.children.length - 1));
    return lines.join("\n");
  }

  private appendShape(lines: string[], shape: Shape, prefix: string, last: boolean): void {
    const branch = last ? "└── " : "├── ";
    lines.push(`${prefix}${branch}${this.describe(shape)}`);
    if (shape instanceof Group) {
      const childPrefix = prefix + (last ? "    " : "│   ");
      shape.children.forEach((child, index) => this.appendShape(lines, child, childPrefix, index === shape.children.length - 1));
    }
  }

  private describe(shape: Shape): string {
    const geometry = shape.geometrySummary();
    const fill = shape.fill === null ? "" : ` fill=${shape.fill}`;
    const stroke = shape.stroke === null ? "" : ` stroke=${shape.stroke}`;
    const summary = geometry ? ` ${geometry}` : "";
    return `${shape.tagName}#${shape.id}${summary}${fill}${stroke}`;
  }
}
