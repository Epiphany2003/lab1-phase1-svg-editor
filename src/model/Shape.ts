import { EditorError } from "../core/EditorError.js";
import type { ShapeContainer } from "./ShapeContainer.js";

export abstract class Shape {
  private _parent: ShapeContainer | null = null;
  private _fill: string | null;
  private _stroke: string | null;
  private _strokeWidth: string | null;

  protected constructor(
    readonly id: string,
    style: { fill?: string | null; stroke?: string | null; strokeWidth?: string | null } = {},
  ) {
    if (id.trim() === "") throw new EditorError("id must not be empty");
    this._fill = style.fill ?? null;
    this._stroke = style.stroke ?? null;
    this._strokeWidth = style.strokeWidth ?? null;
  }

  abstract get tagName(): string;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  protected abstract geometryAttributes(): Record<string, string>;
  protected abstract setGeometryAttribute(name: string, value: string): void;
  abstract geometrySummary(): string;

  get textContent(): string | null { return null; }

  get parent(): ShapeContainer | null {
    return this._parent;
  }

  get fill(): string | null {
    return this._fill;
  }

  get stroke(): string | null {
    return this._stroke;
  }

  get strokeWidth(): string | null {
    return this._strokeWidth;
  }

  attachTo(container: ShapeContainer): void {
    if (this._parent !== null) throw new EditorError(`shape already has a parent: ${this.id}`);
    this._parent = container;
  }

  detachFrom(container: ShapeContainer): void {
    if (this._parent !== container) throw new EditorError(`shape is not a child of ${container.id}: ${this.id}`);
    this._parent = null;
  }

  setAttribute(name: string, value: string): void {
    if (name === "fill") {
      this._fill = value;
      return;
    }
    if (name === "stroke") {
      this._stroke = value;
      return;
    }
    if (name === "stroke-width") {
      const width = Shape.parseNumber(value, name);
      if (width < 0) throw new EditorError("stroke-width must not be negative");
      this._strokeWidth = String(width);
      return;
    }
    this.setGeometryAttribute(name, value);
  }

  svgAttributes(): Record<string, string> {
    const attributes: Record<string, string> = { id: this.id, ...this.geometryAttributes() };
    if (this._fill !== null) attributes.fill = this._fill;
    if (this._stroke !== null) attributes.stroke = this._stroke;
    if (this._strokeWidth !== null) attributes["stroke-width"] = this._strokeWidth;
    return attributes;
  }

  static parseNumber(value: string, name: string): number {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new EditorError(`${name} must be a finite number`);
    return number;
  }

  protected unknownAttribute(name: string): never {
    throw new EditorError(`unknown attribute: ${name}`);
  }
}
