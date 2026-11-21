import { PLAYERS, WIN_LINES } from "./constants.js";

export function createGame() {
  let board = Array(9).fill(null);
  let currentMark = "X";
  let gameNumber = 1;
  let winner = null;
  let winningLine = null;
  let isDraw = false;
  const scores = { X: 0, O: 0 };

  function getState() {
    return {
      board: [...board],
      currentMark,
      currentPlayer: PLAYERS[currentMark],
      gameNumber,
      winner,
      winningLine: winningLine ? [...winningLine] : null,
      isDraw,
      isOver: Boolean(winner) || isDraw,
      scores: { ...scores },
    };
  }

  function findWinner(nextBoard) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      const mark = nextBoard[a];
      if (mark && mark === nextBoard[b] && mark === nextBoard[c]) {
        return { mark, line };
      }
    }
    return null;
  }

  function play(index) {
    if (winner || isDraw || board[index] !== null) {
      return { ok: false, state: getState() };
    }

    const nextBoard = [...board];
    nextBoard[index] = currentMark;
    board = nextBoard;

    const result = findWinner(board);
    if (result) {
      winner = PLAYERS[result.mark];
      winningLine = result.line;
      scores[result.mark] += 1;
      return { ok: true, state: getState() };
    }

    if (board.every((cell) => cell !== null)) {
      isDraw = true;
      return { ok: true, state: getState() };
    }

    currentMark = currentMark === "X" ? "O" : "X";
    return { ok: true, state: getState() };
  }

  function nextGame() {
    board = Array(9).fill(null);
    currentMark = "X";
    winner = null;
    winningLine = null;
    isDraw = false;
    gameNumber += 1;
    return getState();
  }

  return {
    getState,
    play,
    nextGame,
  };
}
