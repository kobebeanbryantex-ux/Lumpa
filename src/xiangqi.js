// Casual two-player Xiangqi. Coordinates are fixed: black at the top, red at the bottom.
export const xiangqiNames = { 1: "帅", 2: "仕", 3: "相", 4: "马", 5: "车", 6: "炮", 7: "兵", "-1": "将", "-2": "士", "-3": "象", "-4": "马", "-5": "车", "-6": "炮", "-7": "卒" };
export function initialXiangqiBoard() {
  const board = Array(90).fill(0);
  const back = [5, 4, 3, 2, 1, 2, 3, 4, 5];
  back.forEach((piece, x) => { board[x] = -piece; board[81 + x] = piece; });
  for (const x of [1, 7]) { board[18 + x] = -6; board[63 + x] = 6; }
  for (const x of [0, 2, 4, 6, 8]) { board[27 + x] = -7; board[54 + x] = 7; }
  return board;
}
const side = value => Math.sign(value);
const palace = (x, y, team) => x >= 3 && x <= 5 && (team > 0 ? y >= 7 && y <= 9 : y >= 0 && y <= 2);
function screens(board, from, to) {
  const ax = from % 9, ay = Math.floor(from / 9), bx = to % 9, by = Math.floor(to / 9);
  if (ax !== bx && ay !== by) return -1;
  const step = ax === bx ? (by > ay ? 9 : -9) : (bx > ax ? 1 : -1);
  let count = 0;
  for (let cell = from + step; cell !== to; cell += step) if (board[cell]) count++;
  return count;
}
function pattern(board, from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from >= 90 || to < 0 || to >= 90 || from === to) return false;
  const piece = board[from], team = side(piece), target = board[to];
  if (!team || side(target) === team) return false;
  const x = from % 9, y = Math.floor(from / 9), tx = to % 9, ty = Math.floor(to / 9);
  const dx = tx - x, dy = ty - y, ax = Math.abs(dx), ay = Math.abs(dy);
  switch (Math.abs(piece)) {
    case 1: return Math.abs(target) === 1 && x === tx && screens(board, from, to) === 0 || ax + ay === 1 && palace(tx, ty, team);
    case 2: return ax === 1 && ay === 1 && palace(tx, ty, team);
    case 3: return ax === 2 && ay === 2 && (team > 0 ? ty >= 5 : ty <= 4) && !board[(y + dy / 2) * 9 + x + dx / 2];
    case 4: return ax === 2 && ay === 1 ? !board[y * 9 + x + Math.sign(dx)] : ax === 1 && ay === 2 && !board[(y + Math.sign(dy)) * 9 + x];
    case 5: return screens(board, from, to) === 0;
    case 6: return screens(board, from, to) === (target ? 1 : 0);
    case 7: return dx === 0 && dy === -team || dy === 0 && ax === 1 && (team > 0 ? y <= 4 : y >= 5);
    default: return false;
  }
}
export function xiangqiInCheck(board, team) {
  const king = board.indexOf(team);
  if (king < 0) return true;
  return board.some((piece, from) => side(piece) === -team && pattern(board, from, king));
}
export function legalXiangqiMove(board, from, to, team) {
  if (side(board[from]) !== team || !pattern(board, from, to)) return false;
  const next = board.slice();
  next[to] = next[from]; next[from] = 0;
  return !xiangqiInCheck(next, team);
}
export function xiangqiDestinations(board, from, team) {
  return Array.from({ length: 90 }, (_, to) => to).filter(to => legalXiangqiMove(board, from, to, team));
}
export function playXiangqi(game, user, move) {
  if (game.result || game.players[game.turn] !== user || !move) return false;
  const { from, to } = move, team = game.turn === 0 ? 1 : -1;
  if (!legalXiangqiMove(game.board, from, to, team)) return false;
  const captured = game.board[to];
  game.board[to] = game.board[from]; game.board[from] = 0;
  game.last = to; game.from = from;
  game.turn = 1 - game.turn;
  const opponent = -team;
  game.check = xiangqiInCheck(game.board, opponent);
  const canMove = Math.abs(captured) !== 1 && game.board.some((piece, source) => side(piece) === opponent && xiangqiDestinations(game.board, source, opponent).length);
  if (!canMove) game.result = { winner: user, reason: Math.abs(captured) === 1 ? "king" : game.check ? "checkmate" : "stalemate" };
  return true;
}
