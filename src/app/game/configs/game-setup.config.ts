export interface ContainerSizeInfo {
  ROWS: number,
  COLS: number
}

export const GAME_SETUP = {
  CONNECTORS: {
    CONTAINERS: {
      CELL_SIZE: 64,
      SMALL: {
        ROWS: 5,
        COLS: 5
      },
      MEDIUM: {
        ROWS: 7,
        COLS: 7
      },
      LARGE: {
        ROWS: 10,
        COLS: 10
      }
    }
  }
}

