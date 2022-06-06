import React, { FC, CSSProperties, useEffect, useState, FormEventHandler, KeyboardEventHandler } from 'react';

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { add, toggleStatus, ITodo, remove, selectTodos } from "./todoSlice";

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
    <div>
      <Editor parentId='root' level={0} toggleEditor={toggleEditor} />
      {
        todos.map(todo =>
          <>
            <Todo key={todo.id} todo={todo} toggleEditor={toggleEditor} />
            {todo.id === toAddTo && <Editor key='editor' parentId={toAddTo} level={todo.level} toggleEditor={toggleEditor} />}
          </>
        )
      }
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
  let offset = '├';
  for (let index = 0; index < level; index++) {
    offset += '─';
  }

  return (
    <div data-level={level} style={{ '--tree-color': color ?? '', textAlign: 'start' } as CSSProperties}>
      {
        offset + ' ' +
        (status === 'completed' ? '✔' : status === 'active' ? '➡' : '') +
        text + ' '
      }
      <button onClick={() => dispatch(remove({ todoId: id }))}>-</button>
      <button onClick={() => openEditor(id)}>+</button>
      <button onClick={() => dispatch(toggleStatus({ todoId: id }))}>{
        status === 'completed' ? '✘' : status === 'active' ? '✔' : '●'
      }</button>
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

  useEffect(() => {
    const el = document.querySelectorAll('#new-todo')[1] as HTMLElement;
    el?.focus();
  })

  const addTodo = (text: string, parentId: string, level?: number) => {
    dispatch(add({ text, parentId, level: level ?? 0 }));
  }

  const submitHandler: FormEventHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const title = data.get('title') as string;
    title && addTodo(title, parentId, level + 1);
    toggleEditor();
  }

  const blur: KeyboardEventHandler = e => {
    if (e.key === 'Escape') {
      const target = e.target as HTMLElement; target.blur()
      toggleEditor();
    }
  }

  return (
    <div>
      <form action="none" autoComplete='off' onSubmit={submitHandler}>
        <input type='text' name="title" id="new-todo" placeholder={parentId} onKeyDown={blur} />
      </form>
    </div>
  );
}