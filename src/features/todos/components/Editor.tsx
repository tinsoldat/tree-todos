import { FC, FormEventHandler, KeyboardEventHandler } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { ITodo, edit, remove } from "../todoSlice";

interface EditorProps {
  id: ITodo['id'];
  text: ITodo['text'];
}

export const Editor: FC<EditorProps> = ({ id, text }) => {
  const dispatch = useAppDispatch();

  const submitHandler: FormEventHandler = (e) => {
    e.preventDefault();
    //FIXME
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