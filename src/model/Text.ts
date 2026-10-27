import { Shape } from "./Shape.js";

export class Text extends Shape {
  private _x: number;
  private _y: number;
  private _content: string;

  constructor(id: string, x: number, y: number, content: string, fill: string | null = null, stroke: string | null = null, strokeWidth: string | null = null) {
    super(id, { fill, stroke, strokeWidth });
    this._x = x;
    this._y = y;
    this._content = content;
  }
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get content(): string { return this._content; }
  get tagName(): string { return "text"; }
  override get textContent(): string { return this._content; }
  move(dx: number, dy: number): void { this._x += dx; this._y += dy; }
  scale(factor: number): void { this._x *= factor; this._y *= factor; }
  clone(): Text { return new Text(this.id, this.x, this.y, this.content, this.fill, this.stroke, this.strokeWidth); }
  protected geometryAttributes(): Record<string, string> { return { x: String(this._x), y: String(this._y) }; }
  protected setGeometryAttribute(name: string, value: string): void {
    if (name === "text") { this._content = value; return; }
    const number = Shape.parseNumber(value, name);
    if (name === "x") this._x = number;
    else if (name === "y") this._y = number;
    else this.unknownAttribute(name);
  }
  geometrySummary(): string { return `(${this._x},${this._y}) ${JSON.stringify(this._content)}`; }
}
