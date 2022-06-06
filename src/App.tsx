import React from 'react';
import { Counter } from './features/counter/Counter';
import './App.css';
import { List } from './features/todos/Todos';

function App() {

  return (
    <div className="App">
        <Counter />
        <List />
    </div>
  );
}

export default App;
