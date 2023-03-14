export enum NotificationVariant {
    PlaceBet = "place-bet",
    MakeDecision = "make-decision",
    Blackjack = 'blackjack',
    StandOrTakeMoney = "stand-or-take-money",
    Victory = "victory",
    Finish = "finish",
    RequestError = "request-error"
}
export type Notification = {
    type: NotificationVariant,
    text: string
}
