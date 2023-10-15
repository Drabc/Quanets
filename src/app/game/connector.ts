import * as Phaser from 'phaser'
import { ConnectorArrow } from '.'

interface DirectionData {
  MULTIPLIER: number,
  VALUE: number
}

const CONNECTOR_ARROW_SPACE = 15
const DIRECTIONS  = {
  UP: {
    MULTIPLIER: 1,
    VALUE: 0
  },
  DOWN: {
    MULTIPLIER: -1,
    VALUE: 2
  },
  RIGHT: {
    MULTIPLIER: -1,
    VALUE: 1
  },
  LEFT: {
    MULTIPLIER: 1,
    VALUE: 3
  }
}

export class Connector extends Phaser.Physics.Arcade.Image {
  private _toggler: boolean = false
  private _edges: Record<number, Connector | undefined> = {}
  private readonly _arrows: Record<number, ConnectorArrow> = {}

  public get xIndex(): number {
    return this._xIndex
  }

  public get yIndex(): number {
    return this._yIndex
  }

  public constructor (
    scene: Phaser. Scene,
    x: number,
    y: number,
    texture: string,
    private readonly _xIndex: number,
    private readonly _yIndex: number,
    private readonly _xMax: number,
    private readonly _yMax: number
  ) {
    super(scene, x, y, texture)
    scene.add.existing(this)

    this._edges[DIRECTIONS.UP.VALUE] = undefined
    this._edges[DIRECTIONS.DOWN.VALUE] = undefined
    this._edges[DIRECTIONS.RIGHT.VALUE] = undefined
    this._edges[DIRECTIONS.LEFT.VALUE] = undefined

    this._createArrow(this._xIndex, this._yIndex-1, -90, DIRECTIONS.UP, scene)
    this._createArrow(this._xIndex, this._yIndex+1, 90, DIRECTIONS.DOWN, scene)
    this._createArrow(this._xIndex+1, this._yIndex, 0, DIRECTIONS.RIGHT, scene)
    this._createArrow(this._xIndex-1, this._yIndex, 180, DIRECTIONS.LEFT, scene)

    this.setInteractive()
  }

  public setEdge(direction: number, connector: Connector): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._arrows[direction]
    this._edges[direction] = connector
  }

  public getConnectorAtEdge(direction: number): Connector | undefined {
    return this._edges[direction]
  }

  public isFull(): boolean {
    return !Object.keys(this._arrows).some((edgeIndex: string) => this._edges[parseInt(edgeIndex)] === undefined)
  }

  public toggleArrows(force?: boolean): void {
    this._toggler = force ?? !this._toggler
    this._toggler ? this._showArrows() : this._hideArrows()
  }

  private _createArrow(xIndex: number, yIndex: number, angle: number, directionData: DirectionData, scene: Phaser. Scene): void {
    if (xIndex >= 0 && xIndex <= this._xMax && yIndex >= 0 && yIndex <= this._yMax) {
      const arrow = new ConnectorArrow(scene, this.x, this.y)
      const alignmentStrategy = directionData.VALUE%2 === 0 ? this._alignVerticalArrow : this._alignHorizontalArrow
      arrow.angle = angle
      arrow.on('pointerdown', () => { this._handleConnectionRequest(xIndex, yIndex, directionData.VALUE) })
      alignmentStrategy.call(this, arrow, directionData.MULTIPLIER)
      this._arrows[directionData.VALUE] = arrow
    }
  }

  private _showArrows(): void {
    Object.values(this._arrows).forEach((arrow) => arrow.setVisible(true))
  }

  private _hideArrows(): void {
    Object.values(this._arrows).forEach((arrow) => arrow.setVisible(false))
  }

  private _alignVerticalArrow(arrow: Phaser.Physics.Arcade.Image, direction: number): void {
    const midX1 = this.x + this.displayWidth / 2
    const midX2 = arrow.x + arrow.displayWidth / 2

    // Calculate the difference in midpoints
    const diffX = midX1 - midX2

    arrow.x += diffX * direction
    arrow.y -= CONNECTOR_ARROW_SPACE * direction
  }

  private _alignHorizontalArrow(arrow: Phaser.Physics.Arcade.Image, direction: number): void {
    const midY1 = this.y + this.displayWidth / 2
    const midY2 = arrow.y + arrow.displayWidth / 2

    // Calculate the difference in midpoints
    const diffY = midY1 - midY2

    arrow.y += diffY * direction
    arrow.x -= CONNECTOR_ARROW_SPACE * direction
  }

  private _handleConnectionRequest(x: number, y: number, direction: number): void {
    x = Math.max(0, x)
    y = Math.max(0, y)
    this.toggleArrows()
    this.emit('connectionRequest', {x, y, direction })
  }

}
