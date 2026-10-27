import { createInterface } from "node:readline";
import { AddToCommand } from "./command/AddToCommand.js";
import { BackCommand } from "./command/BackCommand.js";
import { CanvasCommand } from "./command/CanvasCommand.js";
import { CreateCommand } from "./command/CreateCommand.js";
import { DeleteCommand } from "./command/DeleteCommand.js";
import { FrontCommand } from "./command/FrontCommand.js";
import { GroupCommand } from "./command/GroupCommand.js";
import { HelpCommand } from "./command/HelpCommand.js";
import { InitCommand } from "./command/InitCommand.js";
import { MoveCommand } from "./command/MoveCommand.js";
import { ReadCommand } from "./command/ReadCommand.js";
import { RedoCommand } from "./command/RedoCommand.js";
import { SaveCommand } from "./command/SaveCommand.js";
import { ScaleCommand } from "./command/ScaleCommand.js";
import { SetCommand } from "./command/SetCommand.js";
import { ShowCommand } from "./command/ShowCommand.js";
import { TreeCommand } from "./command/TreeCommand.js";
import { UndoCommand } from "./command/UndoCommand.js";
import { UngroupCommand } from "./command/UngroupCommand.js";
import { CliApplication } from "./cli/CliApplication.js";
import { CommandContext } from "./command/CommandContext.js";
import { CommandRegistry } from "./command/CommandRegistry.js";

const registry = new CommandRegistry([
  new InitCommand(), new ReadCommand(), new SaveCommand(), new CanvasCommand(),
  new CreateCommand(), new DeleteCommand(), new MoveCommand(), new ScaleCommand(),
  new SetCommand(), new GroupCommand(), new UngroupCommand(), new AddToCommand(),
  new FrontCommand(), new BackCommand(), new TreeCommand(), new ShowCommand(),
  new HelpCommand(), new UndoCommand(), new RedoCommand(),
]);
const application = new CliApplication(registry, new CommandContext());
const interactive = Boolean(process.stdin.isTTY);
const terminal = createInterface({ input: process.stdin, output: process.stdout, terminal: interactive });

if (interactive) {
  process.stdout.write("svg-editor 0.1 — type 'help' for commands\n");
  terminal.setPrompt("svg> ");
  terminal.prompt();
}

terminal.on("line", (line) => {
  const result = application.runLine(line);
  if (result) process.stdout.write(`${result}\n`);
  if (interactive) terminal.prompt();
});
