export const R = 15;
export const C = 10;
export const SUM = 10;
export const ROWS_FILLED = 3;
export const EMPTY = '';
export const REMOVED = 'X';

// const template = {
//   x: 0,
//   y: 0,
//   value: 0,
//   prevX: null,
//   nextX: null,
//   prevY: null,
//   nextY: null
// };

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
      const el = {};

      if (i < ROWS_FILLED) {
        el.value = getRandomValue();
        latest = [i, j];
      } else {
        el.value = EMPTY;
      }

      el.x = i;
      el.y = j;
      matrix[i][j] = el;

      if (i > 0) {
        const prevY = matrix[i - 1][j];
        linkY(prevY, el);
      }

      if (i > 0 || j > 0) {
        const prevX = j > 0 ? matrix[i][j - 1] : matrix[i - 1][C - 1];
        linkX(prevX, el);
      }
    }
  }

  return { matrix, latest };
};

export const linkX  = (el1, el2) => {
  if (el1) el1.nextX = el2;
  if (el2) el2.prevX = el1;
}

export const linkY  = (el1, el2) => {
  if (el1) el1.nextY = el2;
  if (el2) el2.prevY = el1;
}

export const unlink = (el) => {
  if (el) {
    el.prevX = undefined;
    el.nextX = undefined;
    el.prevY = undefined;
    el.nextY = undefined;
  }
}

export const checkByValues = (x, y) => {
  return x === y || x + y === SUM;
};

const checkByColumn = (board, a, b) => {
  if (a[0] === b[0]) return false;
  if (a[1] !== b[1]) return false;
  if (Math.abs(a[0] - b[0]) === 1) return true;
  const min = Math.min(a[0], b[0]);
  const max = Math.max(a[0], b[0]);
  for (let i = min + 1; i < max; i++) {
    if (board[i][a[1]].value !== REMOVED) return false;
  }

  return true;
};

const checkByRows = (board, a, b) => {
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
      if (board[i][j].value !== REMOVED) return false;
    }
  }

  return true;
};

export const checkCandidates = (board, a, b) => {
  console.log(a, b);
  const firstValue = board[a[0]][a[1]].value;
  const secondValue = board[b[0]][b[1]].value;
  if (!checkByValues(firstValue, secondValue)) return false;
  if (firstValue !== secondValue && firstValue + secondValue !== SUM) return false;
  console.log(checkByColumn(board, a, b), ' ', checkByRows(board, a, b));
  if (checkByColumn(board, a, b) || checkByRows(board, a, b)) return true;
  return false;
};

export const checkGameSuccess = (board) => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (board[i][j].value !== REMOVED && board[i][j].value !== EMPTY) {
        return false;
      }
    }
  }
  return true;
};

export const searchCandidates = (board) => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const current = board[i][j];
      if (current.value === EMPTY) return null;
      if (current.value === REMOVED) continue;

      const nextX = current.nextX;
      if (nextX && checkByValues(current.value, nextX.value)) {
        // hint match result type
        console.log([`${current.x},${current.y}`, `${nextX.x},${nextX.y}`]);
        return [`${current.x},${current.y}`, `${nextX.x},${nextX.y}`];
      }

      const nextY = current.nextY;
      if (nextY && checkByValues(current.value, nextY.value)) {
        // hint match result type
        console.log([`${current.x},${current.y}`, `${nextY.x},${nextY.y}`]);
        return [`${current.x},${current.y}`, `${nextY.x},${nextY.y}`];
      }
    }
  }
  return null;
};

export const getCurrentValues = (board, last) => {
  const values = [];
  for (let i = 0; i <= last[0]; i++) {
    for (let j = 0; j <= (i === last[0] ? last[1] : C - 1); j++) {
      console.log(i, j);
      if (board[i][j].value !== REMOVED && board[i][j].value !== EMPTY) {
        values.push(board[i][j].value);
      }
    }
  }
  return values;
};
