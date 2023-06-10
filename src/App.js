import './App.css';
import { v4 } from 'uuid';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Box, Button, Typography } from '@mui/material';

const matrix = [];
export const R = 15;
export const C = 10;
export const SUM = 10;
export const ROWS_FILLED = 3;
export const EMPTY = '';
export const REMOVED = 'X';
let last = null;

const getRandomValue = () => {
  return Math.floor(Math.random() * 9) + 1;
};

const generateMatrix = () => {
  const PI = '3141592653589793238462643383279502884197';
  const numbers = PI.split('');
  let pointer = 0;

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      matrix[i] = [];
    }
  }

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (i < ROWS_FILLED) {
        matrix[i][j] = Number(numbers[pointer++]);
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
  const [gameResult, setGameResult] = useState(null);
  const [hintResult, setHintResult] = useState(null);

  useEffect(() => {
    if (first === null || second === null) return;
    if (checkCandidates(first, second)) {
      handleCandidatesSuccess(first, second);
    } else {
      handleCandidatesError();
    }
    setFirst(null);
    setSecond(null);
    setHintResult(null);
  }, [first, second]);

  const checkCandidates = (a, b) => {
    console.log(a, b);
    const firstValue = board[a[0]][a[1]];
    const secondValue = board[b[0]][b[1]];
    if (!checkByValues(firstValue, secondValue)) return false;
    if (firstValue !== secondValue && firstValue + secondValue !== SUM) return false;
    console.log(checkByRow(a, b), ' ', checkByColumn(a, b), ' ', checkClosestByDirection(a, b));
    if (checkByRow(a, b) || checkByColumn(a, b) || checkClosestByDirection(a, b)) return true;
    return false;
  };

  const checkByValues = (x, y) => {
    return x === y || x + y === SUM;
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

  const isActiveCell = (i, j) => {
    if (first !== null && first[0] === i && first[1] === j) return true;
    if (second !== null && second[0] === i && second[1] === j) return true;
    return false;
  };

  const isHintCell = (i, j) => {
    if (hintResult === null) return false;
    const coordsFirst = hintResult[0].split(',');
    const coordsSecond = hintResult[1].split(',');
    const isFirstMatch = i === Number(coordsFirst[0]) && j === Number(coordsFirst[1]);
    const isSecondMatch = i === Number(coordsSecond[0]) && j === Number(coordsSecond[1]);
    return isFirstMatch || isSecondMatch;
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
    last = latest;
    setBoard(newBoard);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const searchCandidates = (boardRef) => {
    let result = null;
    for (let i = 0; i < R; i++) {
      for (let j = 0; j < C; j++) {
        const currentValue = boardRef[i][j];
        if (currentValue === EMPTY) return null;
        if (currentValue === REMOVED) continue;
        result = searchByColumn(boardRef, i, j);
        if (result !== null) return result;
        result = searchByDirection(boardRef, i, j);
        if (result !== null) return result;
      }
    }
    return null;
  };

  const searchByRow = (boardRef, i, j) => {
    for (let k = j + 1; k < C; k++) {
      const secondValue = boardRef[i][k];
      if (secondValue === EMPTY) return null;
      if (secondValue === REMOVED) continue;
      if (checkByValues(boardRef[i][j], secondValue)) {
        // hint match result type
        console.log([`${i},${j}`, `${i},${k}`]);
        return [`${i},${j}`, `${i},${k}`];
      } else {
        return null;
      }
    }
    return null;
  };

  const searchByColumn = (boardRef, i, j) => {
    for (let k = i + 1; k < R; k++) {
      const secondValue = boardRef[k][j];
      if (secondValue === EMPTY) return null;
      if (secondValue === REMOVED) continue;
      if (checkByValues(boardRef[i][j], secondValue)) {
        // hint match result type
        console.log([`${i},${j}`, `${k},${j}`]);
        return [`${i},${j}`, `${k},${j}`];
      } else {
        return null;
      }
    }
    return null;
  };

  const searchByDirection = (boardRef, i, j) => {
    for (let ii = i; ii < R; ii++) {
      const jjInitial = ii === i ? j + 1 : 0;
      for (let jj = jjInitial; jj < C; jj++) {
        const secondValue = boardRef[ii][jj];
        if (secondValue === EMPTY) return null;
        if (secondValue === REMOVED) continue;
        if (checkByValues(boardRef[i][j], secondValue)) {
          // hint match result type
          console.log([`${i},${j}`, `${ii},${jj}`]);
          return [`${i},${j}`, `${ii},${jj}`];
        } else {
          return null;
        }
      }
    }
    return null;
  };

  const handleHint = () => {
    const result = searchCandidates(board);
    setHintResult(result);
  };

  const onWin = () => {
    setGameResult('WIN');
  };

  const onLose = () => {
    setGameResult('LOSE');
  };

  return (
    <div className='app'>
      <header className='header'>
        <Typography variant='h5'>Matrix Puzzle</Typography>
      </header>

      <div className='body'>
        <div className='container'>
          {gameResult === 'WIN' && (
            <Typography variant='h6' textAlign='center' my={1}>
              Victory is yours! Well done! 😎
            </Typography>
          )}
          {gameResult === 'LOSE' && (
            <Typography variant='h6' textAlign='center' my={1}>
              Try again, victory awaits! 😉
            </Typography>
          )}
          <div className='matrix'>
            {board.map((row, i) =>
              row.map((el, j) => (
                <button
                  type='button'
                  className={cn('cell', {
                    _active: isActiveCell(i, j),
                    _hint: isHintCell(i, j),
                  })}
                  key={v4()}
                  onClick={() => handleClick(i, j)}
                  disabled={el === REMOVED || !el}
                >
                  {el === 'X' ? <span>&#10005;</span> : el}
                </button>
              ))
            )}
          </div>
          <div className='toolbar'>
            <Button variant='contained' onClick={handleNewGame} sx={{ backgroundColor: 'deepskyblue' }}>
              New game
            </Button>
            <Box display='flex' gap={1}>
              <Button variant='contained' onClick={handleHint} sx={{ backgroundColor: 'deepskyblue' }}>
                Hint
              </Button>
              <Button
                variant='contained'
                onClick={handleContinue}
                sx={{
                  backgroundColor: 'deepskyblue',
                  '&.Mui-disabled': {
                    backgroundColor: 'lightgray',
                  },
                }}
                disabled={gameResult !== null}
              >
                Continue
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
