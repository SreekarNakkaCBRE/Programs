
import './App.css';
import React from 'react';
import FruitsList from './components/Fruits';

function App() {
  return (
   <div className="App">
    <header className="App-header">
      <h1>Fruit Management App</h1>
    </header>
    <main>
      <FruitsList />
    </main>
   </div>
  );
}

export default App;
