import { TicTacToe } from "./tic-tac-toe.js";

const MODEL_PATH = "./model/model.json";
const selectionForm = document.querySelector("form");
const board = document.querySelector("#board");
let model;

const EMPTY = 0;
const HUMAN = -1;
const AI = 1;
let currentPlayer = HUMAN;

function getSymbolForPlayer(player) {
  const formData = new FormData(selectionForm);
  const symbol = formData.get("selection");
  const otherSymbol = symbol === "X" ? "O" : "X";

  return player === HUMAN ? symbol : otherSymbol;
}

function getOppositeSymbol(symbol) {
  return symbol === "X" ? "O" : "X";
}

selectionForm.addEventListener('input', (e) => {
  if (selectionForm.querySelector('select').value == "") {
    return;
  }
  const numberToSymbol = {
    0: "",
    [HUMAN]: getSymbolForPlayer(HUMAN),
    [AI]: getSymbolForPlayer(AI),
  };
  const game = TicTacToe.initialSymbol(getSymbolForPlayer(HUMAN));
  game.onMove((board) => {
    const transformed = getMovesForSymbolBoard(board, numberToSymbol);
    updateBoard(transformed);
  });
  game.onWin(symbol => {
    const message = getPlayerFromSymbol(symbol, numberToSymbol) === HUMAN ? "¡Ganaste!" : "¡Perdiste!";
    Swal.fire({
      title: message,
      confirmButtonText: "Reiniciar",
    }).then((result) => {
      if (result.isConfirmed) {
        document.location.reload();
      }
    })
  });
  game.onDraw(() => {
    Swal.fire({
      title: "¡Empate!",
      confirmButtonText: "Reiniciar",
    }).then((result) => {
      if (result.isConfirmed) {
        document.location.reload();
      }
    })
  })
  selectionForm.classList.add('d-none');
  board.classList.remove('d-none');

  const transformed = getMovesForSymbolBoard(TicTacToe.EMPTY_BOARD, numberToSymbol);
  updateBoard(transformed);

  attachListeners(game, numberToSymbol);
});

// Transform from array of X and O to array of objects with symbol and className
function getMovesForSymbolBoard(board, numberToSymbol) {
  return board.flat().map((cell) => {
      return {
        symbol: cell,
        className: cell === EMPTY ? "" : cell,
      };
    });
}

function getPlayerFromSymbol(symbol, numberToSymbolMap) {
  const found = Object.entries(numberToSymbolMap).find(([, value]) => value === symbol);
  return parseInt(found[0]);
}

async function loadModel() {
  const model = await tf.loadLayersModel(MODEL_PATH);
  return model;
}

async function getMoveForAi(board, numberToSymbolMap) {
  if (!model) {
    model = await loadModel();
  }
  const transformed = board.flat().map(symbol => getPlayerFromSymbol(symbol, numberToSymbolMap));
  const boardTensor = tf.tensor(transformed, [1, 9]);
  const prediction = await model.predict(boardTensor);
  const topk = tf.topk(prediction, 9);
  const indices = await topk.indices.data();
  for (const index of indices) {
    console.log(index);
    const [row, col] = [Math.floor(index / 3), index % 3];
    console.log(row, col);
    if (board[row][col] == "") {
      return [row, col];
    }
  };
  throw new Error("No valid move found");
};

function attachListeners(game, numberToSymbolMap) {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.addEventListener('click', async () => {
      const [row, col] = cell.dataset.cell.split("-").map(Number);
      game.makeMove(row, col);
      board.setAttribute("disabled", "disabled");
      currentPlayer = AI;

      if (game.won != "") {
        return;
      }

      const [aiRow, aiCol] = await getMoveForAi(game.board, numberToSymbolMap);

      setTimeout(() => {
        if (game.won != "") {
          return;
        }
        game.makeMove(aiRow, aiCol);
        board.removeAttribute("disabled");
        currentPlayer = HUMAN;
      }, 20);
    })
  });
}

function updateBoard(boardArray) {
  const cellValues = boardArray.flat();
  const cellsElements = document.querySelectorAll(".cell");
  for (const [index, cell] of cellValues.entries()) {
    cellsElements[index].innerHTML = cell.symbol;
    cellsElements[index].className = `cell ${cell.className}`;
  }
}
