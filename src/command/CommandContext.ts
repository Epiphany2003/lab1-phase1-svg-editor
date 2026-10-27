import { EditorError } from "../core/EditorError.js";
import { FileStore } from "../io/FileStore.js";
import { SvgReader } from "../io/SvgReader.js";
import { SvgWriter } from "../io/SvgWriter.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";
import type { HistoryManager } from "../history/HistoryManager.js";

export class CommandContext {
  document: SvgDocument | null = null;
  history: HistoryManager | null = null;

  constructor(
    readonly fileStore = new FileStore(),
    readonly svgReader = new SvgReader(),
    readonly svgWriter = new SvgWriter(),
    readonly shapeFactory = new ShapeFactory(),
  ) {}

  requireDocument(): SvgDocument {
    if (!this.document) throw new EditorError("no document. use 'init' or 'read' first");
    return this.document;
  }

  requireHistory(): HistoryManager {
    if (!this.history) throw new EditorError("history manager is unavailable");
    return this.history;
  }
}
