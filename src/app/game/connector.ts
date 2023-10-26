import * as Phaser from 'phaser'
import { ConnectorArrow } from '.'
import { GridCell } from './shared'

interface DirectionData {
  MULTIPLIER: number
  VALUE: number
  X_SCALE: number
  Y_SCALE: number
}

interface Directions {
  UP: DirectionData
  RIGHT: DirectionData
  DOWN: DirectionData
  LEFT: DirectionData
}

interface EdgeInfo {
  lineScales: number[]
  index: number
}

const DIRECTIONS: Directions = {
  UP: {
    MULTIPLIER: 1,
    VALUE: 0,
    Y_SCALE: 0,
    X_SCALE: 0.5
  },
  DOWN: {
    MULTIPLIER: -1,
    VALUE: 2,
    Y_SCALE: 1,
    X_SCALE: .5
  },
  RIGHT: {
    MULTIPLIER: -1,
    VALUE: 1,
    Y_SCALE: .5,
    X_SCALE: 1
  },
  LEFT: {
    MULTIPLIER: 1,
    VALUE: 3,
    Y_SCALE: .5,
    X_SCALE: 0
  }
}

export class Connector extends Phaser.GameObjects.Image {
  private _toggler: boolean = false
  private _edges: Record<number, Connector | undefined> = {}
  private readonly _arrows: Record<number, ConnectorArrow> = {}
  private readonly _linesGraphic: Phaser.GameObjects.Graphics
  private readonly _edgesInfo: Record<number, EdgeInfo> = {}

  public get index(): number {
    return this._index
  }

  public get gridCell(): GridCell {
    return this._gridCell
  }

  public constructor (
    scene: Phaser. Scene,
    private readonly _gridCell: GridCell,
    x: number,
    y: number,
    texture: string,
    private readonly _index: number,
    private readonly _columns: number,
    private readonly _rows: number
  ) {
    super(scene, x, y, texture)
    this.setScale(.6).setInteractive()
    scene.add.existing(this)

    this._edges[DIRECTIONS.UP.VALUE] = undefined
    this._edges[DIRECTIONS.DOWN.VALUE] = undefined
    this._edges[DIRECTIONS.RIGHT.VALUE] = undefined
    this._edges[DIRECTIONS.LEFT.VALUE] = undefined

    this._setupEdgesInfo()

    this._createArrow(this._edgesInfo[DIRECTIONS.UP.VALUE].index, -90, DIRECTIONS.UP, scene)
    this._createArrow(this._edgesInfo[DIRECTIONS.RIGHT.VALUE].index % this._columns - 1, 0, DIRECTIONS.RIGHT, scene)
    this._createArrow(this._edgesInfo[DIRECTIONS.DOWN.VALUE].index, 90, DIRECTIONS.DOWN, scene)
    this._createArrow((this._index%this._columns) - 1, 180, DIRECTIONS.LEFT, scene)
    this._linesGraphic = scene.add.graphics()
    this._gridCell.addObject(this._linesGraphic, .5)
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

  private _createArrow(index: number, angle: number, directionData: DirectionData, scene: Phaser. Scene): void {
    if (index >= 0 && index < (this._columns*this._rows)) {
      const arrow = new ConnectorArrow(scene, 0, 0)
      const edgeInfo = this._edgesInfo[directionData.VALUE]
      arrow.angle = angle
      this._gridCell.addObject(arrow, directionData.X_SCALE, directionData.Y_SCALE)
      arrow.on('pointerdown', () => { this._handleConnectionRequest(edgeInfo.index, directionData) })
      this._arrows[directionData.VALUE] = arrow
    }
  }

  private _showArrows(): void {
    Object.values(this._arrows).forEach((arrow) => arrow.setVisible(true))
  }

  private _hideArrows(): void {
    Object.values(this._arrows).forEach((arrow) => arrow.setVisible(false))
  }

  private _handleConnectionRequest(index: number, direction: DirectionData): void {
    this.toggleArrows()
    this._displayConnection(direction)
    this.emit('connectionRequest', { index, direction: direction.VALUE })
  }

  private _displayConnection(direction: DirectionData): void {
    const scales = this._edgesInfo[direction.VALUE]
    this._drawConnection(scales.lineScales[0], scales.lineScales[1])
  }

  private _drawConnection(x2: number, y2: number): void {
    this._linesGraphic.lineStyle(2, 9608341) // Line width and color
    this._linesGraphic.beginPath()
    this._linesGraphic.moveTo(0, 0)
    this._linesGraphic.lineTo(x2, y2)
    this._linesGraphic.closePath()
    this._linesGraphic.strokePath()

    this._gridCell.addObject(this._linesGraphic, .5)
  }

  private _setupEdgesInfo(): void {
    const downY = this._gridCell.height - this.displayHeight/2
    const upY: number = -downY
    const rightX: number = this._gridCell.width - this.displayWidth/2
    const leftX: number = -rightX

    this._edgesInfo[DIRECTIONS.DOWN.VALUE] ||= this._nullEdgeInfo()
    this._edgesInfo[DIRECTIONS.DOWN.VALUE].lineScales = [0, downY]
    this._edgesInfo[DIRECTIONS.DOWN.VALUE].index = this._index + this._columns

    this._edgesInfo[DIRECTIONS.UP.VALUE] ||= this._nullEdgeInfo()
    this._edgesInfo[DIRECTIONS.UP.VALUE].lineScales = [0, upY]
    this._edgesInfo[DIRECTIONS.UP.VALUE].index = this._index - this._columns

    this._edgesInfo[DIRECTIONS.RIGHT.VALUE] ||= this._nullEdgeInfo()
    this._edgesInfo[DIRECTIONS.RIGHT.VALUE].lineScales = [rightX, 0]
    this._edgesInfo[DIRECTIONS.RIGHT.VALUE].index = this._index + 1

    this._edgesInfo[DIRECTIONS.LEFT.VALUE] ||= this._nullEdgeInfo()
    this._edgesInfo[DIRECTIONS.LEFT.VALUE].lineScales = [leftX, 0]
    this._edgesInfo[DIRECTIONS.LEFT.VALUE].index = this._index - 1
  }

  private _nullEdgeInfo(): EdgeInfo {
    return {
      lineScales: [],
      index: 0
    }
  }
}
