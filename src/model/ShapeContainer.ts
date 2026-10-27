import type { Shape } from "./Shape.js";

export interface ShapeContainer {
  readonly id: string;
  readonly children: readonly Shape[];
  insertChild(index: number, shape: Shape): void;
  removeChild(shape: Shape): Shape;
}
