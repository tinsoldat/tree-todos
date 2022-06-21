import { DragEventHandler, FC, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { Editor } from "./Editor";
import { ITodo, move, toggleCollapsed, add, edit, remove, toggleStatus } from "../todoSlice";

interface TodoProps {
  todo: ITodo;
}

interface TodoData {
  status: ITodo['status'];
  level: ITodo['level'];
  drop?: DropAreas;
  collapsed?: string;
  hide?: string;
}

export enum DropAreas {
  before = 'before',
  after = 'after',
  to = 'to',
}

export const Todo: FC<TodoProps> = ({
  todo: {
    id,
    level,
    text,
    status,
    isEditing,
    isCollapsed,
    isHidden,
  }
}) => {
  const dispatch = useAppDispatch();
  const [drop, setDrop] = useState<DropAreas>();
  
  const data: TodoData = {
    status,
    level,
    drop,
    collapsed: isCollapsed ? '' : undefined,
    hide: isHidden ? '' : undefined,
  }

  const dragAndDropHandlers: Record<string, DragEventHandler> = {
    onDrop: (e) => {
      e.preventDefault();
      setDrop(undefined);

      const todoId = e.dataTransfer.getData('text/plain');
      if (todoId === id) return;

      dispatch(move({ todoId, hostId: id, type: drop || DropAreas.to }));
    },
    onDragOver: (e) => {
      e.preventDefault();

      const target = e.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = y / target.clientHeight;

      //TODO get rid of magic numbers, bind to CSS
      let drop: DropAreas;
      if (ratio < .15) drop = DropAreas.before
      else if (ratio > .85) drop = DropAreas.after
      else drop = DropAreas.to

      setDrop(drop);
    },
    onDragLeave: () => setDrop(undefined),
    onDragEnd: () => setDrop(undefined),
  }

  return (
    <div
      className='todo'
      tabIndex={0}
      {...data}
      {...dragAndDropHandlers}
      onClick={e => { const target = e.target as HTMLDivElement; target.focus(); }}
      onKeyDown={(e) => {
        let prevent = true;
        switch (e.key) {
          case 'ArrowDown':
            //TODO
            // focusNext();
            break;
          case 'ArrowUp':
            //TODO
            // focusPrev();
            break;
          case 'ArrowLeft':
            if (!isCollapsed) dispatch(toggleCollapsed({ todoId: id }));
            //TODO else select parent
            break;
          case 'ArrowRight':
            if (isCollapsed) dispatch(toggleCollapsed({ todoId: id }));
            //TODO else select first child or do nothing
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
      <div className="draggable" draggable
        onDragStart={e => {
          e.dataTransfer.setData('text/plain', id);
          const self = e.target as HTMLButtonElement;
          const parent = self.parentElement as HTMLDivElement;
          const offsetX = e.clientX - parent.offsetLeft;
          const offsetY = e.clientY - parent.offsetTop;
          e.dataTransfer.setDragImage(parent, offsetX, offsetY);
          e.dataTransfer.dropEffect = 'move';
        }}>
        ☰
      </div>
      {(status === 'completed' ? '✔' : status === 'active' ? '➡' : '')}

      {isEditing
        ? <Editor key='editor todo__text' id={id} text={text} />
        : <div className="todo__text">{text}</div>
      }

      <div className="todo__controls">
        <button className="todo__btn" onClick={() => dispatch(edit({ todoId: id }))}>✎</button>
        <button className='todo__btn' onClick={() => dispatch(toggleStatus({ todoId: id }))}>{
          status === 'completed' ? '✘' : status === 'active' ? '✔' : '👁'
        }</button>
        <button className='todo__btn' onClick={() => dispatch(remove({ todoId: id }))}>−</button>
        <button className='todo__btn' onClick={() => dispatch(add({ parentId: id }))}>+</button>
        <button className="todo__btn" onClick={() => dispatch(toggleCollapsed({ todoId: id }))}>{isCollapsed ? '▼' : '—'}</button>
      </div>
      <div className="todo__pointer"></div>
    </div>
  );
}