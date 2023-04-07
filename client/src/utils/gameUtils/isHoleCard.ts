import { Card, HoleCard } from "../../types/types";

export function isHoleCard(
    card: Card | HoleCard,
): card is HoleCard {
    return card.id === "hole";
}
export function isNormalCard(
    card: Card | HoleCard,
): card is Card {
    return (card as Card).suit !== undefined;
}
