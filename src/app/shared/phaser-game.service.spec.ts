import { TestBed } from '@angular/core/testing'

import { PhaserGameService } from './phaser-game.service'

describe('PhaserGameService', () => {
  let service: PhaserGameService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PhaserGameService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
