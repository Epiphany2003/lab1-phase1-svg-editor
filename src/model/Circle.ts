import { EditorError } from "../core/EditorError.js";
import { Shape } from "./Shape.js";

export class Circle extends Shape {
  private _cx: number;
  private _cy: number;
  private _r: number;

  constructor(id: string, cx: number, cy: number, r: number, fill: string | null = null, stroke: string | null = null, strokeWidth: string | null = null) {
    super(id, { fill, stroke, strokeWidth });
    if (r < 0) throw new EditorError("radius must not be negative");
    this._cx = cx;
    this._cy = cy;
    this._r = r;
  }
  get cx(): number { return this._cx; }
  get cy(): number { return this._cy; }
  get r(): number { return this._r; }
  get tagName(): string { return "circle"; }
  move(dx: number, dy: number): void { this._cx += dx; this._cy += dy; }
  scale(factor: number): void { this._cx *= factor; this._cy *= factor; this._r *= factor; }
  clone(): Circle { return new Circle(this.id, this.cx, this.cy, this.r, this.fill, this.stroke, this.strokeWidth); }
  protected geometryAttributes(): Record<string, string> { return { cx: String(this._cx), cy: String(this._cy), r: String(this._r) }; }
  protected setGeometryAttribute(name: string, value: string): void {
    const number = Shape.parseNumber(value, name);
    if (name === "r" && number < 0) throw new EditorError("r must not be negative");
    if (name === "cx") this._cx = number;
    else if (name === "cy") this._cy = number;
    else if (name === "r") this._r = number;
    else this.unknownAttribute(name);
  }
  geometrySummary(): string { return `cx=${this._cx} cy=${this._cy} r=${this._r}`; }
}
