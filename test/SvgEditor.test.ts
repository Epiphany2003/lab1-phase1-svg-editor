import { describe, expect, it } from "vitest";
import { CliApplication } from "../src/cli/CliApplication.js";
import { CommandLineTokenizer } from "../src/cli/CommandLineTokenizer.js";
import { CommandContext } from "../src/command/CommandContext.js";
import { CommandRegistry } from "../src/command/CommandRegistry.js";
import { AddToCommand } from "../src/command/AddToCommand.js";
import { BackCommand } from "../src/command/BackCommand.js";
import { CanvasCommand } from "../src/command/CanvasCommand.js";
import { CreateCommand } from "../src/command/CreateCommand.js";
import { DeleteCommand } from "../src/command/DeleteCommand.js";
import { FrontCommand } from "../src/command/FrontCommand.js";
import { GroupCommand } from "../src/command/GroupCommand.js";
import { HelpCommand } from "../src/command/HelpCommand.js";
import { InitCommand } from "../src/command/InitCommand.js";
import { MoveCommand } from "../src/command/MoveCommand.js";
import { ReadCommand } from "../src/command/ReadCommand.js";
import { RedoCommand } from "../src/command/RedoCommand.js";
import { SaveCommand } from "../src/command/SaveCommand.js";
import { ScaleCommand } from "../src/command/ScaleCommand.js";
import { SetCommand } from "../src/command/SetCommand.js";
import { ShowCommand } from "../src/command/ShowCommand.js";
import { TreeCommand } from "../src/command/TreeCommand.js";
import { UndoCommand } from "../src/command/UndoCommand.js";
import { UngroupCommand } from "../src/command/UngroupCommand.js";
import { Circle } from "../src/model/Circle.js";
import { Group } from "../src/model/Group.js";
import { Rect } from "../src/model/Rect.js";
import { SvgDocument } from "../src/model/SvgDocument.js";
import { Text } from "../src/model/Text.js";
import { SvgReader } from "../src/io/SvgReader.js";
import { SvgWriter } from "../src/io/SvgWriter.js";
import { MemoryFileStore } from "./MemoryFileStore.js";

function makeApplication(fileStore = new MemoryFileStore()): { app: CliApplication; context: CommandContext; files: MemoryFileStore } {
  const files = fileStore as MemoryFileStore;
  const context = new CommandContext(files);
  const registry = new CommandRegistry([
    new InitCommand(), new ReadCommand(), new SaveCommand(), new CanvasCommand(), new CreateCommand(),
    new DeleteCommand(), new MoveCommand(), new ScaleCommand(), new SetCommand(), new GroupCommand(),
    new UngroupCommand(), new AddToCommand(), new FrontCommand(), new BackCommand(), new TreeCommand(),
    new ShowCommand(), new HelpCommand(), new UndoCommand(), new RedoCommand(),
  ]);
  return { app: new CliApplication(registry, context), context, files };
}

describe("command tokenizer", () => {
  it("keeps quoted text and Windows paths intact and recognizes only full-line comments", () => {
    const tokenizer = new CommandLineTokenizer();
    expect(tokenizer.tokenize('create text title 20 40 "My Diagram"')).toEqual(["create", "text", "title", "20", "40", "My Diagram"]);
    expect(tokenizer.tokenize('read "C:\\work files\\demo.svg"')).toEqual(["read", "C:\\work files\\demo.svg"]);
    expect(tokenizer.tokenize("# a comment")).toEqual([]);
    expect(tokenizer.tokenize("create rect r 0 0 10 10 #eee").at(-1)).toBe("#eee");
  });
});

describe("CLI editing and history", () => {
  it("builds nested shapes and moves/scales containers as a composite", () => {
    const { app, context } = makeApplication();
    expect(app.runLine("init 800 600")).toBe("canvas 800x600 created");
    expect(app.runLine("create g flow")).toBe("g#flow created");
    expect(app.runLine("create g node in flow")).toBe("g#node created in g#flow");
    expect(app.runLine("create rect box 10 20 100 50 #eee in node")).toBe("rect#box created in g#node");
    expect(app.runLine('create text label 20 40 "two words" in node')).toBe("text#label created in g#node");
    expect(app.runLine("move node 5 7")).toContain("moved by (5,7)");
    expect(app.runLine("scale flow 2")).toContain("scaled by 2");
    const rect = context.document?.requireShape("box") as Rect;
    const label = context.document?.requireShape("label") as Text;
    expect([rect.x, rect.y, rect.width, rect.height]).toEqual([30, 54, 200, 100]);
    expect([label.x, label.y, label.content]).toEqual([50, 94, "two words"]);
  });

  it("undoes one command at a time, redoes, and clears redo after a new edit", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create circle c 100 100 20 red");
    app.runLine("move c 30 0");
    expect((context.document?.requireShape("c") as Circle).cx).toBe(130);
    expect(app.runLine("undo")).toBe("undid move c 30 0");
    expect((context.document?.requireShape("c") as Circle).cx).toBe(100);
    expect(app.runLine("redo")).toBe("redid move c 30 0");
    expect((context.document?.requireShape("c") as Circle).cx).toBe(130);
    app.runLine("undo");
    app.runLine("set c fill blue");
    expect(app.runLine("redo")).toBe("error: nothing to redo");
    expect((context.document?.requireShape("c") as Circle).cx).toBe(100);
  });

  it("restores failed edit state, rejects invalid scale, and enforces the I/O history boundary", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create rect r 1 2 3 4");
    expect(app.runLine("scale r 0")).toBe("error: scale factor must be positive");
    expect((context.document?.requireShape("r") as Rect).x).toBe(1);
    expect(app.runLine("set r opacity 0.5")).toBe("error: unknown attribute: opacity");
    expect(app.runLine("save out.svg")).toContain("saved to out.svg");
    expect(app.runLine("undo")).toBe("error: undo not allowed after io command");
    app.runLine("move r 1 0");
    expect(app.runLine("undo")).toBe("undid move r 1 0");
  });

  it("groups, preserves child order, ungroups, and reorders siblings", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create g parent");
    app.runLine("create rect a 0 0 1 1 in parent");
    app.runLine("create rect b 0 0 1 1 in parent");
    app.runLine("create circle c 0 0 1 in parent");
    app.runLine("group cluster a c");
    const group = context.document?.requireShape("cluster") as Group;
    expect(group.children.map((shape) => shape.id)).toEqual(["a", "c"]);
    expect((context.document?.requireShape("parent") as Group).children.map((shape) => shape.id)).toEqual(["cluster", "b"]);
    app.runLine("ungroup cluster");
    expect((context.document?.requireShape("parent") as Group).children.map((shape) => shape.id)).toEqual(["a", "c", "b"]);
    app.runLine("back c");
    expect((context.document?.requireShape("parent") as Group).children.map((shape) => shape.id)).toEqual(["c", "a", "b"]);
    app.runLine("front c");
    expect((context.document?.requireShape("parent") as Group).children.map((shape) => shape.id)).toEqual(["a", "b", "c"]);
    app.runLine("create g top-level");
    expect(app.runLine("ungroup top-level")).toBe("error: cannot ungroup top-level container: top-level");
  });

  it("rejects ancestor/descendant grouping without changing the document", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create g parent");
    app.runLine("create rect child 0 0 1 1 in parent");
    expect(app.runLine("group bad parent child")).toBe("error: cannot group a container into its own descendant: parent");
    expect(context.document?.findById("bad")).toBeNull();
    expect(context.document?.requireShape("child").parent?.id).toBe("parent");
  });

  it("moves existing shapes into containers and restores subtree deletion with undo", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create g bucket");
    app.runLine("create rect loose 0 0 10 10");
    expect(app.runLine("addto bucket loose")).toBe("loose moved into g#bucket");
    expect(context.document?.requireShape("loose").parent?.id).toBe("bucket");
    expect(app.runLine("delete bucket")).toBe("g#bucket deleted");
    expect(context.document?.findById("loose")).toBeNull();
    app.runLine("undo");
    expect(context.document?.requireShape("loose").parent?.id).toBe("bucket");
  });

  it("validates create destinations and preserves state after errors", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create rect plain 0 0 10 10");
    expect(app.runLine("create rect bad 0 0 1 1 in plain")).toBe("error: not a container: plain");
    expect(app.runLine("create rect plain 0 0 1 1")).toBe("error: id already exists: plain");
    expect(app.runLine("create hexagon h 0 0")).toBe("error: unknown shape type: hexagon (is the plugin loaded?)");
    expect(context.document?.flatten().map((shape) => shape.id)).toEqual(["plain"]);
  });

  it("creates the six built-in types and leaves box for the plugin stage", () => {
    const { app, context } = makeApplication();
    app.runLine("init");
    app.runLine("create rect r 1 2 3 4");
    app.runLine("create circle c 5 6 7");
    app.runLine("create ellipse e 8 9 10 11");
    app.runLine("create line l 12 13 14 15 black");
    app.runLine('create text t 16 17 "hello world"');
    app.runLine("create g group");
    expect(context.document?.flatten().map((shape) => shape.tagName)).toEqual(["rect", "circle", "ellipse", "line", "text", "g"]);
    expect(app.runLine('create box future 0 0 1 1 "title"')).toBe("error: unknown shape type: box (is the plugin loaded?)");
  });
});

describe("SVG serialization", () => {
  it("round-trips supported elements, text, groups, and XML escaping", () => {
    const document = new SvgDocument(400, 200);
    const group = new Group("flow");
    document.insertChild(0, group);
    group.insertChild(0, new Rect("start", 10, 20, 100, 50, "#eee"));
    group.insertChild(1, new Text("label", 20, 40, "A & B < C"));
    const xml = new SvgWriter().write(document);
    expect(xml).toContain("A &amp; B &lt; C");
    const restored = new SvgReader().read(xml).document;
    expect(restored.width).toBe(400);
    expect((restored.requireShape("start") as Rect).width).toBe(100);
    expect((restored.requireShape("label") as Text).content).toBe("A & B < C");
    expect(restored.requireShape("label").parent?.id).toBe("flow");
  });

  it("assigns and reports missing ids and rejects duplicate ids", () => {
    const reader = new SvgReader();
    const result = reader.read('<svg width="400" height="300"><rect x="0" y="0" width="10" height="10"/><g id="g1"><circle cx="5" cy="5" r="2"/></g></svg>');
    expect(result.warnings).toEqual([
      "warning: assigned id rect1 to unnamed <rect>",
      "warning: assigned id circle1 to unnamed <circle>",
    ]);
    expect(result.document.findById("rect1")).not.toBeNull();
    expect(() => reader.read('<svg><g id="g"><rect id="dup"/><circle id="dup"/></g></svg>')).toThrow("id already exists: dup");
  });

  it("rejects unsupported imported elements", () => {
    expect(() => new SvgReader().read('<svg><path id="p" d="M0 0"/></svg>')).toThrow("unsupported SVG element: path");
  });

  it("reads files with generated ids and saves back to the read path", () => {
    const files = new MemoryFileStore();
    files.files.set("incoming.svg", '<svg width="120" height="80"><rect x="1" y="2" width="30" height="40"/></svg>');
    const { app } = makeApplication(files);
    expect(app.runLine("read incoming.svg")).toBe("warning: assigned id rect1 to unnamed <rect>\nread incoming.svg (1 elements)");
    expect(app.runLine("save")).toBe("saved to incoming.svg (1 elements)");
    expect(files.files.get("incoming.svg")).toContain('id="rect1"');
  });
});
