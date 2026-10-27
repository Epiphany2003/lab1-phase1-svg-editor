import type { CommandContext } from "./CommandContext.js";

export type MutationKind = "edit" | "io" | "display" | "history";

export interface Command {
  readonly name: string;
  mutationKind(args: string[]): MutationKind;
  execute(context: CommandContext, args: string[]): string;
}
