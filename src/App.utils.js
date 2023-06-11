export const R = 15;
export const C = 10;
export const SUM = 10;
export const ROWS_FILLED = 3;
export const EMPTY = '';
export const REMOVED = 'X';

export const getGeneratedMatrix = () => {
  const matrix = [];
  let latest = null;

  const getRandomValue = () => {
    return Math.floor(Math.random() * 9) + 1;
  };

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      matrix[i] = [];
    }
  }

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (i < ROWS_FILLED) {
        matrix[i][j] = getRandomValue();
        latest = [i, j];
      } else {
        matrix[i][j] = EMPTY;
      }
    }
  }

  return { matrix, latest };
};

export const checkByValues = (x, y) => {
  return x === y || x + y === SUM;
};

const checkByRow = (a, b) => {
  if (a[1] === b[1]) return false;
  if (Math.abs(a[1] - b[1]) === 1 && a[0] === b[0]) return true;
  return false;
};

const checkByColumn = (board, a, b) => {
  if (a[0] === b[0]) return false;
  if (a[1] !== b[1]) return false;
  if (Math.abs(a[0] - b[0]) === 1) return true;
  const min = Math.min(a[0], b[0]);
  const max = Math.max(a[0], b[0]);
  for (let i = min + 1; i < max; i++) {
    if (board[i][a[1]] !== REMOVED) return false;
  }

  return true;
};

const checkClosestByDirection = (board, a, b) => {
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
      if (board[i][j] !== REMOVED) return false;
    }
  }

  return true;
};

export const checkCandidates = (board, a, b) => {
  console.log(a, b);
  const firstValue = board[a[0]][a[1]];
  const secondValue = board[b[0]][b[1]];
  if (!checkByValues(firstValue, secondValue)) return false;
  if (firstValue !== secondValue && firstValue + secondValue !== SUM) return false;
  console.log(checkByRow(a, b), ' ', checkByColumn(board, a, b), ' ', checkClosestByDirection(board, a, b));
  if (checkByRow(a, b) || checkByColumn(board, a, b) || checkClosestByDirection(board, a, b)) return true;
  return false;
};

export const checkGameSuccess = (board) => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (board[i][j] !== REMOVED && board[i][j] !== EMPTY) {
        return false;
      }
    }
  }
  return true;
};

const searchByRow = (board, i, j) => {
  for (let k = j + 1; k < C; k++) {
    const secondValue = board[i][k];
    if (secondValue === EMPTY) return null;
    if (secondValue === REMOVED) continue;
    if (checkByValues(board[i][j], secondValue)) {
      console.log([`${i},${j}`, `${i},${k}`]);
      return [`${i},${j}`, `${i},${k}`];
    } else {
      return null;
    }
  }
  return null;
};

const searchByColumn = (board, i, j) => {
  for (let k = i + 1; k < R; k++) {
    const secondValue = board[k][j];
    if (secondValue === EMPTY) return null;
    if (secondValue === REMOVED) continue;
    if (checkByValues(board[i][j], secondValue)) {
      // hint match result type
      console.log([`${i},${j}`, `${k},${j}`]);
      return [`${i},${j}`, `${k},${j}`];
    } else {
      return null;
    }
  }
  return null;
};

const searchByDirection = (board, i, j) => {
  for (let ii = i; ii < R; ii++) {
    const jjInitial = ii === i ? j + 1 : 0;
    for (let jj = jjInitial; jj < C; jj++) {
      const secondValue = board[ii][jj];
      if (secondValue === EMPTY) return null;
      if (secondValue === REMOVED) continue;
      if (checkByValues(board[i][j], secondValue)) {
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

export const searchCandidates = (board) => {
  let result = null;
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const currentValue = board[i][j];
      if (currentValue === EMPTY) return null;
      if (currentValue === REMOVED) continue;
      result = searchByColumn(board, i, j);
      if (result !== null) return result;
      result = searchByDirection(board, i, j);
      if (result !== null) return result;
    }
  }
  return null;
};

export const getCurrentValues = (board, last) => {
  const values = [];
  for (let i = 0; i <= last[0]; i++) {
    for (let j = 0; j <= (i === last[0] ? last[1] : C - 1); j++) {
      console.log(i, j);
      if (board[i][j] !== REMOVED && board[i][j] !== EMPTY) {
        values.push(board[i][j]);
      }
    }
  }
  return values;
};
