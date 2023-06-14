import './App.css';
import { v4 } from 'uuid';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Box, Button, Typography } from '@mui/material';
import { REMOVED, checkCandidates, searchCandidates, getRandomValue, POINTS, getValidMatrix } from './App.utils';

const initialBoard = getValidMatrix();

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [hintResult, setHintResult] = useState(null);
  const [score, setScore] = useState(0);
  const [visibleScoreIncrement, setVisibleScoreIncrement] = useState(false);

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

  useEffect(() => {
    const bestScore = localStorage.getItem('bestScore');
    if (score > bestScore) {
      localStorage.setItem('bestScore', score);
    }
  }, [score]);

  const onCandidatesSuccess = (cellA, cellB) => {
    setScore((prev) => prev + POINTS);
    setVisibleScoreIncrement(true);
    const newBoard = [...board];
    cellA.value = getRandomValue();
    cellB.value = getRandomValue();
    const result = searchCandidates(newBoard);
    if (result === null) {
      setGameResult('LOSE');
    } else {
      setBoard(newBoard);
    }
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

  const handleNewGame = () => {
    window.location.reload();
  };

  const handleHint = () => {
    const result = searchCandidates(board);
    if (result !== null) {
      setHintResult(result);
    }
  };

  return (
    <div className='app'>
      <header className='header'>
        <Typography variant='h5' mb={2}>
          Matrix Puzzle
        </Typography>
        <Typography variant='h6' textAlign='right' position='relative'>
          Your score: <strong>{score}</strong>
          <span
            className={cn('score-increment', {
              _visible: visibleScoreIncrement,
            })}
            onAnimationEnd={() => setVisibleScoreIncrement(false)}
          >
            +100
          </span>
        </Typography>
      </header>

      <div className='body'>
        <div className='container'>
          {gameResult === 'WIN' && (
            <Typography variant='h6' textAlign='center' my={1}>
              Victory is yours! Well done! 😎
            </Typography>
          )}
          {gameResult === 'LOSE' && (
            <Typography variant='body1' textAlign='center' my={1}>
              Game over! 😉 Your best score is <strong>{Math.max(score, localStorage.getItem('bestScore'))}</strong>!
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
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
