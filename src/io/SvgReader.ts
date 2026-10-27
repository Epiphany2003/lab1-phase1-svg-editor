import { XMLParser, XMLValidator } from "fast-xml-parser";
import { EditorError } from "../core/EditorError.js";
import { Group } from "../model/Group.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";

type XmlNode = Record<string, unknown>;

export class SvgReader {
  private readonly parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
  });

  constructor(private readonly factory = new ShapeFactory()) {}

  read(xml: string): { document: SvgDocument; warnings: string[] } {
    const validation = XMLValidator.validate(xml);
    if (validation !== true) throw new EditorError(`invalid SVG: ${validation.err.msg}`);
    const parsed = this.parser.parse(xml) as XmlNode[];
    const root = parsed.find((node) => typeof node.svg === "object") as XmlNode | undefined;
    if (!root) throw new EditorError("invalid SVG: missing <svg> root element");
    const rootAttributes = this.attributes(root);
    const viewBox = rootAttributes.viewBox?.trim().split(/[\s,]+/).map(Number);
    const width = this.dimension(rootAttributes.width, viewBox?.[2] ?? 800);
    const height = this.dimension(rootAttributes.height, viewBox?.[3] ?? 600);
    const document = new SvgDocument(width, height);
    const warnings: string[] = [];
    const counters = new Map<string, number>();
    const addNodes = (nodes: XmlNode[], parent: Group | SvgDocument): void => {
      for (const node of nodes) {
        const tag = Object.keys(node).find((key) => key !== ":@" && key !== "#text");
        if (!tag) continue;
        const localTag = tag.split(":").at(-1)!;
        if (localTag === "#text") continue;
        const body = node[tag];
        if (!Array.isArray(body)) throw new EditorError(`invalid SVG element: ${localTag}`);
        const attrs = this.attributes(node);
        let id = attrs.id;
        if (!id) {
          let sequence = counters.get(localTag) ?? 0;
          do {
            sequence += 1;
            id = `${localTag}${sequence}`;
          } while (document.findById(id));
          counters.set(localTag, sequence);
          warnings.push(`warning: assigned id ${id} to unnamed <${localTag}>`);
        }
        if (document.findById(id)) throw new EditorError(`id already exists: ${id}`);
        const text = body.map((child) => {
          const textValue = child["#text"];
          return typeof textValue === "string" ? textValue : "";
        }).join("");
        const shape = this.factory.createImported(localTag, id, attrs, text);
        parent.insertChild(parent.children.length, shape);
        if (shape instanceof Group) addNodes(body as XmlNode[], shape);
      }
    };
    addNodes(root.svg as XmlNode[], document);
    return { document, warnings };
  }

  private attributes(node: XmlNode): Record<string, string> {
    const raw = node[":@"];
    if (typeof raw !== "object" || raw === null) return {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key.startsWith("@_")) result[key.slice(2)] = String(value);
    }
    return result;
  }

  private dimension(raw: string | undefined, fallback: number): number {
    if (raw === undefined) return fallback;
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value) || value <= 0) throw new EditorError(`invalid SVG canvas dimension: ${raw}`);
    return value;
  }
}
