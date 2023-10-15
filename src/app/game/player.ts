export class Player {

  public get name(): string {
    return this._name
  }

  public get stamp(): string {
    return this._stamp
  }

  public points: number = 0

  private readonly _stamp: string

  public constructor(private readonly _name: string) {
    this._stamp = this._name.charAt(0).toUpperCase()
  }
}
