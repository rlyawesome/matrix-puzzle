import './App.css';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Box, Button, LinearProgress, styled, Typography } from '@mui/material';
import {
  REMOVED,
  checkCandidates,
  searchCandidates,
  getRandomValue,
  getValidMatrix,
  TIMER,
  POINTS_INCREMENT,
  POINTS_DECREMENT,
  TIMER_SECONDS_DECREMENT,
  TIMER_SECONDS_INCREMENT,
} from './App.utils';

const StyledButton = styled(Button)(() => ({
  color: '#ef6eae',
  borderColor: '#ef6eae',
  '&:hover': {
    borderColor: '#ef6eae',
  },
}));

const initialBoard = getValidMatrix();

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [hintResult, setHintResult] = useState(null);
  const [score, setScore] = useState(0);
  const [visibleScoreIncrement, setVisibleScoreIncrement] = useState(false);
  const [visibleScoreDecrement, setVisibleScoreDecrement] = useState(false);
  const [successCells, setSuccessCells] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(TIMER);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((sec) => {
        if (sec === 1) {
          setGameResult('LOSE');
          clearInterval(interval);
        }
        return sec - TIMER_SECONDS_DECREMENT;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onCandidatesSuccess = (cellA, cellB) => {
    setScore((prev) => prev + POINTS_INCREMENT);
    setVisibleScoreIncrement(true);
    setTimerSeconds((sec) => {
      if (sec < 60) {
        return sec + TIMER_SECONDS_INCREMENT;
      }
      return sec;
    });
    setSuccessCells([cellA, cellB]);
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
    if (gameResult !== null) return;
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

  const isSuccessCell = (cell) => {
    if (successCells.length === 0) return false;
    const cellA = successCells[0];
    const cellB = successCells[1];
    console.log(cell, cellA, cellB);
    return (cell.x === cellA.x && cell.y === cellA.y) || (cell.x === cellB.x && cell.y === cellB.y);
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
    if (gameResult !== null) return;
    const result = searchCandidates(board);
    if (result !== null) {
      setHintResult(result);
    }
    setScore((prev) => prev - POINTS_DECREMENT);
    setVisibleScoreDecrement(true);
  };

  return (
    <div className='app'>
      <div className='progress'>
        <LinearProgress variant='determinate' value={(timerSeconds * 100) / TIMER} />
      </div>
      <header className='header'>
        <Typography variant='h5' mb={2} textTransform='uppercase'>
          Matrix Square
        </Typography>
        {gameResult === 'WIN' && (
          <Typography variant='h6' textAlign='center' my={1}>
            Victory is yours! Well done! 😎
          </Typography>
        )}
        {gameResult === 'LOSE' && (
          <Typography variant='h6' textAlign='center' my={1}>
            Game over! 😉 Best score: <strong>{Math.max(score, localStorage.getItem('bestScore'))}</strong>
          </Typography>
        )}
      </header>

      <div className='body'>
        <div className='container'>
          <div className='toolbar'>
            <Typography variant='h6' textAlign='right' position='relative'>
              Score: <strong>{score}</strong>
              <span
                className={cn('score-count _plus', {
                  _visible: visibleScoreIncrement,
                })}
                onAnimationEnd={() => setVisibleScoreIncrement(false)}
              >
                +{POINTS_INCREMENT}
              </span>
              <span
                className={cn('score-count _minus', {
                  _visible: visibleScoreDecrement,
                })}
                onAnimationEnd={() => setVisibleScoreDecrement(false)}
              >
                -{POINTS_DECREMENT}
              </span>
            </Typography>
            <Box display='flex' gap={1}>
              <StyledButton variant='outlined' onClick={handleHint}>
                Hint
              </StyledButton>
            </Box>
          </div>
          <div className='matrix'>
            {board.map((row) =>
              row.map((cell) => (
                <button
                  type='button'
                  className={cn('cell', {
                    _active: isActiveCell(cell),
                    _hint: isHintCell(cell),
                    _success: isSuccessCell(cell),
                  })}
                  key={`${cell.x}${cell.y}`}
                  onClick={() => handleClick(cell)}
                  disabled={cell.value === REMOVED || !cell.value}
                  onAnimationEnd={() => setSuccessCells([])}
                >
                  {cell.value === REMOVED ? <span>&#10005;</span> : cell.value}
                </button>
              ))
            )}
          </div>
          <div className='actions'>
            <StyledButton variant='outlined' onClick={handleNewGame}>
              New game
            </StyledButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
