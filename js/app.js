import { createGame } from "./game.js";

const game = createGame();

const setupEl = document.getElementById("setup");
const setupForm = document.getElementById("setup-form");
const nameOneInput = document.getElementById("name-one");
const nameTwoInput = document.getElementById("name-two");
const setupErrorEl = document.getElementById("setup-error");

const gameEl = document.getElementById("game");
const boardEl = document.getElementById("board");
const cells = [...document.querySelectorAll(".cell")];
const statusEl = document.getElementById("status");
const gameLabelEl = document.getElementById("game-label");
const nextGameBtn = document.getElementById("next-game");
const playerOneEl = document.getElementById("player-one");
const playerTwoEl = document.getElementById("player-two");
const labelOneEl = document.getElementById("label-one");
const labelTwoEl = document.getElementById("label-two");
const scoreOneEl = document.getElementById("score-one");
const scoreTwoEl = document.getElementById("score-two");

function normalizeName(value) {
  return value.trim();
}

function validateNames(nameOne, nameTwo) {
  if (!nameOne || !nameTwo) {
    return "Both player names are required.";
  }
  if (nameOne.toLowerCase() === nameTwo.toLowerCase()) {
    return "Player names must be different.";
  }
  return null;
}

function showSetupError(message) {
  setupErrorEl.hidden = !message;
  setupErrorEl.textContent = message ?? "";
}

function statusText(state) {
  if (state.winner) {
    return `${state.winner.name} wins!`;
  }
  if (state.isDraw) {
    return "Draw — both players";
  }
  return `Turn of ${state.currentPlayer.name} (${state.currentMark})`;
}

function render(state) {
  gameLabelEl.textContent = `Game ${state.gameNumber}`;
  statusEl.textContent = statusText(state);

  boardEl.classList.toggle("is-x-turn", !state.isOver && state.currentMark === "X");
  boardEl.classList.toggle("is-o-turn", !state.isOver && state.currentMark === "O");
  boardEl.classList.toggle("is-over", state.isOver);

  playerOneEl.classList.toggle("is-active", !state.isOver && state.currentMark === "X");
  playerTwoEl.classList.toggle("is-active", !state.isOver && state.currentMark === "O");
  labelOneEl.textContent = state.players.X.name;
  labelTwoEl.textContent = state.players.O.name;
  scoreOneEl.textContent = String(state.scores.X);
  scoreTwoEl.textContent = String(state.scores.O);

  cells.forEach((cell, index) => {
    const mark = state.board[index];
    cell.textContent = mark ?? "";
    cell.classList.toggle("mark-x", mark === "X");
    cell.classList.toggle("mark-o", mark === "O");
    cell.classList.toggle(
      "winning",
      Boolean(state.winningLine && state.winningLine.includes(index)),
    );
    cell.disabled = state.isOver || mark !== null;
  });

  nextGameBtn.hidden = !state.isOver;
}

function startGame(nameOne, nameTwo) {
  const state = game.setPlayerNames(nameOne, nameTwo);
  setupEl.hidden = true;
  gameEl.hidden = false;
  render(state);
}

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nameOne = normalizeName(nameOneInput.value);
  const nameTwo = normalizeName(nameTwoInput.value);
  const error = validateNames(nameOne, nameTwo);

  if (error) {
    showSetupError(error);
    return;
  }

  showSetupError(null);
  startGame(nameOne, nameTwo);
});

boardEl.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell || !boardEl.contains(cell)) return;

  const index = Number(cell.dataset.index);
  const result = game.play(index);
  if (result.ok) {
    render(result.state);
  }
});

nextGameBtn.addEventListener("click", () => {
  render(game.nextGame());
});
