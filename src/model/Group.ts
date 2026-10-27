import { EditorError } from "../core/EditorError.js";
import { Shape } from "./Shape.js";
import type { ShapeContainer } from "./ShapeContainer.js";

export class Group extends Shape implements ShapeContainer {
  private readonly members: Shape[] = [];

  constructor(id: string, fill: string | null = null, stroke: string | null = null, strokeWidth: string | null = null) {
    super(id, { fill, stroke, strokeWidth });
  }

  get tagName(): string { return "g"; }
  get children(): readonly Shape[] { return this.members; }
  move(dx: number, dy: number): void { for (const child of this.members) child.move(dx, dy); }
  scale(factor: number): void { for (const child of this.members) child.scale(factor); }
  clone(): Group {
    const copy = new Group(this.id, this.fill, this.stroke, this.strokeWidth);
    for (const child of this.members) copy.insertChild(copy.children.length, child.clone());
    return copy;
  }
  protected geometryAttributes(): Record<string, string> { return {}; }
  protected setGeometryAttribute(name: string, _value: string): void { this.unknownAttribute(name); }
  geometrySummary(): string { return ""; }

  insertChild(index: number, shape: Shape): void {
    let ancestor: ShapeContainer | null = this;
    while (ancestor instanceof Shape) {
      if (ancestor === shape) throw new EditorError(`cannot add a container into its own descendant: ${shape.id}`);
      ancestor = ancestor.parent;
    }
    if (!Number.isInteger(index) || index < 0 || index > this.members.length) throw new EditorError("invalid child position");
    shape.attachTo(this);
    this.members.splice(index, 0, shape);
  }

  removeChild(shape: Shape): Shape {
    const index = this.members.indexOf(shape);
    if (index < 0) throw new EditorError(`shape is not a child of ${this.id}: ${shape.id}`);
    this.members.splice(index, 1);
    shape.detachFrom(this);
    return shape;
  }

  indexOf(shape: Shape): number { return this.members.indexOf(shape); }
}
