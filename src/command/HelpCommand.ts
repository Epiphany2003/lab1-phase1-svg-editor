import { CommandBase } from "./CommandBase.js";
import type { CommandContext } from "./CommandContext.js";

export class HelpCommand extends CommandBase {
  readonly name = "help";
  constructor() { super("display"); }
  execute(_context: CommandContext, args: string[]): string {
    this.requireCount(args, 0, "help");
    return [
      "Document: init [w] [h] | read <file.svg> | save [file.svg] | canvas [w] [h]",
      "Create/edit: create <type> <id> [params…] [in <gid>] | delete <id> | move <id> <dx> <dy> | scale <id> <factor>",
      "            set <id> <attr> <value> | group <gid> <id1> <id2>… | ungroup <gid> | addto <gid> <id> | front <id> | back <id>",
      "Display/history: tree [id] | show <id> | undo | redo | help",
      "Types: rect, circle, ellipse, line, text, g. Box is reserved for the plugin stage.",
    ].join("\n");
  }
}
