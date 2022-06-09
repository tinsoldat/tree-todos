import React, { FC, useEffect, FormEventHandler, KeyboardEventHandler } from 'react';

import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { add, toggleStatus, ITodo, remove, move, edit, selectTodos } from "./todoSlice";
import './Todos.sass';
import classNames from 'classnames';

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

  const dragger = <button className="todo__btn draggable" draggable onDragStart={e => {
    e.dataTransfer.setData('text/plain', id);
    const self = e.target as HTMLButtonElement;
    const parent = self.parentElement as HTMLDivElement;
    document.querySelector('.dragged')?.classList.remove('dragged');
    parent.classList.add('dragged');
    const offsetX = e.clientX - parent.offsetLeft;
    const offsetY = e.clientY - parent.offsetTop;
    e.dataTransfer.setDragImage(parent, offsetX, offsetY);
    e.dataTransfer.dropEffect = 'move';
  }}>☰</button>

  return (
    <div
      className={classNames('todo', status, { 'selected': isSelected })}
      id={id}
      data-level={level}
      onDrop={e => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const todoId = e.dataTransfer.getData('text/plain');
        if (todoId === id) return;
        const options: Parameters<typeof move>[0] = { todoId };
        //FIXME get rid of hardcoded values
        let append: 'before' | 'after' | 'to';
        
        if (target.classList.contains('before')) append = 'before';
        else if (target.classList.contains('after')) append = 'after';
        else append = 'to';
        target.classList.remove('target', 'before', 'after', 'to');
        //if the host node has children, add to it as a child, hook on isExpanded later
        if (target.nextElementSibling?.getAttribute('data-level') || -1 > level) append = 'to';
        switch (append) {
          case 'before':
            options.prevId = id;
            break;
          case 'after':
            options.nextId = id;
            break;
          case 'to':
            options.parentId = id;
            break;
          default:
            return;
        }

        dispatch(move(options));
      }}
      onDragOver={e => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('dragged')) return;
        e.preventDefault();
        const ratio = (e.clientY - target.offsetTop) / target.clientHeight;
        let append: 'before' | 'after' | 'to';
        if (ratio < .15) append = 'before';
        else if (ratio > .85) append = 'after';
        else append = 'to';
        target.classList.remove('before', 'after', 'to');
        target.classList.add(append);
      }}
      onDragEnter={e => { const target = e.target as HTMLElement; target.classList.add('target') }}
      onDragLeave={e => { const target = e.target as HTMLElement; target.classList.remove('target', 'before', 'after', 'to') }}
    >
      {dragger}
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
