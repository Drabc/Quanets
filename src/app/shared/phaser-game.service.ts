import { Injectable, NgZone } from '@angular/core'
import { GameScene } from '../game'
import * as Phaser from 'phaser'

@Injectable({
  providedIn: 'root'
})
export class PhaserGameService {
  public phaserGame: Phaser.Game | undefined
  config: Phaser.Types.Core.GameConfig

  constructor(
    private readonly _ngZone: NgZone
  ) {
    this.config = {
      type: Phaser.AUTO,
      scene: [ GameScene ],
      width: 1024,
      height: 768,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      },
      scale: {
        // mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }
  }

  public renderGame(): void {
    this._ngZone.runOutsideAngular(() => {
      this.phaserGame = new Phaser.Game(this.config)
    })
  }
}
