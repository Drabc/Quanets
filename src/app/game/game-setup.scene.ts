import Phaser from 'phaser'

import  { GameButton } from '.'

export class GameSetupScene extends Phaser.Scene {

  public preload(): void {
    this.load.image('background', 'assets/test-background2.jpg')
  }

  public create(): void {
    this._addBackground()
    const button1 = new GameButton(this, 0, 0, 'Hello World', () => {console.log('hello')})

    button1.on('pointerdown', () => {

    })
  }

  private _addBackground(): void {
    // Add the background image to the game
    const backgroundImage = this.add.image(0, 0, 'background')

    // Set the background image to the center of the game
    backgroundImage.setOrigin(0.5, 0.5)
    backgroundImage.setPosition(this.game.config.width as number / 2, this.game.config.height as number / 2)

    // Make the background fill the entire game canvas
    backgroundImage.displayWidth = this.game.config.width as number
    backgroundImage.displayHeight = this.game.config.height as number
  }
}
