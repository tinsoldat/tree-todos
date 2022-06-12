import React, { FC, useEffect, FormEventHandler, KeyboardEventHandler, useState, DragEvent } from 'react';

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
  drop?: DropAreas;
}

export enum DropAreas {
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
  // const [selected, setSelected] = useState(false);
  const [drop, setDrop] = useState<DropAreas>();
  const dispatch = useAppDispatch();

  const data: TodoData = {
    status,
    level,
    selected: false,
    drop,
  }

  const dragAndDropHandlers = {
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDrop(undefined);

      const todoId = e.dataTransfer.getData('text/plain');
      if (todoId === id) return;

      dispatch(move({ todoId, hostId: id, type: drop || DropAreas.to }));
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();

      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = y / target.clientHeight;

      //TODO get rid of magic numbers, connect to CSS
      let append: DropAreas;
      if (ratio < .15) append = DropAreas.before
      else if (ratio > .85) append = DropAreas.after
      else append = DropAreas.to

      setDrop(append);
    },
    onDragLeave: (e: DragEvent) => setDrop(undefined),
    onDragEnd: (e: DragEvent) => setDrop(undefined),
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
      {...dragAndDropHandlers}
      onClick={e => { const target = e.target as HTMLDivElement; target.focus(); }}
      onKeyDown={e => {
        const target = e.target as HTMLDivElement;
        if (e.currentTarget !== target) return;
        let prevent = true;
        switch (e.key) {
          case 'ArrowDown':
            e?.preventDefault();
            const next = target.nextElementSibling as HTMLDivElement;
            next?.focus();
            break;
          case 'ArrowUp':
            e?.preventDefault();
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
          case 'w':
            dispatch(toggleStatus({ todoId: id }));
            break;
          default:
            prevent = false;
            break;
        }
        if (prevent) e.preventDefault();
      }}
    >
      {dragger}
      {(status === 'completed' ? '✔' : status === 'active' ? '➡' : '')}

      {isEditing
        ? <Editor key='editor' id={id} text={text} />
        : <div className="todo__text">{text}</div>
      }
      <div className="todo__controls">
        <button className="todo__btn" onClick={() => dispatch(edit({ todoId: id }))}>✎</button>
        <button className='todo__btn' onClick={() => dispatch(remove({ todoId: id }))}>−</button>
        <button className='todo__btn' onClick={() => dispatch(add({ parentId: id }))}>+</button>
        <button className='todo__btn' onClick={() => dispatch(toggleStatus({ todoId: id }))}>{
          status === 'completed' ? '✘' : status === 'active' ? '✔' : '👁'
        }</button>
      </div>
      <div className="todo__pointer"></div>
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
    //@ts-ignore
    e.target.parentElement.parentElement.focus();
    const data = new FormData(e.target as HTMLFormElement);
    const text = data.get('text') as string;
    text && dispatch(edit({ todoId: id, text }));
  }

  const escHandler: KeyboardEventHandler = e => {
    const input = e.target as HTMLInputElement;

    if (e.key === 'Escape') {
      //@ts-ignore
      input.parentElement.parentElement.parentElement?.focus();
      if (input.value)
        dispatch(edit({ todoId: id, text }));
      else
        dispatch(remove({ todoId: id }));
    }
  }

  return (
    <div className='editor'>
      <form className='editor__form' action="/" autoComplete='off' onSubmit={submitHandler}>
        <input className='editor__text' autoFocus type='text' name="text" id="editor__text" placeholder={text} defaultValue={text} onKeyUp={escHandler} />
      </form>
    </div>
  );
}
