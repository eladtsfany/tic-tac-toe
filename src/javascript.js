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

    const symbolBoard = () => {
        const boardSymbols = board.map(row => row.map(cell => cell.getSymbol()));
        return boardSymbols;
    };
    //logging the board with symbols only
    const printBoard = () => { console.log(symbolBoard()) };

    // returns false if theres still space to mark in the current game/table. True if table is full of user marks.
    const isFull = () => board.every(row => row.every(cell => cell.getSymbol() !== 0));
    // const isFull = () => {
    //     let flag = true;
    //     board.forEach(row => row.forEach(cell => {
    //         if (cell.getSymbol() === 0) flag = false;
    //     }));
    //     return flag;
    // }

    const markSymbol = (player, row, column) => {
        if (row > 2 || row < 0 || column > 2 || column < 0) {
            console.log('Invalid index... --> max 3 rows/columns');
            return;
        }
        if (board[row][column].getSymbol() !== 0) {
            console.log(`Selected cell [${row}, ${column}] is already marked..`);
            return;
        }
        board[row][column].addSymbol(player);
    }

    const checkWinner = () => {
        const boardSymbols = symbolBoard();
        let win = false;

        // Rows 1,2,3 respectively:
        if ((boardSymbols[0][0] !== 0 && boardSymbols[0][0] === boardSymbols[0][1] && boardSymbols[0][0] === boardSymbols[0][2]) ||
            (boardSymbols[1][0] !== 0 && boardSymbols[1][0] === boardSymbols[1][1] && boardSymbols[1][0] === boardSymbols[1][2]) ||
            (boardSymbols[2][0] !== 0 && boardSymbols[2][0] === boardSymbols[2][1] && boardSymbols[2][0] === boardSymbols[2][2]))
            win = true;
        // Columns 1,2,3 respectively:
        else if
            ((boardSymbols[0][0] !== 0 && boardSymbols[0][0] === boardSymbols[1][0] && boardSymbols[0][0] === boardSymbols[2][0]) ||
            (boardSymbols[0][1] !== 0 && boardSymbols[0][1] === boardSymbols[1][1] && boardSymbols[0][1] === boardSymbols[2][1]) ||
            (boardSymbols[0][2] !== 0 && boardSymbols[0][2] === boardSymbols[1][2] && boardSymbols[0][2] === boardSymbols[2][2]))
            win = true;
        // Diagonals 1,2 respectively:
        else if
            ((boardSymbols[0][0] !== 0 && boardSymbols[0][0] === boardSymbols[1][1] && boardSymbols[0][0] === boardSymbols[2][2]) ||
            (boardSymbols[0][2] !== 0 && boardSymbols[0][2] === boardSymbols[1][1] && boardSymbols[0][2] === boardSymbols[2][0]))
            win = true;

        return win;
    }

    return {
        getBoard,
        printBoard,
        symbolBoard,
        markSymbol,
        isFull,
        checkWinner
    };
};

function Cell() {
    // 0 = empty | 1 = player1 (X) | 2 = player2 (O)
    let value = 0;

    const addSymbol = (playerToken) => { value = playerToken };
    const getSymbol = () => value;

    return { addSymbol, getSymbol };
}

function GameController(playerOneName, playerTwoName) {
    let board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 'X'
        },
        {
            name: playerTwoName,
            token: 'O'
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

        board.markSymbol(getActivePlayer().token, row, column);
        console.log(`${getActivePlayer().name} has marked cell [${row}, ${column}].`);

        // Winner check
        if (board.checkWinner()) {
            board.printBoard();
            console.log(`${getActivePlayer().name} Won!`);
            restartGame();
            return;
        }
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
        console.log("Restarting Game..");
        board = Gameboard();
        board.printBoard();
    }

    //First round print:
    printRound();

    return {
        playRound,
        getActivePlayer
    };
}

const game = GameController('Player1', 'Player2');

const playerTurnHeader = document.getElementById('activePlayer');

const gridBoard = document.getElementById('gridBoard');

// insert cells in html if using this:
// const cells = Array.from(gridBoard.querySelectorAll('div.cell'));
// cells.forEach((cell) => { cell.addEventListener('click', handleClick) });

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', handleClick);
        cell.setAttribute('data-row', i);
        cell.setAttribute('data-column', j);
        gridBoard.appendChild(cell);
    }
}


function handleClick(e) {
    //play round
    const row = e.target.getAttribute('data-row');
    const column = e.target.getAttribute('data-column');
    game.playRound(row, column);
    //update turn header
    playerTurnHeader.textContent = `${game.getActivePlayer().name}'s turn`;
    //mark clicked cell
    e.target.textContent = game.getActivePlayer().token;
};

