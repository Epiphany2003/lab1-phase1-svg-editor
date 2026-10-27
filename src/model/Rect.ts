import { EditorError } from "../core/EditorError.js";
import { Shape } from "./Shape.js";

export class Rect extends Shape {
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;

  constructor(id: string, x: number, y: number, width: number, height: number, fill: string | null = null, stroke: string | null = null, strokeWidth: string | null = null) {
    super(id, { fill, stroke, strokeWidth });
    if (width < 0 || height < 0) throw new EditorError("rectangle dimensions must not be negative");
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get width(): number { return this._width; }
  get height(): number { return this._height; }
  get tagName(): string { return "rect"; }
  move(dx: number, dy: number): void { this._x += dx; this._y += dy; }
  scale(factor: number): void { this._x *= factor; this._y *= factor; this._width *= factor; this._height *= factor; }
  clone(): Rect { return new Rect(this.id, this.x, this.y, this.width, this.height, this.fill, this.stroke, this.strokeWidth); }
  protected geometryAttributes(): Record<string, string> { return { x: String(this._x), y: String(this._y), width: String(this._width), height: String(this._height) }; }
  protected setGeometryAttribute(name: string, value: string): void {
    const number = Shape.parseNumber(value, name);
    if ((name === "width" || name === "height") && number < 0) throw new EditorError(`${name} must not be negative`);
    if (name === "x") this._x = number;
    else if (name === "y") this._y = number;
    else if (name === "width") this._width = number;
    else if (name === "height") this._height = number;
    else this.unknownAttribute(name);
  }
  geometrySummary(): string { return `x=${this._x} y=${this._y} w=${this._width} h=${this._height}`; }
}
