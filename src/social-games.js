import { initialXiangqiBoard, playXiangqi } from "./xiangqi.js";
export const gameRules = Object.freeze({
  gomoku: { name: "五子棋", size: 15, line: 5 },
  tic: { name: "井字棋", size: 3, line: 3 },
  xiangqi: { name: "象棋", size: 9, rows: 10 },
});
export function createGameBoard(kind) { return kind === "xiangqi" ? initialXiangqiBoard() : Array(gameRules[kind].size ** 2).fill(0); }

export function playMove(game, user, cell) {
  if (game.kind === "xiangqi") return playXiangqi(game, user, cell);
  const { size, line } = gameRules[game.kind];
  if (game.result || game.players[game.turn] !== user ||
      !Number.isInteger(cell) || cell < 0 || cell >= game.board.length || game.board[cell]) return false;
  const value = game.turn + 1;
  game.board[cell] = value;
  game.last = cell;
  const x = cell % size;
  const y = Math.floor(cell / size);
  for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let total = 1;
    for (const direction of [-1, 1]) {
      let px = x + dx * direction;
      let py = y + dy * direction;
      while (px >= 0 && px < size && py >= 0 && py < size && game.board[py * size + px] === value) {
        total++;
        px += dx * direction;
        py += dy * direction;
      }
    }
    if (total >= line) { game.result = { winner: user, reason: "line" }; return true; }
  }
  if (game.board.every(Boolean)) game.result = { winner: null, reason: "draw" };
  else game.turn = 1 - game.turn;
  return true;
}
