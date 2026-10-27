import { EditorError } from "../core/EditorError.js";
import { Shape } from "../model/Shape.js";
import type { Command, MutationKind } from "./Command.js";
import type { CommandContext } from "./CommandContext.js";

export abstract class CommandBase implements Command {
  abstract readonly name: string;

  protected constructor(private readonly kind: MutationKind) {}

  mutationKind(_args: string[]): MutationKind { return this.kind; }
  abstract execute(context: CommandContext, args: string[]): string;

  protected requireCount(args: string[], count: number, usage: string): void {
    if (args.length !== count) throw new EditorError(`usage: ${usage}`);
  }

  protected requireRange(args: string[], minimum: number, maximum: number, usage: string): void {
    if (args.length < minimum || args.length > maximum) throw new EditorError(`usage: ${usage}`);
  }

  protected number(value: string, name: string): number { return Shape.parseNumber(value, name); }
}
