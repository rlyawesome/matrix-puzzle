import './App.css';
import { v4 } from 'uuid';
import { useEffect, useState } from 'react';
import cn from 'classnames';

const matrix = [];
const R = 20;
const C = 10;
const SUM = 10;
const ROWS_FILLED = 3;
const EMPTY = '';
const REMOVED = 'X';
let last = null;

const getRandomValue = () => {
  return Math.floor(Math.random() * 9) + 1;
};

const generateMatrix = () => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      matrix[i] = [];
    }
  }

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (i < ROWS_FILLED) {
        matrix[i][j] = getRandomValue();
        last = [i, j];
      } else {
        matrix[i][j] = EMPTY;
      }
    }
  }
};

generateMatrix();

function App() {
  const [board, setBoard] = useState(matrix);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (first === null || second === null) return;
    if (checkCandidates(first, second)) {
      handleCandidatesSuccess(first, second);
    } else {
      handleCandidatesError();
    }
    setFirst(null);
    setSecond(null);
  }, [first, second]);

  const checkCandidates = (a, b) => {
    console.log(a, b);
    if (!checkSum(a, b) && !checkEqualValues(a, b)) return false;
    console.log(checkByRow(a, b), ' ', checkByColumn(a, b), ' ', checkClosestByDirection(a, b));
    if (checkByRow(a, b) || checkByColumn(a, b) || checkClosestByDirection(a, b)) return true;
    return false;
  };

  const checkSum = (a, b) => {
    if (matrix[a[0]][a[1]] + matrix[b[0]][b[1]] === SUM) return true;
    return false;
  };

  const checkEqualValues = (a, b) => {
    if (matrix[a[0]][a[1]] === matrix[b[0]][b[1]]) return true;
    return false;
  };

  const checkByColumn = (a, b) => {
    if (a[0] === b[0]) return false;
    if (a[1] !== b[1]) return false;
    if (Math.abs(a[0] - b[0]) === 1) return true;
    const min = Math.min(a[0], b[0]);
    const max = Math.max(a[0], b[0]);
    for (let i = min + 1; i < max; i++) {
      if (matrix[i][a[1]] !== REMOVED) return false;
    }

    return true;
  };

  const checkByRow = (a, b) => {
    if (a[1] === b[1]) return false;
    if (Math.abs(a[1] - b[1]) === 1 && a[0] === b[0]) return true;
    return false;
  };

  const checkClosestByDirection = (a, b) => {
    let from = null;
    let to = null;

    if (a[0] > b[0]) {
      from = b;
      to = a;
    } else if (a[0] < b[0]) {
      from = a;
      to = b;
    } else {
      if (a[1] > b[1]) {
        from = b;
        to = a;
      } else if (a[1] < b[1]) {
        from = a;
        to = b;
      }
    }

    if (from === null || to === null) return false;

    for (let i = from[0]; i <= to[0]; i++) {
      for (let j = i === from[0] ? from[1] + 1 : 0; j < (i === to[0] ? to[1] : C); j++) {
        if (matrix[i][j] !== REMOVED) return false;
      }
    }

    return true;
  };

  const handleCandidatesSuccess = (a, b) => {
    const newBoard = [...board];
    newBoard[a[0]][a[1]] = REMOVED;
    newBoard[b[0]][b[1]] = REMOVED;
    if (checkGameSuccess(newBoard)) {
      onWin();
    }
    setBoard(newBoard);
  };

  const handleCandidatesError = () => {
    console.log('Oops!');
  };

  const checkGameSuccess = (currentBoard) => {
    for (let i = 0; i < R; i++) {
      for (let j = 0; j < C; j++) {
        if (currentBoard[i][j] !== REMOVED && currentBoard[i][j] !== EMPTY) {
          return false;
        }
      }
    }
    return true;
  };

  const handleClick = (i, j) => {
    if (!first) {
      setFirst([i, j]);
    } else {
      setSecond([i, j]);
    }
  };

  const isButtonActive = (i, j) => {
    if (first !== null && first[0] === i && first[1] === j) return true;
    if (second !== null && second[0] === i && second[1] === j) return true;
    return false;
  };

  const handleContinue = () => {
    const itemsLeft = [];
    for (let i = 0; i <= last[0]; i++) {
      for (let j = 0; j <= (i === last[0] ? last[1] : C - 1); j++) {
        console.log(i, j);
        if (board[i][j] !== REMOVED && board[i][j] !== EMPTY) {
          itemsLeft.push(board[i][j]);
        }
      }
    }

    let pointer = 0;
    let newBoard = [...board];
    let latest = null;
    for (let i = last[0]; i < R; i++) {
      for (let j = i === last[0] ? last[1] + 1 : 0; j < C; j++) {
        if (itemsLeft.length === pointer) {
          break;
        }
        latest = [i, j];
        newBoard[i][j] = itemsLeft[pointer++];
      }
    }
    if (itemsLeft.length > pointer) {
      onLose();
    }
    console.log(latest);
    last = latest;
    setBoard(newBoard);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const onWin = () => {
    console.log('Victory is yours! Well done!');
    setResult('WIN');
  };

  const onLose = () => {
    console.log(`Don't give up, you're getting closer!`);
    setResult('LOSE');
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1 className='title'>The Game</h1>
        {result === 'WIN' && <p>Victory is yours! Well done! 😎</p>}
        {result === 'LOSE' && <p>Don't give up, you're getting closer! 😉</p>}
        <div className='matrix'>
          {board.map((row, i) =>
            row.map((el, j) => (
              <button
                type='button'
                className={cn('cell', {
                  _active: isButtonActive(i, j),
                })}
                key={v4()}
                onClick={() => handleClick(i, j)}
                disabled={el === REMOVED || !el}
              >
                {el}
              </button>
            ))
          )}
        </div>
        <div className='toolbar'>
          <button type='button' className='button _continue' onClick={handleNewGame} disabled={result !== null}>
            New game
          </button>
          <button type='button' className='button _continue' onClick={handleContinue} disabled={result !== null}>
            Continue
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
