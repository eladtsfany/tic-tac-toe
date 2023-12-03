const startButton = document.getElementById('startButton').addEventListener('click', startGame);
const restartButton = document.getElementById('restartButton');
const turnHeader = document.querySelector('div.turn-header');
const activePlayerSpan = document.getElementById('activePlayer');
const activeSymbolSpan = turnHeader.querySelector('#activeSymbol>span');
const gridBoard = document.getElementById('gridBoard');

// let game;
let game = GameController('Player1', 'Player2');

function updateTurnHeader() {
    activePlayerSpan.textContent = `${game.getActivePlayer().name}'s turn`;
    activeSymbolSpan.textContent = `${game.getActivePlayer().token}`;
}

function startGame(e) {
    gridBoard.classList.remove('disabled');
    e.target.classList.add('hide');
    restartButton.classList.remove('hide');
    restartButton.addEventListener('click', game.restartGame);
    turnHeader.classList.remove('hidden');
}

function restartGame() {
    game.restartGame();
    game = GameController('Player1', 'Player2');
}

function handleClick(e) {
    // do nothing and return if cell is already marked
    if (e.target.textContent.trim().length > 0) return;

    //mark clicked cell
    e.target.textContent = game.getActivePlayer().token;

    //play round
    const row = e.target.getAttribute('data-row');
    const column = e.target.getAttribute('data-column');
    game.playRound(row, column);

    //check for win
    const winningCells = game.checkWinner(); // if winner found: [[row,column], [row,column], [row,column]] | else: [] 
    if (winningCells.length !== 0) {
        gridBoard.classList.add('disabled');
        // console.log(`winning cells: [${winningCells[0]}, ${winningCells[1]}, ${winningCells[2]}]`);
        activePlayerSpan.textContent = `${game.getActivePlayer().name} Wins!`;
        activePlayerSpan.classList.add('win');
        activeSymbolSpan.classList.add('win');
        winningCells.forEach(([dataRow, dataColumn]) => {
            const winnerCell = gridBoard.querySelector(`div.cell[data-row='${dataRow}'][data-column='${dataColumn}']`);
            winnerCell.classList.add('winner');
        });
        // game.restartGame();
        return;
    }
};


// Factory function
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

    // A function that generates a 3x3 board with cell divs.
    const populateBoard = () => {
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
    }
    populateBoard();

    const getBoard = () => board;

    const symbolBoard = () => {
        const boardSymbols = board.map(row => row.map(cell => cell.getSymbol()));
        return boardSymbols;
    };
    //logging the board with symbols only
    const printBoard = () => { console.log(symbolBoard()) };

    // returns false if theres still space to mark in the current game/table. True if table is full of user marks.
    const isFull = () => board.every(row => row.every(cell => cell.getSymbol() !== 0));

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

    const restartBoard = () => {
        while (gridBoard.firstChild) gridBoard.removeChild(gridBoard.firstChild);
        // faster but less secured..
        // gridBoard.innerHTML = '';
        populateBoard();
    }

    return {
        getBoard,
        printBoard,
        symbolBoard,
        markSymbol,
        restartBoard,
        isFull
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
        if (checkWinner().length !== 0) {
            board.printBoard();
            console.log(`${getActivePlayer().name} Won!`);
            return;
        }
        // Tie check
        if (board.isFull()) {
            board.printBoard();
            console.log("Tie!");
            activePlayerSpan.textContent = `Its a Tie!`;
            gridBoard.classList.add('disabled');
            return;
        }

        // Progress game
        switchPlayerTurn();
        updateTurnHeader();
        printRound();
    };

    // A function that returns an array containing the winning cells' index if a win was found, and returns an empty array if none. 
    const checkWinner = () => {
        const boardSymbols = board.symbolBoard();

        // Rows
        for (let i = 0; i < 3; i++)
            if (checkLine(boardSymbols[i][0], boardSymbols[i][1], boardSymbols[i][2]))
                return [[i, 0], [i, 1], [i, 2]];
        // Columns
        for (let j = 0; j < 3; j++)
            if (checkLine(boardSymbols[0][j], boardSymbols[1][j], boardSymbols[2][j]))
                return [[0, j], [1, j], [2, j]];
        // Diagonals
        if (checkLine(boardSymbols[0][0], boardSymbols[1][1], boardSymbols[2][2]))
            return [[0, 0], [1, 1], [2, 2]];
        else if (checkLine(boardSymbols[0][2], boardSymbols[1][1], boardSymbols[2][0]))
            return [[0, 2], [1, 1], [2, 0]];

        return [];
    }

    // returns true if all the values equals to eachother and marked
    const checkLine = (cellValue1, cellValue2, cellValue3) =>
        cellValue1 !== 0 && cellValue1 === cellValue2 && cellValue2 === cellValue3;

    const restartGame = () => {
        console.log("Restarting Game..");
        board = Gameboard();
        board.printBoard();
        board.restartBoard();
        activePlayer = players[0];
        activePlayerSpan.classList.remove('win');
        activeSymbolSpan.classList.remove('win');
        updateTurnHeader();
        gridBoard.classList.remove('disabled');
    }

    //First round print:
    printRound();
    activePlayerSpan.textContent = `${getActivePlayer().name}'s turn`;
    activeSymbolSpan.textContent = `${getActivePlayer().token}`;

    return {
        playRound,
        getActivePlayer,
        checkWinner,
        restartGame
    };
}
