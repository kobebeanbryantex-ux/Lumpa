import { describe, it, expect } from "vitest";
import { initialXiangqiBoard, legalXiangqiMove, xiangqiInCheck, playXiangqi } from "./xiangqi.js";
const position=()=>{const board=Array(90).fill(0);board[4]=-1;board[85]=1;board[49]=7;return board;};
describe("Xiangqi rules",()=>{
  it("starts with 32 pieces in the correct cannon and pawn positions",()=>{
    const board=initialXiangqiBoard();expect(board.filter(Boolean)).toHaveLength(32);
    expect([board[19],board[25],board[64],board[70]]).toEqual([-6,-6,6,6]);
    expect(legalXiangqiMove(board,54,45,1)).toBe(true);
    expect(legalXiangqiMove(board,54,55,1)).toBe(false);
  });
  it("blocks horse legs",()=>{const board=position();board[73]=4;board[74]=7;expect(legalXiangqiMove(board,73,66,1)).toBe(false);board[74]=0;expect(legalXiangqiMove(board,73,66,1)).toBe(true);});
  it("blocks elephant eyes and prevents crossing the river",()=>{const board=position();board[83]=3;board[75]=7;expect(legalXiangqiMove(board,83,67,1)).toBe(false);board[75]=0;expect(legalXiangqiMove(board,83,67,1)).toBe(true);board[47]=3;expect(legalXiangqiMove(board,47,31,1)).toBe(false);});
  it("keeps kings and advisors inside the palace",()=>{const board=position();board[84]=2;expect(legalXiangqiMove(board,84,76,1)).toBe(true);expect(legalXiangqiMove(board,84,74,1)).toBe(false);expect(legalXiangqiMove(board,85,86,1)).toBe(true);board[86]=1;board[85]=0;expect(legalXiangqiMove(board,86,87,1)).toBe(false);});
  it("requires exactly one cannon screen for a capture",()=>{const board=position();board[63]=6;board[27]=-5;expect(legalXiangqiMove(board,63,27,1)).toBe(false);board[45]=7;expect(legalXiangqiMove(board,63,27,1)).toBe(true);board[36]=7;expect(legalXiangqiMove(board,63,27,1)).toBe(false);expect(legalXiangqiMove(board,63,54,1)).toBe(true);});
  it("allows sideways pawns after crossing but never backwards",()=>{const board=position();board[36]=7;expect(legalXiangqiMove(board,36,37,1)).toBe(true);expect(legalXiangqiMove(board,36,45,1)).toBe(false);board[45]=-7;expect(legalXiangqiMove(board,45,46,-1)).toBe(true);});
  it("rejects uncovering facing generals",()=>{const board=position();board[49]=5;expect(legalXiangqiMove(board,49,48,1)).toBe(false);board[49]=0;expect(xiangqiInCheck(board,1)).toBe(true);expect(xiangqiInCheck(board,-1)).toBe(true);});
  it("does not permit a move exposing its own king",()=>{const board=position();board[13]=-5;board[49]=5;expect(legalXiangqiMove(board,49,48,1)).toBe(false);expect(legalXiangqiMove(board,49,13,1)).toBe(true);});
  it("enforces turn order, valid cells and ownership",()=>{const game={board:initialXiangqiBoard(),turn:0,players:["red","black"]};expect(playXiangqi(game,"black",{from:27,to:36})).toBe(false);expect(playXiangqi(game,"red",{from:54,to:45})).toBe(true);expect(game.turn).toBe(1);expect(game.board[45]).toBe(7);expect(playXiangqi(game,"black",{from:27,to:99})).toBe(false);});
  it("finishes a checkmate and locks the completed game",()=>{const board=position();board[12]=5;board[14]=5;board[31]=5;const game={board,turn:0,players:["red","black"]};expect(playXiangqi(game,"red",{from:31,to:22})).toBe(true);expect(game.result).toEqual({winner:"red",reason:"checkmate"});expect(playXiangqi(game,"black",{from:4,to:3})).toBe(false);});
});
