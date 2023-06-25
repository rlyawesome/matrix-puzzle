import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Box, Button, LinearProgress, styled, Typography } from '@mui/material';
import {
  checkCandidates,
  searchCandidates,
  getRandomValue,
  generateValidMatrix,
  generateVisitedMatrix,
  checkByValues,
} from '../../core/core';

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

const matrix = generateValidMatrix();
const dr = [-1, 1, 0, 0];
const dc = [0, 0, 1, -1];

export const checkCells = (cellA, cellB, board) => {
  // if (!checkByValues(cellA.value, cellB.value)) return false;
  if (cellA.value !== cellB.value) return false;
  if (cellA.x === cellB.x && cellA.y === cellB.y) return false;
  const rq = [];
  const cq = [];
  const visited = generateVisitedMatrix();
  let reachedEnd = false;
  let moveCount = 0;
  let nodesLeftInLayer = 1;
  let nodesInNextLayer = 0;

  rq.push(cellA.x);
  cq.push(cellA.y);
  visited[cellA.x][cellA.y] = true;
  cellB.state = 'E';

  while (rq.length > 0) {
    const r = rq.shift();
    const c = cq.shift();
    console.log('r: ', r, 'c:', c, 'cellB.x: ', cellB.x, 'cellB.y: ', cellB.y);
    if (board[r][c].state === 'E') {
      reachedEnd = true;
      break;
    }
    for (let i = 0; i < 4; i++) {
      const rr = r + dr[i];
      const cc = c + dc[i];

      if (rr < 0 || cc < 0) continue;
      if (rr >= R || cc >= C) continue;

      if (visited[rr][cc]) continue;
      if (board[rr][cc].state === '#') continue;

      rq.push(rr);
      cq.push(cc);
      visited[rr][cc] = true;
      nodesInNextLayer++;
    }
    nodesLeftInLayer--;
    if (nodesLeftInLayer === 0) {
      nodesLeftInLayer = nodesInNextLayer;
      nodesInNextLayer = 0;
      moveCount++;
    }
  }

  if (reachedEnd) {
    console.log('reached end', moveCount);
    return true;
  }

  return false;
};

const StyledButton = styled(Button)(() => ({
  color: '#ef6eae',
  borderColor: '#ef6eae',
  '&:hover': {
    borderColor: '#ef6eae',
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

  useEffect(() => {
    if (first === null || second === null) return;
    if (checkCells(first, second, board)) {
      onCandidatesSuccess(first, second);
    } else {
      onCandidatesError(first, second);
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
    cellA.state = '.';
    cellB.state = '.';
    const newBoard = [...board];
    // cellA.value = REMOVED;
    // cellB.value = REMOVED;
    // const result = searchCandidates(newBoard);
    // if (result === null) {
    //   setBoard(generateValidMatrix());
    // } else {
    //   setBoard(newBoard);
    // }
    setBoard(newBoard);
  };

  const onCandidatesError = (cellA, cellB) => {
    console.log('Oops!');
    cellA.state = '#';
    cellB.state = '#';
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
    <>
      <div className='progress'>
        <LinearProgress variant='determinate' value={(timerSeconds * 100) / TIMER} />
      </div>
      <header className='header'>
        <Typography variant='h5' mb={2} textTransform='uppercase'>
          Matrix Dungeon
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
                  disabled={cell.state === '.' || !cell.value}
                  onAnimationEnd={() => setSuccessCells([])}
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
    </>
  );
}

export default MatrixDungeon;
