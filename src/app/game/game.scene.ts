import Phaser from 'phaser'
import { Connector, Player }  from '.'
import { Grid, GridCell }  from './shared'

const CELL_SIZE: number = 64
const CONNECTOR_COLS = 10
const CONNECTOR_ROWS = 10
export class GameScene extends Phaser.Scene {

  private _connectors!: Phaser.Physics.Arcade.StaticGroup
  private readonly _players: Player[] = []
  private _currentPlayer!: Player
  private _playerText!: Phaser.GameObjects.Text
  private _squareMade: boolean = false

  constructor() {
    super({ key: 'main' })
  }

  public create(): void {
    this._loadBackground()
    const containerGrid: Grid = this._createContainerGrid()
    const connectorGrid: Grid = new Grid(this, 0, 0, CONNECTOR_COLS, CONNECTOR_ROWS, CELL_SIZE, CELL_SIZE)
    connectorGrid.addBorder('connector-border')
    containerGrid.addChild(19, connectorGrid)
    // containerGrid.visualizeCells(0x0000ff)
    // connectorGrid.visualizeCells(0xff0000)

    this._players.push(new Player('alex'))
    this._players.push(new Player('bella'))
    this._currentPlayer = this._players[0]
    this._createPlayerTitle(this._currentPlayer.name)

    containerGrid.addObjectToCell(0, this._playerText, .5, .3)

    this._connectors = this.physics.add.staticGroup()
    const gridCells = connectorGrid.list as GridCell[]

    gridCells.forEach((gridCell, index) => {
      const connector = new Connector(this, gridCell, 0, 0, 'connector', index, connectorGrid.columns, connectorGrid.rows)
      this._connectors.add(connector)
      connectorGrid.addObjectToCell(index, connector, .5)
      this._setupConnectorArrowToggler(connector)
      connector.on('connectionRequest', (data: any) => { this._connect(connector, data) })
    })
  }

  public preload(): void {
    this.load.image('connector', 'assets/images/connector/connector.png')
    this.load.image('connector-arrow', 'assets/images/connector-arrow/connector-arrow.png')
    this.load.image('connector-border', 'assets/images/border/border.png')
    this.load.image('connector-border-edge', 'assets/images/border/border-edge.png')
    this.load.image('background', 'assets/images/main-background.png')
  }

  private _connect(connector: Connector, connectionInfo: any): void {
    const toConnector = this._connectors.getChildren()[connectionInfo.index] as Connector
    connector.setEdge(connectionInfo.direction, toConnector)
    toConnector.setEdge(this._findConnectingEdge(connectionInfo.direction), connector)
    this._markSquaresMade(toConnector, connectionInfo.direction)
    this._checkEndGame()
    if (!this._squareMade) {
      this._selectNextPlayer()
    }
    this._squareMade = false
  }

  private _findConnectingEdge(direction: number): number {
    return (direction+2)%4
  }

  private _markSquaresMade(connector: Connector, initialDirection: number): void {
    [1, 3].forEach((modifier: number) => {
      if (this._checkSquareMade(connector, initialDirection, modifier)) {
        const oppositeConnector = this._getOppositeConnector(connector, initialDirection, modifier)
        const xScale = oppositeConnector.index < connector.index ? -.2 : .8
        const yScale =  oppositeConnector.index % CONNECTOR_COLS < connector.index % CONNECTOR_COLS ? -.1 : .9
        const text = this.add.text(0, 0, this._currentPlayer.stamp, {
          fontFamily: 'QuanetsMainFont',
          fontSize: '24px',
          color: '#ffffff' // Text color
        })

        connector.gridCell.addObject(text, yScale, xScale)
        this._currentPlayer.points++
        this._squareMade = true
      }
    })
  }

  private _checkSquareMade(connector: Connector, direction: number, directionModifier: number, depth: number = 1): boolean {
    const nextDirection =  (direction + (directionModifier*depth))%4
    const nextConnector = connector.getConnectorAtEdge(nextDirection)
    return !(nextConnector == null) && (depth === 3 || this._checkSquareMade(nextConnector, direction, directionModifier, depth+1))
  }

  private _getOppositeConnector(connector: Connector, initialDirection: number, modifier: number, depth: number = 1): Connector {
    const nextDirection =  (initialDirection + (modifier*depth))%4
    const nextConnector = connector.getConnectorAtEdge(nextDirection) as Connector
    return depth === 2 ? nextConnector : this._getOppositeConnector(nextConnector, initialDirection, modifier, depth+1)
  }

  private _selectNextPlayer(): void {
    this._currentPlayer = this._players[(this._players.indexOf(this._currentPlayer)+1)%this._players.length]
    this._updatePlayerText(this._currentPlayer.name)
  }

  private _createPlayerTitle(playerName: string): void {
    this._playerText = this.add.text(0, 0, `${playerName} turn`, {
      fontFamily: 'QuanetsMainFont',
      fontSize: '24px'
    })
  }

  private _updatePlayerText(playerName: string): void {
    this._playerText.setText(`${playerName} turn`)
  }

  private _checkEndGame(): void {
    const gameEnded = !(this._connectors.getChildren() as Connector[]).some((connector: Connector) => !connector.isFull())
    if(gameEnded) {
      const winner = this._players.reduce((max, player) => (player.points > max.points ? player : max))
      alert(`Game ended. ${winner.name} has Won!`)
    }
  }

  private _setupConnectorArrowToggler(connector: Connector): void {
    connector.on('pointerdown', () => {
      (this._connectors.getChildren() as Connector[]).forEach((child) => {
        if (child !== connector) {
          child.toggleArrows(false)
        }
      })
      connector.toggleArrows()
    })
  }

  private _loadBackground(): void {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const tileSize = 64

    for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
            const background = this.add.image(x, y, 'background')
            background.setOrigin(0, 0)
            background.setScale(tileSize / background.width, tileSize / background.height)
        }
    }
  }

  private _createContainerGrid(): Grid {
    const gameWidth: number = this.game.config.width as number
    const gameHeight: number = this.game.config.height as number
    const gridLength = gameWidth/CELL_SIZE
    const gridHeight = gameHeight/CELL_SIZE
    return new Grid(this, 0, 0, gridLength, gridHeight, CELL_SIZE, CELL_SIZE)
  }
}
