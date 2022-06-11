import React, { FC, useEffect, FormEventHandler, KeyboardEventHandler, useState } from 'react';

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { add, toggleStatus, ITodo, remove, move, edit, selectTodos } from "./todoSlice";
import './Todos.sass';

export const List = () => {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  //save to local storage on page refresh/close
  useEffect(() => {
    function saveTodos() {
      const serializedTodos = JSON.stringify(todos.filter(todo => !todo.isRemoved));
      localStorage.setItem('todos', serializedTodos);
    }
    window.addEventListener('beforeunload', saveTodos);
    return () => window.removeEventListener('beforeunload', saveTodos);
  });
  //set max level for indent calculation
  const levels = todos.reduce((max, cur) => !cur.isRemoved && cur.level > max ? max = cur.level : max, 0);
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

interface TodoProps {
  todo: ITodo;
}

interface TodoData {
  status: ITodo['status'];
  level: ITodo['level'];
  selected: boolean;
  drop: DropAreas | undefined;
}

enum DropAreas {
  before = 'before', after = 'after', to = 'to'
}

export const Todo: FC<TodoProps> = ({
  todo: {
    id,
    level,
    text,
    status,
    isEditing,
  }
}) => {
  const [selected, setSelected] = useState(false);
  const [drop, setDrop] = useState<DropAreas>();
  const dispatch = useAppDispatch();

  const data: TodoData = {
    status,
    level,
    selected,
    drop,
  }

  const dragger = <div className="draggable" draggable onDragStart={e => {
    e.dataTransfer.setData('text/plain', id);
    const self = e.target as HTMLButtonElement;
    const parent = self.parentElement as HTMLDivElement;
    const offsetX = e.clientX - parent.offsetLeft;
    const offsetY = e.clientY - parent.offsetTop;
    e.dataTransfer.setDragImage(parent, offsetX, offsetY);
    e.dataTransfer.dropEffect = 'move';
  }}>☰</div>

  return (
    <div
      className='todo'
      tabIndex={0}
      {...data}
      onDrop={e => {
        e.preventDefault();
        setSelected(false);
        setDrop(undefined);

        const todoId = e.dataTransfer.getData('text/plain');
        if (todoId === id) return;

        const options: Parameters<typeof move>[0] = { todoId };

        switch (drop) {
          case DropAreas.before:
            options.prevId = id;
            break;
          case DropAreas.after:
            options.nextId = id;
            break;
          case DropAreas.to:
            options.parentId = id;
            break;
          default:
            return;
        }

        dispatch(move(options));
      }}
      onDragOver={e => {
        e.preventDefault();

        const target = e.target as HTMLElement;
        const ratio = (e.clientY - target.offsetTop) / target.clientHeight;

        let append: DropAreas;
        if (ratio < .33) append = DropAreas.before;
        else if (ratio > .67) append = DropAreas.after;
        else append = DropAreas.to;

        setDrop(append);
      }}
      onDragEnter={e => !selected && setSelected(true)}
      onDragLeave={e => { setSelected(false); setDrop(undefined) }}
      onDragEnd={e => { setSelected(false); setDrop(undefined) }}
      onClick={e => { const target = e.target as HTMLDivElement; target.focus(); }}
      onKeyDown={e => {
        const target = e.target as HTMLDivElement;
        if (e.currentTarget !== target) return;
        switch (e.key) {
          case 'ArrowDown':
            const next = target.nextElementSibling as HTMLDivElement;
            next?.focus();
            break;
          case 'ArrowUp':
            const prev = target.previousElementSibling as HTMLDivElement;
            prev?.focus();
            break;
          case 'ArrowLeft':
            //TODO Collapse
            break;
          case 'ArrowRight':
            //TODO Expand
            break;
          case 'n':
            dispatch(add({ parentId: id }));
            break;
          case 'e':
            dispatch(edit({ todoId: id }));
            break;
          case 'd':
            dispatch(remove({ todoId: id }));
            break;
          default:
            break;
        }
      }}
    >
      {dragger}
      <div className="todo__text">
        {(status === 'completed' ? '✔' : status === 'active' ? '➡' : '')}
        {isEditing
          ? <Editor key='editor' id={id} text={text} />
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
  id: ITodo['id'];
  text: ITodo['text'];
}

export const Editor: FC<EditorProps> = ({ id, text }) => {
  const dispatch = useAppDispatch();

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
    }
  }

  return (
    <div className='editor'>
      <form className='editor__form' action="/" autoComplete='off' onSubmit={submitHandler}>
        <input className='editor__text' autoFocus type='text' name="text" id="editor__text" placeholder={text} defaultValue={text} onKeyDown={escHandler} />
      </form>
    </div>
  );
}
