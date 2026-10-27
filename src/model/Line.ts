import { Shape } from "./Shape.js";

export class Line extends Shape {
  private _x1: number;
  private _y1: number;
  private _x2: number;
  private _y2: number;

  constructor(id: string, x1: number, y1: number, x2: number, y2: number, stroke: string | null = null, strokeWidth: string | null = null) {
    super(id, { stroke, strokeWidth });
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
  }
  get x1(): number { return this._x1; }
  get y1(): number { return this._y1; }
  get x2(): number { return this._x2; }
  get y2(): number { return this._y2; }
  get tagName(): string { return "line"; }
  move(dx: number, dy: number): void { this._x1 += dx; this._y1 += dy; this._x2 += dx; this._y2 += dy; }
  scale(factor: number): void { this._x1 *= factor; this._y1 *= factor; this._x2 *= factor; this._y2 *= factor; }
  clone(): Line { return new Line(this.id, this.x1, this.y1, this.x2, this.y2, this.stroke, this.strokeWidth); }
  protected geometryAttributes(): Record<string, string> { return { x1: String(this._x1), y1: String(this._y1), x2: String(this._x2), y2: String(this._y2) }; }
  protected setGeometryAttribute(name: string, value: string): void {
    const number = Shape.parseNumber(value, name);
    if (name === "x1") this._x1 = number;
    else if (name === "y1") this._y1 = number;
    else if (name === "x2") this._x2 = number;
    else if (name === "y2") this._y2 = number;
    else this.unknownAttribute(name);
  }
  geometrySummary(): string { return `(${this._x1},${this._y1}) -> (${this._x2},${this._y2})`; }
}
