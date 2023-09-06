import * as Phaser from 'phaser'

export class ConnectorArrow extends Phaser.Physics.Arcade.Image {
  public constructor (scene: Phaser. Scene, x: number, y: number) {
    super(scene, x, y, 'connector-arrow') 
    this.setInteractive()
    this.setVisible(false)
    scene.add.existing(this)
  }

  // private _emitClick(): void {
  //   this.emit('pointerdown', this._toConnectCoordinates)
  // }
}