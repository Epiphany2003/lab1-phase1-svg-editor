import { EditorError } from "../core/EditorError.js";
import { Group } from "./Group.js";
import { Shape } from "./Shape.js";
import type { ShapeContainer } from "./ShapeContainer.js";

export class SvgDocument implements ShapeContainer {
  private readonly members: Shape[] = [];
  private _width: number;
  private _height: number;
  filePath: string | null = null;

  constructor(width = 800, height = 600) {
    if (!(width > 0) || !(height > 0) || !Number.isFinite(width) || !Number.isFinite(height)) {
      throw new EditorError("canvas dimensions must be positive finite numbers");
    }
    this._width = width;
    this._height = height;
  }

  get id(): string { return "svg"; }
  get width(): number { return this._width; }
  get height(): number { return this._height; }
  get children(): readonly Shape[] { return this.members; }

  insertChild(index: number, shape: Shape): void {
    if (!Number.isInteger(index) || index < 0 || index > this.members.length) throw new EditorError("invalid child position");
    if (this.findById(shape.id)) throw new EditorError(`id already exists: ${shape.id}`);
    shape.attachTo(this);
    this.members.splice(index, 0, shape);
  }

  removeChild(shape: Shape): Shape {
    const index = this.members.indexOf(shape);
    if (index < 0) throw new EditorError(`shape is not a child of svg: ${shape.id}`);
    this.members.splice(index, 1);
    shape.detachFrom(this);
    return shape;
  }

  add(shape: Shape, containerId?: string): void {
    if (this.findById(shape.id)) throw new EditorError(`id already exists: ${shape.id}`);
    const container = containerId === undefined ? this : this.requireGroup(containerId);
    container.insertChild(container.children.length, shape);
  }

  findById(id: string): Shape | null {
    for (const shape of this.members) {
      if (shape.id === id) return shape;
      if (shape instanceof Group) {
        const nested = this.findInGroup(shape, id);
        if (nested) return nested;
      }
    }
    return null;
  }

  requireShape(id: string): Shape {
    const shape = this.findById(id);
    if (!shape) throw new EditorError(`no such shape: ${id}`);
    return shape;
  }

  requireGroup(id: string): Group {
    const shape = this.requireShape(id);
    if (!(shape instanceof Group)) throw new EditorError(`not a container: ${id}`);
    return shape;
  }

  parentOf(shape: Shape): ShapeContainer {
    if (!shape.parent) throw new EditorError(`shape is not in the document: ${shape.id}`);
    return shape.parent;
  }

  parentName(shape: Shape): string {
    const parent = this.parentOf(shape);
    return parent instanceof SvgDocument ? "svg" : `g#${parent.id}`;
  }

  delete(id: string): Shape {
    const shape = this.requireShape(id);
    return this.parentOf(shape).removeChild(shape);
  }

  addTo(containerId: string, shapeId: string): void {
    const container = this.requireGroup(containerId);
    const shape = this.requireShape(shapeId);
    if (container === shape || this.isAncestor(shape, container)) {
      throw new EditorError(`cannot add a container into its own descendant: ${shape.id}`);
    }
    this.parentOf(shape).removeChild(shape);
    container.insertChild(container.children.length, shape);
  }

  group(newId: string, ids: string[]): Group {
    if (this.findById(newId)) throw new EditorError(`id already exists: ${newId}`);
    if (ids.length < 2) throw new EditorError("group requires at least two shapes");
    if (new Set(ids).size !== ids.length) throw new EditorError("duplicate shape id in group command");
    const shapes = ids.map((id) => this.requireShape(id));
    for (const ancestor of shapes) {
      for (const descendant of shapes) {
        if (ancestor !== descendant && this.isAncestor(ancestor, descendant)) {
          throw new EditorError(`cannot group a container into its own descendant: ${ancestor.id}`);
        }
      }
    }
    const documentOrder = this.flatten();
    const ordered = shapes.slice().sort((left, right) => documentOrder.indexOf(left) - documentOrder.indexOf(right));
    const firstParent = this.parentOf(ordered[0]!);
    const insertionIndex = firstParent.children.indexOf(ordered[0]!);
    const group = new Group(newId);
    for (const shape of ordered) this.parentOf(shape).removeChild(shape);
    for (const shape of ordered) group.insertChild(group.children.length, shape);
    firstParent.insertChild(insertionIndex, group);
    return group;
  }

  ungroup(id: string): Group {
    const group = this.requireGroup(id);
    const parent = this.parentOf(group);
    if (parent instanceof SvgDocument) throw new EditorError(`cannot ungroup top-level container: ${id}`);
    const index = parent.children.indexOf(group);
    parent.removeChild(group);
    const children = [...group.children];
    for (const child of children) {
      group.removeChild(child);
      parent.insertChild(index + children.indexOf(child), child);
    }
    return group;
  }

  reorder(id: string, front: boolean): void {
    const shape = this.requireShape(id);
    const parent = this.parentOf(shape);
    const current = parent.children.indexOf(shape);
    const target = front ? parent.children.length - 1 : 0;
    if (current === target) return;
    parent.removeChild(shape);
    parent.insertChild(front ? parent.children.length : 0, shape);
  }

  resize(width: number, height: number): void {
    if (!(width > 0) || !(height > 0) || !Number.isFinite(width) || !Number.isFinite(height)) {
      throw new EditorError("canvas dimensions must be positive finite numbers");
    }
    this._width = width;
    this._height = height;
  }

  flatten(): Shape[] {
    const result: Shape[] = [];
    const visit = (shapes: readonly Shape[]): void => {
      for (const shape of shapes) {
        result.push(shape);
        if (shape instanceof Group) visit(shape.children);
      }
    };
    visit(this.members);
    return result;
  }

  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height);
    copy.filePath = this.filePath;
    for (const shape of this.members) copy.insertChild(copy.children.length, shape.clone());
    return copy;
  }

  get elementCount(): number { return this.flatten().length; }

  private findInGroup(group: Group, id: string): Shape | null {
    for (const child of group.children) {
      if (child.id === id) return child;
      if (child instanceof Group) {
        const nested = this.findInGroup(child, id);
        if (nested) return nested;
      }
    }
    return null;
  }

  private isAncestor(ancestor: Shape, descendant: Shape): boolean {
    let parent = descendant.parent;
    while (parent instanceof Group) {
      if (parent === ancestor) return true;
      parent = parent.parent;
    }
    return false;
  }
}
