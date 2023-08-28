import Phaser from 'phaser'

export class TestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'main' })
  }

  public create(): void {
    console.log('create method')
  }

  public preload(): void {
    console.log('preload method')
  }

  public override update(): void {
    console.log('update method')
  }
}
