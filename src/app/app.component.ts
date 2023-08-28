import Phaser from 'phaser'
import { Component } from '@angular/core'
import { TestScene } from './shared'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public phaserGame: Phaser.Game | undefined
  config: Phaser.Types.Core.GameConfig
  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [ TestScene ],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      }
    }
  }

  public ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config)
  }
}
