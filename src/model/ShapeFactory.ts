import { EditorError } from "../core/EditorError.js";
import { Circle } from "./Circle.js";
import { Ellipse } from "./Ellipse.js";
import { Group } from "./Group.js";
import { Line } from "./Line.js";
import { Rect } from "./Rect.js";
import { Shape } from "./Shape.js";
import { Text } from "./Text.js";

export class ShapeFactory {
  create(type: string, id: string, args: string[]): Shape {
    const number = (value: string, label: string): number => Shape.parseNumber(value, label);
    switch (type) {
      case "rect":
        if (args.length < 4 || args.length > 5) throw new EditorError("usage: create rect <id> <x> <y> <w> <h> [fill]");
        return new Rect(id, number(args[0]!, "x"), number(args[1]!, "y"), number(args[2]!, "width"), number(args[3]!, "height"), args[4] ?? null);
      case "circle":
        if (args.length < 3 || args.length > 4) throw new EditorError("usage: create circle <id> <cx> <cy> <r> [fill]");
        return new Circle(id, number(args[0]!, "cx"), number(args[1]!, "cy"), number(args[2]!, "r"), args[3] ?? null);
      case "ellipse":
        if (args.length < 4 || args.length > 5) throw new EditorError("usage: create ellipse <id> <cx> <cy> <rx> <ry> [fill]");
        return new Ellipse(id, number(args[0]!, "cx"), number(args[1]!, "cy"), number(args[2]!, "rx"), number(args[3]!, "ry"), args[4] ?? null);
      case "line":
        if (args.length < 4 || args.length > 5) throw new EditorError("usage: create line <id> <x1> <y1> <x2> <y2> [stroke]");
        return new Line(id, number(args[0]!, "x1"), number(args[1]!, "y1"), number(args[2]!, "x2"), number(args[3]!, "y2"), args[4] ?? null);
      case "text":
        if (args.length !== 3) throw new EditorError('usage: create text <id> <x> <y> "content"');
        return new Text(id, number(args[0]!, "x"), number(args[1]!, "y"), args[2]!);
      case "g":
        if (args.length !== 0) throw new EditorError("usage: create g <id>");
        return new Group(id);
      default:
        throw new EditorError(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
  }

  createImported(type: string, id: string, attributes: Record<string, string>, content = ""): Shape {
    const value = (name: string, fallback = "0"): string => attributes[name] ?? fallback;
    const number = (name: string): number => Shape.parseNumber(value(name), name);
    const fill = attributes.fill ?? null;
    const stroke = attributes.stroke ?? null;
    const strokeWidth = attributes["stroke-width"] ?? null;
    switch (type) {
      case "rect": return new Rect(id, number("x"), number("y"), number("width"), number("height"), fill, stroke, strokeWidth);
      case "circle": return new Circle(id, number("cx"), number("cy"), number("r"), fill, stroke, strokeWidth);
      case "ellipse": return new Ellipse(id, number("cx"), number("cy"), number("rx"), number("ry"), fill, stroke, strokeWidth);
      case "line": return new Line(id, number("x1"), number("y1"), number("x2"), number("y2"), stroke, strokeWidth);
      case "text": return new Text(id, number("x"), number("y"), content, fill, stroke, strokeWidth);
      case "g": return new Group(id, fill, stroke, strokeWidth);
      default: throw new EditorError(`unsupported SVG element: ${type}`);
    }
  }
}
