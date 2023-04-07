export enum NotificationVariant {
  PlaceBet = 'place-bet',
  MakeDecision = 'make-decision',
  Blackjack = 'blackjack',
  StandOrTakeMoney = 'stand-or-take-money',
  Victory = 'victory',
  Finish = 'finish',
  RequestError = 'request-error',
  PlayerLose = 'player-lose',
  Double = 'double',
  Split = 'split',
  Insurance = 'insurance',
  CardsDealt = 'cards-dealt',
  Disconnection = 'disconnection',
  NewGame = 'new-game',
  Move = 'move',
}
export type Notification = {
  variant: NotificationVariant;
  text: string;
};
