import { GridCell } from './'

const BORDER_SIZE = 10
const BORDER_EXTRA_LENGTH = BORDER_SIZE * 2
const BORDER_START = - BORDER_SIZE

export class Grid extends Phaser.GameObjects.Container {
  constructor(
      scene: Phaser.Scene,
      x: number,
      y: number,
      public readonly columns: number,
      public readonly rows: number,
      private readonly cellWidth: number,
      private readonly cellHeight: number,
      paddingX: number = 0,
      paddingY: number = 0
  ) {
      super(scene, x, y)

      const width = columns * (cellWidth + paddingX) - paddingX
      const height = rows * (cellHeight + paddingY) - paddingY

      this.setSize(width, height)

      for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
              const posX = col * (cellWidth + paddingX)
              const posY = row * (cellHeight + paddingY)
              this.add(new GridCell(scene, posX, posY, cellWidth, cellHeight))
          }
      }

      scene.add.existing(this)
  }

  public getCell(index: number): GridCell {
    return this.list[index] as GridCell
  }


  public addObjectToCell(index: number, object: any, xScale: number = 0, yScale: number = 0.5): void {
    yScale = Math.max(0, Math.min(1, yScale))
    xScale = Math.max(0, Math.min(1, xScale))
    if (index >= 0 && index < this.list.length) {
      const cell = this.list[index] as GridCell
      cell.addObject(object, xScale, yScale)
    }
  }

  public addChild(index: number, grid: Grid): void {
    const container = this.list[index] as Phaser.GameObjects.Container
    container.add(grid)
  }

  public addBorder(key: string): void {
    this._createVerticalBorders(key)
    this._createHorizontalBorders(key)
  }

  public visualizeCells(lineColor: number): void {
    const length = this.rows * this.columns
    for (let i = 0; i < length; i++) {
      const columnsContainer: Phaser.GameObjects.Container = this.list[i] as Phaser.GameObjects.Container
      const topLine = this.scene.add.line(0, 0, 0, 0, this.cellWidth, 0, lineColor).setOrigin(0)
      const bottomLine = this.scene.add.line(0, 0, 0, this.cellHeight, this.cellWidth, this.cellHeight, lineColor).setOrigin(0)
      const leftLine = this.scene.add.line(0, 0, 0, 0, 0, this.cellHeight, lineColor).setOrigin(0, 0)
      const rightLine = this.scene.add.line(0, 0, this.cellWidth, 0, this.cellWidth, this.cellHeight, lineColor).setOrigin(0, 0)
      const text = this.scene.add.text(0, 0, i.toString())
      columnsContainer.add(topLine)
      columnsContainer.add(leftLine)
      columnsContainer.add(rightLine)
      columnsContainer.add(bottomLine)
      columnsContainer.add(text)
    }
  }

  private _createVerticalBorders(key: string): void {
    for (let i = 0; i < this.length; i = i + this.columns) {
      const rightIndex = i+(this.columns - 1)
      const keyToUse = i !== 0 && rightIndex !== this.length - 1 ? key : `${key}-edge`

      const leftBorder = this.scene.add.image(-BORDER_SIZE, BORDER_START, keyToUse).setOrigin(0)
      const RightBorder = this.scene.add.image(this.cellWidth, BORDER_START, keyToUse).setOrigin(0).setFlipX(true)

      leftBorder.setDisplaySize(BORDER_SIZE, this.cellHeight + BORDER_EXTRA_LENGTH)
      RightBorder.setDisplaySize(BORDER_SIZE, this.cellHeight + BORDER_EXTRA_LENGTH)

      if (rightIndex === this.length - 1) {
        leftBorder.setFlipY(true)
        RightBorder.setFlipY(true)
      }

      const leftCell = this.list[i] as Phaser.GameObjects.Container
      const rightCell = this.list[rightIndex] as Phaser.GameObjects.Container
      leftCell.add(leftBorder)
      rightCell.add(RightBorder)
    }
  }

  private _createHorizontalBorders(key: string): void {
    for (let i = 0; i < this.columns; i++) {
      const keyToUse = i !== 0 && i !== this.columns - 1 ? key : `${key}-edge`
      const topBorder = this.scene.add.image(BORDER_START, 0, keyToUse).setOrigin(0).setFlipX(true)

      if (i === this.columns - 1) {
        topBorder.setFlipY(true)
      }

      topBorder.setDisplaySize(BORDER_SIZE, this.cellWidth + BORDER_EXTRA_LENGTH)
      topBorder.angle = -90
      const topCell = this.list[i] as Phaser.GameObjects.Container
      topCell.add(topBorder)
    }

    for (let i = this.length - this.columns; i < this.length; i++) {
      const keyToUse = i !== this.length - this.columns && i !== this.length - 1 ? key : `${key}-edge`
      const bottomCell = this.list[i] as Phaser.GameObjects.Container
      const bottomBorder = this.scene.add.image(BORDER_START, this.cellHeight + BORDER_SIZE, keyToUse).setOrigin(0)
      bottomBorder.setDisplaySize(BORDER_SIZE, this.cellWidth + BORDER_EXTRA_LENGTH)
      bottomBorder.angle = -90
      bottomCell.add(bottomBorder)

      if (i === this.length - 1) {
        bottomBorder.setFlipY(true)
      }
    }
  }
}
