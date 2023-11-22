// Factory function -> IIFE (Immediately Invoked Function Expression) - Runs when defined..

//This is NOT the case
function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;
    //logging the board with symbols only
    const printBoard = () => {
        const boardSymbols = board.map(row => row.map(cell => cell.getSymbol()));
        console.log(boardSymbols);
    };
    // returns false if theres still space to mark in the current game/table. True if table is full of user marks.
    const isFull = () => {
        let flag = true;
        board.forEach(row => row.forEach(cell => {
            if (cell.getSymbol() === 0) flag = false;
        }));
        return flag;
    }

    const markSymbol = (player, row, column) => {
        if (board[row][column].getSymbol() != 0) {
            console.log(`Selected cell [${row}, ${column}] is already marked..`);
            return;
        }
        board[row][column].addSymbol(player);
    }

    return {
        getBoard,
        printBoard,
        markSymbol,
        isFull
    };
};

function Cell() {
    // 0 = empty | 1 = player1 (X) | 2 = player2 (O)
    let value = 0;

    const addSymbol = (player) => { value = player };
    const getSymbol = () => value;

    return { addSymbol, getSymbol };
}

function GameController(playerOneName, playerTwoName) {
    let board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName,
            token: 2
        }
    ];

    let activePlayer = players[0];
    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
        (getActivePlayer() === players[0]) ? activePlayer = players[1] : activePlayer = players[0];
    };

    const printRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    };

    const playRound = (row, column) => {
        if (board.getBoard()[row][column].getSymbol() != 0) {
            console.log(`Selected cell [${row}, ${column}] is already marked..`);
            console.log(`Still ${getActivePlayer().name}'s turn.`);
            return;
        }
        // Add corresponding symbol to cell
        console.log(`${getActivePlayer().name} has marked cell [${row}, ${column}].`);
        board.getBoard()[row][column].addSymbol(getActivePlayer().token);

        // Winner checks

        // Tie check
        if (board.isFull()) {
            // end game
            board.printBoard();
            console.log("Tie!");
            restartGame();
            return;
        }

        // Progress game
        switchPlayerTurn();
        printRound();
    };

    const restartGame = () => {
        console.log("Restart Game..");
        board = Gameboard();
    }

    //First round print:
    printRound();

    return { playRound, restartGame };
}

const game = GameController('Player1', 'Player2');