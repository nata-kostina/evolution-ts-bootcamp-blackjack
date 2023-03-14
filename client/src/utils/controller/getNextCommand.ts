import { PlayerCommand, Command, ECommand, GameStatus } from "../../types/types";

export function isPlayerCommand(command: Command): command is PlayerCommand {
    return Object.values(command).includes(PlayerCommand.InitPlayer);
}

type GetNextCommand = (status: GameStatus) => ECommand;

export const getNextCommand: GetNextCommand = (status) => {
    switch (status) {
        case "waits-for-dealer":
            return ECommand.Check_combination;
        case "waiting-cards":
            return ECommand.GET_CARDS;
        default:
            return ECommand.Waiting;
    }
};
