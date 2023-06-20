export const R = 7;
export const C = 7;
export const SUM = 10;
export const EMPTY = '';
export const REMOVED = 'X';
export const POINTS_INCREMENT = 100;
export const POINTS_DECREMENT = 200;
export const TIMER_SECONDS_INCREMENT = 2;
export const TIMER_SECONDS_DECREMENT = 1;
export const TIMER = 60;

// const template = {
//   x: 0,
//   y: 0,
//   value: 0,
//   prevX: null,
//   nextX: null,
//   prevY: null,
//   nextY: null
// };

export const getRandomValue = () => {
  return Math.floor(Math.random() * 9) + 1;
};

export const getGeneratedMatrix = () => {
  const matrix = [];

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      matrix[i] = [];
    }
  }

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const el = {};

      el.value = getRandomValue();
      el.x = i;
      el.y = j;
      matrix[i][j] = el;

      if (i > 0) {
        const prevY = matrix[i - 1][j];
        linkY(prevY, el);
      }

      if (j > 0) {
        const prevX = matrix[i][j - 1];
        linkX(prevX, el);
      }
    }
  }

  return matrix;
};

export const getValidMatrix = () => {
  let matrix = null;
  let result = null;
  while (result === null) {
    matrix = getGeneratedMatrix();
    result = searchCandidates(matrix);
  }
  return matrix;
};

export const linkX = (el1, el2) => {
  if (el1) el1.nextX = el2;
  if (el2) el2.prevX = el1;
};

export const linkY = (el1, el2) => {
  if (el1) el1.nextY = el2;
  if (el2) el2.prevY = el1;
};

export const unlink = (el) => {
  if (el) {
    el.prevX = null;
    el.nextX = null;
    el.prevY = null;
    el.nextY = null;
  }
};

export const checkByValues = (x, y) => {
  return x === y || x + y === SUM;
};

const checkByColumn = (cellA, cellB) => {
  if (cellA.x === cellB.x) return false;
  if (cellA.y !== cellB.y) return false;
  if (Math.abs(cellA.x - cellB.x) === 1) return true;
  const start = cellA.x > cellB.x ? cellB : cellA;
  const end = cellA.x > cellB.x ? cellA : cellB;
  const next = start.nextY;
  if (next.x === end.x && next.y === end.y) return true;
  return false;
};

const checkByRows = (cellA, cellB) => {
  let start = cellA.x > cellB.x ? cellB : cellA;
  let end = cellA.x > cellB.x ? cellA : cellB;
  if (cellA.x === cellB.x && cellA.y > cellB.y) {
    start = cellB;
    end = cellA;
  }
  if (cellA.x === cellB.x && cellA.y < cellB.y) {
    start = cellA;
    end = cellB;
  }
  const next = start.nextX;
  if (next && next.x === end.x && next.y === end.y) return true;
  return false;
};

export const checkCandidates = (cellA, cellB) => {
  if (!checkByValues(cellA.value, cellB.value)) return false;
  if (checkByColumn(cellA, cellB) || checkByRows(cellA, cellB)) return true;
  return false;
};

export const checkGameSuccess = (board) => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const current = board[i][j];
      if (current.value !== REMOVED && current.value !== EMPTY) {
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
        return [current, nextX];
      }

      const nextY = current.nextY;
      if (nextY && checkByValues(current.value, nextY.value)) {
        // hint match result type
        return [current, nextY];
      }
    }
  }
  return null;
};

export const getCurrentValues = (board, last) => {
  const values = [];
  for (let i = 0; i <= last[0]; i++) {
    for (let j = 0; j <= (i === last[0] ? last[1] : C - 1); j++) {
      const current = board[i][j];
      if (current.value !== REMOVED && current.value !== EMPTY) {
        values.push(current.value);
      }
    }
  }
  return values;
};
