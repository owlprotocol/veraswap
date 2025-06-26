import { CreateCommandParamsGeneric, RoutePlanner } from "./routerCommands.js";

// TODO: clean this up, when we cleanup CreateCommandParamsGeneric
export function addCommandsToRoutePlanner(routePlanner: RoutePlanner, commands: CreateCommandParamsGeneric[]) {
    // @ts-expect-error Using generic type here, refine later
    commands.forEach((command) => routePlanner.addCommand(...command));
}
