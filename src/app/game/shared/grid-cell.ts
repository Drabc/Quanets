export class GridCell extends Phaser.GameObjects.Container {

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y)
    this.setSize(width, height)
    scene.add.existing(this)
  }

  public addObject(object: any, xScale: number = 0, yScale: number = 0.5): void {
    const y = this.height * yScale
    const x = this.width * xScale
    object.setPosition(x, y)
    this.add(object)
  }
}
