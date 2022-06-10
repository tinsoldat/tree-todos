import { FC, useEffect, FormEventHandler, KeyboardEventHandler } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { ITodo, edit, remove } from "../todoSlice";

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
