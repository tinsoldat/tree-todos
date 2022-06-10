import { DragEvent, FC } from 'react';

import { useAppDispatch } from "../../../app/hooks";
import { add, toggleStatus, ITodo, remove, edit, move } from "../todoSlice";
import './Todos.sass';
import { Editor } from './Editor';
import { DnD } from './Drag';

export enum DropAreas {
  BEFORE = 'before',
  AFTER = 'after',
  TO = 'to',
}

interface Data {
  'data-level': number;
  'data-status': ITodo['status'];
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
    isEditing,
  } = todo;

  const handler = (type: DropAreas, data: DataTransfer) => {
    const options: Parameters<typeof move>[0] = { todoId: id };
    
    const todoId = data.getData('text/plain');
    console.log(todoId, id);
    if (todoId === id) return;

    switch (type) {
      case DropAreas.BEFORE:
        options.prevId = id;
        break;
      case DropAreas.AFTER:
        options.nextId = id;
        break;
      case DropAreas.TO:
        options.parentId = id;
        break;
      default:
        return;
    }
    
    dispatch(move(options));
  }

  const data: Data = {
    'data-level': level,
    'data-status': status,
  }

  return (
    <DnD.Container types={['before', 'after', 'to']} handler={handler}>
      <div className='todo' id={id} {...data}>
        <DnD.Grab id={id} />
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
    </DnD.Container>
  );
}

