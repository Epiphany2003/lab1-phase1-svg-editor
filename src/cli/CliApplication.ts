import { EditorError } from "../core/EditorError.js";
import { CommandRegistry } from "../command/CommandRegistry.js";
import { CommandContext } from "../command/CommandContext.js";
import { HistoryManager } from "../history/HistoryManager.js";
import { CommandLineTokenizer } from "./CommandLineTokenizer.js";

export class CliApplication {
  constructor(
    private readonly registry: CommandRegistry,
    readonly context: CommandContext,
    private readonly tokenizer = new CommandLineTokenizer(),
  ) {
    context.history = context.history ?? new HistoryManager();
  }

  runLine(line: string): string {
    try {
      const tokens = this.tokenizer.tokenize(line);
      if (tokens.length === 0) return "";
      const [name, ...args] = tokens;
      const command = this.registry.require(name!);
      const kind = command.mutationKind(args);
      if (kind === "edit") return this.context.requireHistory().execute(command, this.context, args);
      if (kind === "io") {
        const output = command.execute(this.context, args);
        this.context.requireHistory().markIoBoundary();
        return output;
      }
      return command.execute(this.context, args);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `error: ${message.replace(/[\r\n]+/g, " ")}`;
    }
  }
}
