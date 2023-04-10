/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanvasBase } from "../CanvasBase";
import { SeatBaseCanvasElement } from "./SeatBase.canvas.element";
import { GameMatrix } from "../GameMatrix";
import { CardCanvasElement } from "./Card.canvas.element";
import { Card } from "../../types/game.types";
import { CardAnimation } from "../../types/canvas.types";

export class DealerSeatCanvasElement extends SeatBaseCanvasElement {
    public constructor(base: CanvasBase, matrix: GameMatrix) {
        super(base, matrix, "dealer");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async unholeCard(_card: Card): Promise<void> {
        const cards = this.getCards();
        if (cards.length === 2) {
            const holeCard = cards[1];
            // eslint-disable-next-line max-len
            const card = new CardCanvasElement(
                this.getBase(),
                this.getMatrix(),
                holeCard.getPosition(),
                _card,
            );
            this.addCard(card);
            holeCard.dispose();
            await card.addContent();
            card.setMeshPosition(holeCard.getPosition());
            card.animate(CardAnimation.Unhole);
        }
    }
}
