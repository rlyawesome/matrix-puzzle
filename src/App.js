import './App.css';
import MatrixDungeon from './components/matrix-dungeon/matrix-dungeon';
import MatrixSquare from './components/matrix-square/matrix-square';

function App() {
  return (
    <div className='app'>
      <div className='image'></div>
      <MatrixDungeon />
    </div>
  );
}

export default App;
