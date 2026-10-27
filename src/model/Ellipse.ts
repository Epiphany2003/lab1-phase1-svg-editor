import { EditorError } from "../core/EditorError.js";
import { Shape } from "./Shape.js";

export class Ellipse extends Shape {
  private _cx: number;
  private _cy: number;
  private _rx: number;
  private _ry: number;

  constructor(id: string, cx: number, cy: number, rx: number, ry: number, fill: string | null = null, stroke: string | null = null, strokeWidth: string | null = null) {
    super(id, { fill, stroke, strokeWidth });
    if (rx < 0 || ry < 0) throw new EditorError("ellipse radii must not be negative");
    this._cx = cx;
    this._cy = cy;
    this._rx = rx;
    this._ry = ry;
  }
  get cx(): number { return this._cx; }
  get cy(): number { return this._cy; }
  get rx(): number { return this._rx; }
  get ry(): number { return this._ry; }
  get tagName(): string { return "ellipse"; }
  move(dx: number, dy: number): void { this._cx += dx; this._cy += dy; }
  scale(factor: number): void { this._cx *= factor; this._cy *= factor; this._rx *= factor; this._ry *= factor; }
  clone(): Ellipse { return new Ellipse(this.id, this.cx, this.cy, this.rx, this.ry, this.fill, this.stroke, this.strokeWidth); }
  protected geometryAttributes(): Record<string, string> { return { cx: String(this._cx), cy: String(this._cy), rx: String(this._rx), ry: String(this._ry) }; }
  protected setGeometryAttribute(name: string, value: string): void {
    const number = Shape.parseNumber(value, name);
    if ((name === "rx" || name === "ry") && number < 0) throw new EditorError(`${name} must not be negative`);
    if (name === "cx") this._cx = number;
    else if (name === "cy") this._cy = number;
    else if (name === "rx") this._rx = number;
    else if (name === "ry") this._ry = number;
    else this.unknownAttribute(name);
  }
  geometrySummary(): string { return `cx=${this._cx} cy=${this._cy} rx=${this._rx} ry=${this._ry}`; }
}
