import { Component } from '@angular/core'
import { PhaserGameService } from './shared/phaser-game.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public constructor(private _phaserGame: PhaserGameService) {}
}
