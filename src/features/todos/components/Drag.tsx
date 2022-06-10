import React, { DragEventHandler, FC, ReactNode, useState } from 'react'

interface DragGrabProps {
  id: string;
}

const Grab: FC<DragGrabProps> = ({ id }) => {
  return (
    <div className="todo__btn draggable" draggable onDragStart={e => {
      console.log(id);

      e.dataTransfer.setData('text/plain', id);
      const self = e.target as HTMLElement;
      const parent = self.parentElement as HTMLElement;
      const offsetX = e.clientX - parent.offsetLeft;
      const offsetY = e.clientY - parent.offsetTop;
      e.dataTransfer.setDragImage(parent, offsetX, offsetY);
    }}>☰</div>
  )
}

interface ContainerProps {
  children: ReactNode;
  types: string[];
  handler: (type: any, data: DataTransfer) => void;
}

const Container: FC<ContainerProps> = ({ children, types, handler }) => {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div className="draggable__container"
      data-selected={isSelected}
      onDragEnter={() => setIsSelected(true)}
      // onDragLeave={() => setIsSelected(false)}
      onDragEnd={() => setIsSelected(false)}
    >
      {children}
      <div className="drop-areas">
        {types.map(type => <DropArea key={type} type={type} handler={handler} setIsSelected={setIsSelected} />)}
      </div>
    </div>
  )
}

interface DropAreaProps {
  type: unknown;
  handler: (type: unknown, data: DataTransfer) => void;
  setIsSelected: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropArea: FC<DropAreaProps> = ({ setIsSelected, type, handler }) => {

  const dropHandler: DragEventHandler = (e) => {
    e.preventDefault();
    setIsSelected(false);
    handler(type, e.dataTransfer);
  }

  const dragOverHandler: DragEventHandler = (e) => {
    e.preventDefault();
  }

  return (
    <div
      className={'drag-area ' + type}
      onDrop={dropHandler}
      onDragOver={dragOverHandler}
    />
  )
}

export const DnD = { Container, DropArea, Grab }