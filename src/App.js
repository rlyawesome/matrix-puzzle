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
    if (checkCandidates(board, first, second)) {
      handleCandidatesSuccess(first, second);
    } else {
      handleCandidatesError();
    }
    setFirst(null);
    setSecond(null);
    setHintResult(null);
  }, [first, second]);

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
        newBoard[i][j] = values[pointer++];
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
