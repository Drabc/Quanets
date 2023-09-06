import { Injectable, NgZone } from '@angular/core'
import { TestScene } from '../game'
import * as Phaser from 'phaser'

@Injectable({
  providedIn: 'root'
})
export class PhaserGameService {
  public phaserGame: Phaser.Game | undefined
  config: Phaser.Types.Core.GameConfig

  constructor(
    _ngZone: NgZone
  ) {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      backgroundColor: "#e1e3e6",
      scene: [ TestScene ],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      }
    }
    _ngZone.runOutsideAngular(() => {
      this.phaserGame = new Phaser.Game(this.config)
    })
  }
}
