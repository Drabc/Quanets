import Phaser from 'phaser'

export class GameButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
      super(scene, x, y)

      this.add(scene.add.rectangle(0, 0, text.length*26, 60, 0x00ff00))
      const buttonText = scene.add.text(0, 0, text, {
        fontSize: '24px',
        fontFamily: 'QuanetsMainFont'
      })
      buttonText.setOrigin(0, 0)
      this.add(buttonText)

      this.setInteractive()
      this.on('pointerdown', onClick)

      scene.add.existing(this)
  }
}
