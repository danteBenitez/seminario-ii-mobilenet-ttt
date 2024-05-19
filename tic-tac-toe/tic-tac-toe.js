
export class TicTacToe {
    constructor(board, currentSymbol = "X") {
        this.board = board ?? TicTacToe.EMPTY_BOARD;
        this.currentSymbol = currentSymbol;
        this.initialSymbolValue = currentSymbol;
        this.won = "";
    }

    get isDraw() {
        return this.board.flat().every(cell => cell !== "");
    }

    static EMPTY_BOARD = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ]

    reset() {
        this.board = TicTacToe.EMPTY_BOARD;
        this.currentSymbol = this.initialSymbolValue;
    }

    static initialSymbol(currentSymbol) {
        return new TicTacToe(TicTacToe.EMPTY_BOARD, currentSymbol);
    }

    onDraw(cb) {
        this.onDrawCallback = cb;
    }

    makeMove(row, col) {
        if (this.board[row][col] != "") {
            return;
        }
        this.board[row][col] = this.currentSymbol;
        if (this.hasWon()) {
            this.onWinCallback ? this.onWinCallback(this.currentSymbol) : null;
            this.moveCallback ? this.moveCallback(this.board, row, col) : null;
            this.won = this.currentSymbol;
            return;
        }
        if (this.isDraw) {
            this.onDrawCallback ? this.onDrawCallback() : null;
            this.moveCallback ? this.moveCallback(this.board, row, col) : null;
            return;
        };
        this.moveCallback ? this.moveCallback(this.board, row, col) : null;
        this.currentSymbol = this.currentSymbol === "X" ? "O" : "X";

        return this.board[row][col];
    }

    hasWon() {
        const b = this.board;
        const check = (a, b, c) => a === b && b === c && a !== "";
        for (let i = 0; i < 3; i++) {
            if (check(b[i][0], b[i][1], b[i][2]) || check(b[0][i], b[1][i], b[2][i])) {
                return true;
            }
        }

        return check(b[0][0], b[1][1], b[2][2]) || check(b[0][2], b[1][1], b[2][0]);
    }

    onMove(cb) {
        this.moveCallback = cb;
    }

    onWin(cb) {
        this.onWinCallback = cb;
    }
}