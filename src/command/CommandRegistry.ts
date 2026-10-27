import { EditorError } from "../core/EditorError.js";
import type { Command } from "./Command.js";

export class CommandRegistry {
  private readonly commands = new Map<string, Command>();

  constructor(commands: Command[]) {
    for (const command of commands) this.register(command);
  }

  register(command: Command): void {
    if (this.commands.has(command.name)) throw new EditorError(`command already registered: ${command.name}`);
    this.commands.set(command.name, command);
  }

  require(name: string): Command {
    const command = this.commands.get(name);
    if (!command) throw new EditorError(`unknown command: ${name}`);
    return command;
  }

  all(): Command[] { return [...this.commands.values()]; }
}
