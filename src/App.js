import './App.css';
import { v4 } from 'uuid';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Box, Button, Typography } from '@mui/material';
import {
  R,
  C,
  REMOVED,
  getGeneratedMatrix,
  checkCandidates,
  checkGameSuccess,
  searchCandidates,
  getCurrentValues,
  linkX,
  linkY,
  unlink,
} from './App.utils';

const { matrix, latest } = getGeneratedMatrix();
let last = latest;

function App() {
  const [board, setBoard] = useState(matrix);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [hintResult, setHintResult] = useState(null);

  useEffect(() => {
    if (first === null || second === null) return;
    if (checkCandidates(first, second)) {
      onCandidatesSuccess(first, second);
    } else {
      onCandidatesError();
    }
    setFirst(null);
    setSecond(null);
    setHintResult(null);
  }, [first, second]);

  const onCandidatesSuccess = (cellA, cellB) => {
    const newBoard = [...board];

    linkX(cellA.prevX, cellA.nextX);
    linkY(cellA.prevY, cellA.nextY);
    cellA.value = REMOVED;
    unlink(cellA);

    linkX(cellB.prevX, cellB.nextX);
    linkY(cellB.prevY, cellB.nextY);
    cellB.value = REMOVED;
    unlink(cellB);

    if (checkGameSuccess(newBoard)) {
      onWin();
    }
    setBoard(newBoard);
  };

  const onCandidatesError = () => {
    console.log('Oops!');
  };

  const handleClick = (cell) => {
    if (!first) {
      setFirst(cell);
    } else {
      setSecond(cell);
    }
  };

  const isActiveCell = (cell) => {
    if (first !== null && first.x === cell.x && first.y === cell.y) return true;
    if (second !== null && second.x === cell.x && second.y === cell.y) return true;
    return false;
  };

  const isHintCell = (cell) => {
    if (hintResult === null) return false;
    const cellA = hintResult[0];
    const cellB = hintResult[1];
    return (cell.x === cellA.x && cell.y === cellA.y) || (cell.x === cellB.x && cell.y === cellB.y);
  };

  const handleContinue = () => {
    const values = getCurrentValues(board, last);
    let pointer = 0;
    let newBoard = [...board];
    let latest = null;
    for (let i = last[0]; i < R; i++) {
      for (let j = i === last[0] ? last[1] + 1 : 0; j < C; j++) {
        if (values.length === pointer) {
          break;
        }
        latest = [i, j];
        newBoard[i][j].value = values[pointer++];
      }
    }
    if (values.length > pointer) {
      onLose();
    }
    last = latest;
    setBoard(newBoard);
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const handleHint = () => {
    const result = searchCandidates(board);
    if (result !== null) {
      setHintResult(result);
    }
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
            {board.map((row) =>
              row.map((cell) => (
                <button
                  type='button'
                  className={cn('cell', {
                    _active: isActiveCell(cell),
                    _hint: isHintCell(cell),
                  })}
                  key={v4()}
                  onClick={() => handleClick(cell)}
                  disabled={cell.value === REMOVED || !cell.value}
                >
                  {cell.value === REMOVED ? <span>&#10005;</span> : cell.value}
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
