import { R, C, SUM, EMPTY, REMOVED, MAX_NUMBER } from './constants';

const shuffle = (arr) => {
  const N = arr.length;
  const shuffledArr = [...arr];
  for (let i = 0; i < N; i++) {
    const r = Math.floor(Math.random() * (i + 1));
    const temp = shuffledArr[i];
    shuffledArr[i] = shuffledArr[r];
    shuffledArr[r] = temp;
  }
  return shuffledArr;
};

export const getRandomValue = () => {
  return Math.floor(Math.random() * MAX_NUMBER) + 1;
};

export const generatePairValues = () => {
  const values = [];
  // const emojis = ['😀', '😃', '😄', '😁'];
  let k = 1;
  for (let i = 0; i < (R * C) / 2; i++) {
    if (k > MAX_NUMBER) {
      k = 1;
    }
    values.push(k++);
  }

  return shuffle([...values, ...values]);
};

export const generateMatrix = () => {
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
      el.state = '#';
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

export const generateDungeonMatrix = () => {
  const matrix = [];
  const values = generatePairValues();

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      matrix[i] = [];
    }
  }

  let k = 0;
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const el = {};
      // if (i === 0 || i === R - 1 || j === 0 || j === C - 1) {
      //   el.value = '';
      //   el.state = '.';
      //   el.x = i;
      //   el.y = j;
      //   matrix[i][j] = el;
      // } else {
      el.value = values[k++];
      el.state = '#';
      el.x = i;
      el.y = j;
      matrix[i][j] = el;
      // }

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

export const reshuffleDungeonMatrix = (board) => {
  const remaining = [];
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const current = board[i][j];
      if (current.state === '#') {
        remaining.push(current.value);
      }
    }
  }
  const shuffled = shuffle(remaining);
  const newBoard = [];
  let k = 0;
  for (let i = 0; i < R; i++) {
    newBoard[i] = [];
    for (let j = 0; j < C; j++) {
      const cell = { ...board[i][j] };
      newBoard[i][j] = cell;
      if (cell.state === '#') {
        cell.value = shuffled[k++];
      }
    }
  }
  return newBoard;
};

export const getValidReshuffledDungeonMatrix = (board) => {
  let matrix = null;
  let result = null;
  while (result === null) {
    matrix = reshuffleDungeonMatrix(board);
    result = searchDungeonCandidates(matrix);
  }
  console.log(matrix);
  return matrix;
};

export const generateValidDungeonMatrix = () => {
  let matrix = null;
  let result = null;
  while (result === null) {
    matrix = generateDungeonMatrix();
    result = searchDungeonCandidates(matrix);
  }
  return matrix;
};

export const generateValidMatrix = () => {
  let matrix = null;
  let result = null;
  while (result === null) {
    matrix = generateMatrix();
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

export const checkDungeonGameSuccess = (board) => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const current = board[i][j];
      if (current.state === '#') {
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

export const generateVisitedMatrix = () => {
  const matrix = [];

  for (let i = 0; i < R; i++) {
    matrix[i] = [];
    for (let j = 0; j < C; j++) {
      matrix[i][j] = 0;
    }
  }

  return matrix;
};

export const checkDungeonCells = (cellA, cellB, board) => {
  // if (!checkByValues(cellA.value, cellB.value)) return false;
  console.log(cellA, cellB);
  if (cellA.value !== cellB.value) return false;
  if (cellA.x === cellB.x && cellA.y === cellB.y) return false;
  const rq = [];
  const cq = [];
  const dq = []; // directions queue
  const pq = []; // pivots count queue
  const parentsQueue = [];
  // const visited = generateVisitedMatrix();
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, 1, -1];
  const directions = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
  const maxPivots = 3;
  let reachedEnd = false;
  let moveCount = 0;
  let nodesLeftInLayer = 1;
  let nodesInNextLayer = 0;
  const result = {
    path: [],
    passed: false,
  };

  rq.push(cellA.x);
  cq.push(cellA.y);
  dq.push('');
  pq.push(0);
  parentsQueue.push(null);

  // visited[cellA.x][cellA.y] = true;
  cellB.state = 'E';

  while (rq.length > 0) {
    const r = rq.shift();
    const c = cq.shift();
    const d = dq.shift();
    const p = pq.shift();
    const parent = parentsQueue.shift();

    if (board[r][c].state === 'E') {
      reachedEnd = true;
      result.path.push([r, c]);
      let nextParent = parent;
      while (nextParent) {
        result.path.push([nextParent.r, nextParent.c]);
        nextParent = nextParent.parent;
      }
      break;
    }

    for (let i = 0; i < 4; i++) {
      const rr = r + dr[i];
      const cc = c + dc[i];
      const direction = directions[i];
      let pivotsCount = p;

      if (rr < 0 || cc < 0) continue;
      if (rr >= R || cc >= C) continue;

      // if (visited[rr][cc]) continue;
      if (board[rr][cc].state === '#') continue;

      if (d !== direction) {
        pivotsCount++;
      }

      if (pivotsCount > maxPivots) continue;

      rq.push(rr);
      cq.push(cc);
      dq.push(direction);
      pq.push(pivotsCount);
      parentsQueue.push({
        r,
        c,
        parent,
      });
      // visited[rr][cc] = true;
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
    result.passed = true;
  }

  cellB.state = '#';

  return result;
};

export const searchDungeonCandidates = (board) => {
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (board[i][j].state !== '#') continue;
      const rq = [];
      const cq = [];
      const dq = []; // directions queue
      const pq = []; // pivots count queue
      const dr = [-1, 1, 0, 0];
      const dc = [0, 0, 1, -1];
      const directions = ['UP', 'DOWN', 'RIGHT', 'LEFT'];
      const maxPivots = 3;
      const current = board[i][j];
      let matching = null;
      let reachedEnd = false;
      let nodesLeftInLayer = 1;
      let nodesInNextLayer = 0;
      current.state = 'S';
      rq.push(i);
      cq.push(j);
      dq.push('');
      pq.push(0);

      while (rq.length > 0) {
        const r = rq.shift();
        const c = cq.shift();
        const d = dq.shift();
        const p = pq.shift();

        if (board[r][c].state === '#' && board[r][c].value === current.value) {
          matching = board[r][c];
          reachedEnd = true;
          break;
        }

        for (let i = 0; i < 4; i++) {
          if (board[r][c].state === '#') break;
          const rr = r + dr[i];
          const cc = c + dc[i];
          const direction = directions[i];
          let pivotsCount = p;

          if (rr < 0 || cc < 0) continue;
          if (rr >= R || cc >= C) continue;

          if (d !== direction) {
            pivotsCount++;
          }

          if (pivotsCount > maxPivots) continue;

          rq.push(rr);
          cq.push(cc);
          dq.push(direction);
          pq.push(pivotsCount);
          nodesInNextLayer++;
        }

        nodesLeftInLayer--;
        if (nodesLeftInLayer === 0) {
          nodesLeftInLayer = nodesInNextLayer;
          nodesInNextLayer = 0;
        }
      }

      current.state = '#';

      if (reachedEnd) {
        return [current, matching];
      }
    }
  }
  return null;
};
