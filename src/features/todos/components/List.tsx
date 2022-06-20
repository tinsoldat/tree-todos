import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Todo } from "./Todo";
import { selectTodos, add } from "../todoSlice";
import '../Todos.sass';

export const List = () => {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  //save to local storage on page refresh/close
  useEffect(() => {
    function saveTodos() {
      const serializedTodos = JSON.stringify(todos);
      localStorage.setItem('todos', serializedTodos);
    }
    window.addEventListener('beforeunload', saveTodos);
    return () => window.removeEventListener('beforeunload', saveTodos);
  });
  //set max level for indent calculation
  const levels = todos.reduce((max, cur) => cur.level > max ? max = cur.level : max, 0);
  document.documentElement.style.setProperty('--levels', levels.toString());

  return (
    <div className='todos'>
      <div className="todos__list list">
        {todos.map(todo => <Todo key={todo.id} todo={todo} />)}
      </div>
      <button className='todo__btn' onClick={() => dispatch(add({ parentId: 'root' }))}>+</button>
    </div>
  );
}