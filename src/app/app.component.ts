import { Component, OnInit } from '@angular/core'
import { PhaserGameService } from './shared/phaser-game.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public constructor(private readonly _phaserGame: PhaserGameService) {}

  public ngOnInit(): void {
    this._phaserGame.renderGame()
  }
}
