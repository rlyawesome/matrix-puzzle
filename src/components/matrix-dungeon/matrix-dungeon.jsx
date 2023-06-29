import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Backdrop, Badge, Box, Button, LinearProgress, styled, Typography } from '@mui/material';
import {
  checkDungeonCells,
  searchDungeonCandidates,
  generateValidDungeonMatrix,
  checkDungeonGameSuccess,
  getValidReshuffledDungeonMatrix,
} from '../../core/core';
import { spring } from 'react-flip-toolkit';

import {
  R,
  C,
  SUM,
  EMPTY,
  REMOVED,
  POINTS_INCREMENT,
  POINTS_DECREMENT,
  TIMER_SECONDS_INCREMENT,
  TIMER_SECONDS_DECREMENT,
  TIMER,
} from '../../core/constants';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';

const matrix = generateValidDungeonMatrix();

const StyledButton = styled(Button)(() => ({
  color: '#ef6eae',
  borderColor: '#ef6eae',
  '&:hover': {
    borderColor: '#ef6eae',
  },
  '&:disabled': {
    opacity: 0.5,
    color: '#ef6eae',
    borderColor: '#ef6eae',
  },
}));

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#ef6eae',
  },
}));

function MatrixDungeon() {
  const [board, setBoard] = useState(matrix);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [hintResult, setHintResult] = useState(null);
  const [score, setScore] = useState(0);
  const [visibleScoreIncrement, setVisibleScoreIncrement] = useState(false);
  const [visibleScoreDecrement, setVisibleScoreDecrement] = useState(false);
  const [successCells, setSuccessCells] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(TIMER);
  const [successPath, setSuccessPath] = useState([]);
  const [gameResultOpen, setGameResultOpen] = useState(false);
  const [hintCount, setHintCount] = useState(5);

  const containerRef = useRef(null);
  useEffect(() => {
    const squares = [...containerRef.current.querySelectorAll('.cell')];
    squares.forEach((el, i) => {
      spring({
        config: 'wobbly',
        values: {
          opacity: [0, 1],
        },
        onUpdate: ({ translateY, opacity }) => {
          el.style.opacity = opacity;
          el.style.transform = `translateY(${translateY}px)`;
        },
        delay: i * 15,
        onComplete: () => {
          // add callback logic here if necessary
        },
      });
    });
  }, []);

  useEffect(() => {
    if (first === null || second === null) return;
    const result = checkDungeonCells(first, second, board);
    if (result.passed) {
      onCandidatesSuccess();
      setSuccessPath(result.path);
    } else {
      onCandidatesError();
    }
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
          setGameResultOpen(true);
          clearInterval(interval);
        }
        return sec - TIMER_SECONDS_DECREMENT;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onCandidatesSuccess = () => {
    setScore((prev) => prev + POINTS_INCREMENT);
    setVisibleScoreIncrement(true);
    setTimerSeconds((sec) => {
      if (sec < 60) {
        return sec + TIMER_SECONDS_INCREMENT;
      }
      return sec;
    });
    first.state = '.';
    second.state = '.';
    setSuccessCells([first, second]);
    setFirst(null);
    setSecond(null);
    setHintResult(null);
    if (checkDungeonGameSuccess(board)) {
      console.log('won');
      setGameResult('WIN');
      setGameResultOpen(true);
    } else {
      const result = searchDungeonCandidates(board);
      if (result === null) {
        setBoard(getValidReshuffledDungeonMatrix(board));
      }
    }
  };

  const onCandidatesError = () => {
    console.log('Oops!');
    if (first.x === second.x && first.y === second.y) {
      setFirst(null);
    } else {
      setFirst(second);
    }
    setSecond(null);
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
    return (cell.x === cellA.x && cell.y === cellA.y) || (cell.x === cellB.x && cell.y === cellB.y);
  };

  const isHintCell = (cell) => {
    if (hintResult === null) return false;
    const cellA = hintResult[0];
    const cellB = hintResult[1];
    return (cell.x === cellA.x && cell.y === cellA.y) || (cell.x === cellB.x && cell.y === cellB.y);
  };

  const isPathCell = (cell) => {
    for (const [x, y] of successPath) {
      if (cell.x === x && cell.y === y) return true;
    }
    return false;
  };

  const handleNewGame = () => {
    window.location.reload();
  };

  const handleHint = () => {
    if (gameResult !== null || hintResult) return;
    const result = searchDungeonCandidates(board);
    if (result !== null) {
      setHintResult(result);
    }
    setHintCount((prev) => prev - 1);
    setScore((prev) => prev - POINTS_DECREMENT);
    setVisibleScoreDecrement(true);
  };

  return (
    <>
      <div className='progress'>
        <LinearProgress variant='determinate' value={(timerSeconds * 100) / TIMER} />
      </div>
      <div className='body'>
        <div className='container'>
          <div className='toolbar'>
            {/* <Typography variant='h6' textAlign='right' position='relative'>
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
            </Typography> */}
            <Box display='flex' gap={1} flex='1' justifyContent='flex-end'>
              <StyledBadge badgeContent={hintCount}>
                <StyledButton variant='outlined' onClick={handleHint} disabled={hintCount === 0}>
                  Hint
                </StyledButton>
              </StyledBadge>
            </Box>
          </div>
          <div className='matrix' ref={containerRef}>
            {board.map((row) =>
              row.map((cell) => (
                <button
                  type='button'
                  className={cn('cell', {
                    _active: isActiveCell(cell),
                    _hint: isHintCell(cell),
                    _success: isSuccessCell(cell),
                    _path: isPathCell(cell),
                  })}
                  key={`${cell.x}${cell.y}`}
                  onClick={() => handleClick(cell)}
                  disabled={cell.state === '.' || !cell.value}
                  onAnimationEnd={() => {
                    setSuccessCells([]);
                    setSuccessPath([]);
                  }}
                >
                  {cell.state === '.' ? '' : cell.value}
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={gameResultOpen}
        onClick={() => setGameResultOpen(false)}
      >
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
      </Backdrop>
    </>
  );
}

export default MatrixDungeon;
