import React, { FC, CSSProperties, useEffect, useState, FormEventHandler, KeyboardEventHandler } from 'react';

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { add, toggleStatus, ITodo, remove, selectTodos } from "./todoSlice";
import './Todos.sass';

export const List = () => {

  const todos = useAppSelector(selectTodos);
  const [toAddTo, setToAddTo] = useState('root');
  //save todos in local storage on page refresh/close
  useEffect(() => {
    function saveTodos() {
      const serializedTodos = JSON.stringify(todos);
      localStorage.setItem('todos', serializedTodos);
    }
    window.addEventListener('beforeunload', saveTodos);

    return () => {
      window.removeEventListener('beforeunload', saveTodos);
    }
  });

  function toggleEditor(todoId?: string) {
    if (todoId) {
      setToAddTo(todoId);
    } else {
      setToAddTo('root');
    }
  }

  return (
    <div className='todos'>
      <Editor parentId='root' level={0} toggleEditor={toggleEditor} />
      <div className="todos__list list">
        {todos.map(todo =>
          <>
            <Todo key={todo.id} todo={todo} toggleEditor={toggleEditor} />
            {todo.id === toAddTo && <Editor key='editor' parentId={toAddTo} level={todo.level + 1} toggleEditor={toggleEditor} />}
          </>
        )}
      </div>
    </div>
  );
}

interface TodoProps {
  todo: ITodo;
  toggleEditor: (todoId?: string) => void;
}

export const Todo: FC<TodoProps> = ({ todo: {
  id,
  level,
  color,
  text,
  status,
  isSelected,
}, toggleEditor: openEditor }) => {
  const dispatch = useAppDispatch();

  return (
    <div className='todo list__todo' data-level={level} style={{ '--tree-color': color ?? '', '--level': level } as CSSProperties}>
      <div className="todo__text">
        {(status === 'completed' ? '✔' : status === 'active' ? '➡' : '')}
        {text}
      </div>
      <div className="todo__controls">
        <button className='todo__btn' onClick={() => dispatch(remove({ todoId: id }))}>−</button>
        <button className='todo__btn' onClick={() => openEditor(id)}>+</button>
        <button className='todo__btn' onClick={() => dispatch(toggleStatus({ todoId: id }))}>{
          status === 'completed' ? '✘' : status === 'active' ? '✔' : '👁'
        }</button>
      </div>
    </div>
  );
}

interface EditorProps {
  parentId: string;
  level: number;
  toggleEditor: (todoId?: string) => void;
}

export const Editor: FC<EditorProps> = ({ parentId, level, toggleEditor }) => {
  const dispatch = useAppDispatch();
  const levels = useAppSelector(selectTodos).reduce((acc, cur) => cur.level > acc ? acc = cur.level : acc, 0);

  useEffect(() => {
    const el = document.querySelectorAll('#new-todo')[1] as HTMLElement;
    el?.focus();
    document.documentElement.style.setProperty('--levels', levels.toString()); //FIXME why is it done here?
  })

  const submitHandler: FormEventHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const text = data.get('text') as string;
    text && dispatch(add({ text, parentId }));
    toggleEditor();
  }

  const blur: KeyboardEventHandler = e => {
    if (e.key === 'Escape') {
      const target = e.target as HTMLElement; target.blur();
      toggleEditor();
    }
  }

  return (
    <div className='editor' style={{ '--level': level.toString() } as CSSProperties}>
      <form className='editor__form' action="/" autoComplete='off' onSubmit={submitHandler}>
        <input className='editor__text' type='text' name="text" id="new-todo" placeholder={parentId} onKeyDown={blur} />
      </form>
    </div>
  );
}
