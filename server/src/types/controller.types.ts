import { SpecificID } from ".";

export interface Controller {
    handleStartGame({roomID, playerID}: SpecificID): Promise<void>;
    startPlay({ roomID, playerID }: SpecificID): Promise<void>;
    dealCards: ({ playerID, roomID }: SpecificID) =>  Promise<void>;
    dealMockCards: ({ playerID, roomID }: SpecificID) =>  Promise<void>;
    handleBlackjack({ playerID, roomID }: SpecificID): Promise<void>;
    placeInsurance({ playerID, roomID }: SpecificID): void;
    handleDouble({ playerID, roomID }: SpecificID): Promise<void>;
    handleSurender({ playerID, roomID }: SpecificID): Promise<void>;
    handleHit({ playerID, roomID }: SpecificID): Promise<void>;
    checkDealerCombination({ playerID, roomID }: SpecificID): Promise<void>;
    startDealerPlay({ playerID, roomID }: SpecificID): Promise<void>;
    handlePlayerVictory({ coefficient, playerID, roomID }: SpecificID & { coefficient: number }): Promise<void>;
    handlePlayerLose({ roomID, playerID }: SpecificID): Promise<void>;
    finishRound({ playerID, roomID }: SpecificID): Promise<void>;
    finishGame({ playerID, roomID }: SpecificID): Promise<void>;
    giveInsurance({ playerID, roomID }: SpecificID): void;
    takeOutInsurance({ playerID, roomID }: SpecificID): void;
  }