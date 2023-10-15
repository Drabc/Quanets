import Phaser from 'phaser'
import { Connector, Player }  from '.'

const TITLE_SPACE: number = 60
const INITIAL_X: number = 10
const INITIAL_Y: number = 10 + TITLE_SPACE
const SEPARATOR_SPACE: number = 45
export class GameScene extends Phaser.Scene {

  private _connectors!: Phaser.Physics.Arcade.StaticGroup
  private _elementsToAdd: number = 0
  private _graphics!: Phaser.GameObjects.Graphics
  private readonly _players: Player[] = []
  private _currentPlayer!: Player
  private _playerText!: Phaser.GameObjects.Text
  private _squareMade: boolean = false

  constructor() {
    super({ key: 'main' })
  }

  public create(): void {
    this._players.push(new Player('alex'))
    this._players.push(new Player('bella'))
    this._currentPlayer = this._players[0]
    this._createPlayerTitle(this._currentPlayer.name)

    this._graphics = this.add.graphics()
    this._connectors = this.physics.add.staticGroup()
    const connectorSprite = new Connector(this, INITIAL_X, INITIAL_Y, 'connector', 0, 0, 0, 0).setScale(0.05)
    const scaledWidth = Math.ceil(connectorSprite.width)
    const modifiedGameWidth = parseInt(this.game.config.width.toString()) - (2*INITIAL_X)
    this._elementsToAdd= Math.floor(modifiedGameWidth/(SEPARATOR_SPACE+scaledWidth))
    this._connectors.remove(connectorSprite, true)

    for (let y = 0; y <= this._elementsToAdd; y ++) {
      const calculatedY = INITIAL_Y + (scaledWidth+SEPARATOR_SPACE)*y
      for (let x = 0; x <= this._elementsToAdd; x ++) {
        const calculatedX = INITIAL_X + (scaledWidth+SEPARATOR_SPACE)*x
        const connector = new Connector(this, calculatedX, calculatedY, 'connector', x, y, this._elementsToAdd, this._elementsToAdd)
        this._setupConnectorArrowToggler(connector)
        this._connectors.add(connector)
        connector.refreshBody()
        connector.on('connectionRequest', (data: any) => { this._connect(connector, data) })
      }
    }
  }

  public preload(): void {
    this.load.image('connector', 'assets/connector.png')
    this.load.image('connector-arrow', 'assets/connector-arrow.png')
  }

  public override update(): void {
  }

  private _connect(connector: Connector, connectionInfo: any): void {
    const toConnectIndex: number = (connectionInfo.y * (this._elementsToAdd + 1) + connectionInfo.x)
    const toConnector = this._connectors.getChildren()[toConnectIndex] as Connector
    connector.setEdge(connectionInfo.direction, toConnector)
    toConnector.setEdge(this._findConnectingEdge(connectionInfo.direction), connector)
    this._displayConnection(connector, toConnector)
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

  private _displayConnection(c1: Connector, c2: Connector): void {
    // Set line style
    this._graphics.lineStyle(2, 9608341) // Line width and color

    // Draw the line
    this._graphics.beginPath()
    this._graphics.moveTo(c1.x, c1.y)
    this._graphics.lineTo(c2.x, c2.y)
    this._graphics.closePath()
    this._graphics.strokePath()
  }

  private _markSquaresMade(connector: Connector, initialDirection: number): void {
    [1, 3].forEach((modifier: number) => {
      if (this._checkSquareMade(connector, initialDirection, modifier)) {
        const oppositeConnector = this._getOppositeConnector(connector, initialDirection, modifier)
        const [midX, midY] = this._getMidPoint(connector, oppositeConnector)
        const text = this.add.text(midX, midY, this._currentPlayer.stamp, {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffffff' // Text color
        })
        text.setOrigin(0.5)
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

  private _getMidPoint(c1: Connector, c2: Connector): number[] {
    const midX = (c1.x + c2.x) / 2
    const midY = (c1.y + c2.y) / 2
    return [ midX, midY ]
  }

  private _selectNextPlayer(): void {
    this._currentPlayer = this._players[(this._players.indexOf(this._currentPlayer)+1)%this._players.length]
    this._updatePlayerText(this._currentPlayer.name)
  }

  private _createPlayerTitle(playerName: string): void {
    this._playerText = this.add.text(INITIAL_X, 0, `${playerName} turn`, {
      fontFamily: 'Arial',
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
}
