import React, { FC, CSSProperties, useEffect, FormEventHandler, KeyboardEventHandler } from 'react';

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { add, toggleStatus, ITodo, remove, edit, selectTodos } from "./todoSlice";
import './Todos.sass';
import classNames from 'classnames';

export const List = () => {

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
  //FIXME why is it done here?
  //set max level for indent calculation
  const levels = todos.reduce((acc, cur) => cur.level > acc ? acc = cur.level : acc, 0);
  document.documentElement.style.setProperty('--levels', levels.toString());
  return (
    <div className='todos'>
      <div className="todos__list list">
        {todos.map(todo => <Todo key={todo.id} todo={todo} />)}
      </div>
    </div>
  );
}

interface TodoProps {
  todo: ITodo;
}

export const Todo: FC<TodoProps> = ({ todo }) => {
  const dispatch = useAppDispatch();
  const {
    id,
    level,
    text,
    status,
    isSelected,
    isEditing,
  } = todo;
  const className = classNames(
    'todo',
    { 'selected': isSelected }
  );

  return (
    <div className={className} data-level={level} style={{ '--level': level } as CSSProperties}>
      <div className="todo__text">
        {(status === 'completed' ? '✔' : status === 'active' ? '➡' : '')}
        {isEditing
        ? <Editor key='editor' todo={todo} />
      : text}
      </div>
      <div className="todo__controls">
        <button className="todo__btn" onClick={() => dispatch(edit({ todoId: id }))}>✎</button>
        <button className='todo__btn' onClick={() => dispatch(remove({ todoId: id }))}>−</button>
        <button className='todo__btn' onClick={() => dispatch(add({ parentId: id }))}>+</button>
        <button className='todo__btn' onClick={() => dispatch(toggleStatus({ todoId: id }))}>{
          status === 'completed' ? '✘' : status === 'active' ? '✔' : '👁'
        }</button>
      </div>
    </div>
  );
}

interface EditorProps {
  todo: ITodo;
}

export const Editor: FC<EditorProps> = ({ todo: { id, text } }) => {
  const dispatch = useAppDispatch();
  //focus on self 
  useEffect(() => {
    const el = document.querySelector('#editor__text') as HTMLElement;
    el?.focus();
  });

  const submitHandler: FormEventHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const text = data.get('text') as string;
    text && dispatch(edit({ todoId: id, text }));
  }

  const escHandler: KeyboardEventHandler = e => {
    const input = e.target as HTMLInputElement;
    if (e.key === 'Escape') {
      if (input.value)
        dispatch(edit({ todoId: id, text }));
      else
        dispatch(remove({ todoId: id }));
      // const target = e.target as HTMLElement;
      // target.blur();
    }
  }

  return (
    <div className='editor'>
      <form className='editor__form' action="/" autoComplete='off' onSubmit={submitHandler}>
        <input className='editor__text' type='text' name="text" id="editor__text" placeholder={text} defaultValue={text} onKeyDown={escHandler} />
      </form>
    </div>
  );
}
