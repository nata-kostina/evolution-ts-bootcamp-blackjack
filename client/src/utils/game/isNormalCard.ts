import { Card, HoleCard } from "../../types/game.types";

export function isNormalCard(
    card: Card | HoleCard,
): card is Card {
    return (card as Card).suit !== undefined;
}
