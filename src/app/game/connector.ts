import * as Phaser from 'phaser'
import { ConnectorArrow } from '.'

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

  public upArrow: ConnectorArrow
  public downArrow: ConnectorArrow
  public rightArrow: ConnectorArrow
  public leftArrow: ConnectorArrow

  private _toggler: boolean = false
  private _edges: Record<number, Connector | undefined> = {}

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
    private readonly _yIndex: number
  ) {
    super(scene, x, y, texture)
    scene.add.existing(this)

    this._edges[DIRECTIONS.UP.VALUE] = undefined
    this._edges[DIRECTIONS.DOWN.VALUE] = undefined
    this._edges[DIRECTIONS.RIGHT.VALUE] = undefined
    this._edges[DIRECTIONS.LEFT.VALUE] = undefined

    this.upArrow = new ConnectorArrow(scene, x, y)
    this.upArrow.angle = -90
    this.upArrow.on('pointerdown', () => { this._handleConnectionRequest(this._xIndex, this._yIndex-1, DIRECTIONS.UP.VALUE) })
    this._alignVerticalArrow(this.upArrow, DIRECTIONS.UP.MULTIPLIER)

    this.downArrow = new ConnectorArrow(scene, x, y)
    this.downArrow.angle = 90
    this._alignVerticalArrow(this.downArrow, DIRECTIONS.DOWN.MULTIPLIER)
    this.downArrow.on('pointerdown', () => { this._handleConnectionRequest(this._xIndex, this._yIndex+1, DIRECTIONS.DOWN.VALUE) })

    this.rightArrow = new ConnectorArrow(scene, x, y)
    this._alignHorizontalArrow(this.rightArrow, DIRECTIONS.RIGHT.MULTIPLIER)
    this.rightArrow.on('pointerdown', () => { this._handleConnectionRequest(this._xIndex+1, this._yIndex, DIRECTIONS.RIGHT.VALUE) })

    this.leftArrow = new ConnectorArrow(scene, x, y)
    this.leftArrow.angle = 180
    this._alignHorizontalArrow(this.leftArrow, DIRECTIONS.LEFT.MULTIPLIER)
    this.leftArrow.on('pointerdown', () => { this._handleConnectionRequest(this._xIndex-1, this._yIndex, DIRECTIONS.LEFT.VALUE) })

    this.setInteractive()
    this.on('pointerdown', this._toggleArrows)
  }

  public setEdge(direction: number, connector: Connector): void { 
    this._edges[direction] = connector
  }

  public getConnectorAtEdge(direction: number): Connector | undefined {
    return this._edges[direction]
  }
  
  private _toggleArrows(): void {
    this._toggler = !this._toggler
    this._toggler ? this._showArrows() : this._hideArrows()
  }

  private _showArrows(): void {
    this.upArrow.setVisible(true)
    this.downArrow.setVisible(true)
    this.rightArrow.setVisible(true)
    this.leftArrow.setVisible(true)
  }

  private _hideArrows(): void {
    this.upArrow.setVisible(false)
    this.downArrow.setVisible(false)
    this.rightArrow.setVisible(false)
    this.leftArrow.setVisible(false)
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
    this._toggleArrows()
    this.emit('connectionRequest', {x, y, direction })
  }

}