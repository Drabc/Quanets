import Phaser from 'phaser'
import { Connector, Player }  from '.'
import { Grid, GridCell }  from './shared'
import { ContainerSizeInfo, GAME_SETUP } from './configs'

export class GameScene extends Phaser.Scene {

  private _connectors!: Phaser.Physics.Arcade.StaticGroup
  private readonly _players: Player[] = []
  private _currentPlayer!: Player
  private _playerText!: Phaser.GameObjects.Text
  private _squareMade: boolean = false
  private _containerConfig!: ContainerSizeInfo

  constructor() {
    super({ key: 'main' })
  }

  public create(): void {
    this._loadBackground()
    this._containerConfig = GAME_SETUP.CONNECTORS.CONTAINERS.SMALL
    const containerGrid: Grid = this._createContainerGrid()
    const startingIndex = this._getConnectorContainerStartingIndex(containerGrid, this._containerConfig)
    const [xOffset, yOffset] = this._getConnectorContainerStartingOffset(containerGrid, this._containerConfig)
    const connectorGrid: Grid = new Grid(
      this,
      0,
      0,
      this._containerConfig.COLS,
      this._containerConfig.ROWS,
      GAME_SETUP.CONNECTORS.CONTAINERS.CELL_SIZE,
      GAME_SETUP.CONNECTORS.CONTAINERS.CELL_SIZE
    )
    console.log(startingIndex)
    connectorGrid.addBorder('connector-border')
    containerGrid.addChild(startingIndex, connectorGrid, xOffset, yOffset)
    containerGrid.visualizeCells(0x0000ff)
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
        const yScale =  oppositeConnector.index % this._containerConfig.COLS < connector.index % this._containerConfig.COLS ? -.1 : .9
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
    const gridLength = gameWidth/GAME_SETUP.CONNECTORS.CONTAINERS.CELL_SIZE
    const gridHeight = gameHeight/GAME_SETUP.CONNECTORS.CONTAINERS.CELL_SIZE
    return new Grid(this, 0, 0, gridLength, gridHeight, GAME_SETUP.CONNECTORS.CONTAINERS.CELL_SIZE, GAME_SETUP.CONNECTORS.CONTAINERS.CELL_SIZE)
  }

  private _getConnectorContainerStartingIndex(containerGrid: Grid, containerGridInfo: ContainerSizeInfo): number {
    const x = Math.floor((containerGrid.columns - containerGridInfo.COLS) / 2)
    const y = Math.floor((containerGrid.rows - containerGridInfo.ROWS) / 2)
    return y * containerGrid.columns + x
  }

  private _getConnectorContainerStartingOffset(containerGrid: Grid, containerGridInfo: ContainerSizeInfo): number[] {
    const xOffset = (containerGrid.columns - containerGridInfo.COLS) % 2 === 0 ? 0 : .5
    const yOffset = (containerGrid.rows - containerGridInfo.ROWS) % 2 === 0 ? 0 : .5
    return [xOffset, yOffset]
  }
}

