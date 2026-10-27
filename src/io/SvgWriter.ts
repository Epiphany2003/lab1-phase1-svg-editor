import { Group } from "../model/Group.js";
import { Shape } from "../model/Shape.js";
import { SvgDocument } from "../model/SvgDocument.js";

export class SvgWriter {
  write(document: SvgDocument): string {
    const children = document.children.map((shape) => this.writeShape(shape, 2)).join("\n");
    const body = children ? `\n${children}\n` : "\n";
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">${body}</svg>\n`;
  }

  private writeShape(shape: Shape, indentation: number): string {
    const pad = " ".repeat(indentation);
    const attrs = Object.entries(shape.svgAttributes())
      .map(([key, value]) => `${key}="${this.escapeAttribute(value)}"`)
      .join(" ");
    if (shape instanceof Group) {
      if (shape.children.length === 0) return `${pad}<g ${attrs}/>`;
      const children = shape.children.map((child) => this.writeShape(child, indentation + 2)).join("\n");
      return `${pad}<g ${attrs}>\n${children}\n${pad}</g>`;
    }
    if (shape.textContent !== null) return `${pad}<text ${attrs}>${this.escapeText(shape.textContent)}</text>`;
    return `${pad}<${shape.tagName} ${attrs}/>`;
  }

  private escapeAttribute(value: string): string {
    return this.escapeText(value).replaceAll('"', "&quot;").replaceAll("'", "&apos;");
  }

  private escapeText(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
}
