export class ConnectionStore {
  private store: string[];

  constructor() {
    this.store = [];
  }

  public hasConnection(socketID: string): boolean {
    return this.store.includes(socketID);
  }
  public addConnection(socketID: string): void {
    this.store.push(socketID);
  }

  public removeConnection(socketID: string): void {
    const index = this.store.indexOf(socketID);
    if (index !== -1) {
        this.store.splice(index, 1);
    }
  }
}
