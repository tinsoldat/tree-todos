import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { RootState } from "../../app/store";
import { DropAreas } from "./Todos";

const ADD_TO_END = false; //TODO add as an option

export interface ITodo {
  id: string;
  parentId: string;
  level: number;
  text: string;
  status?: 'completed' | 'active';
  isCollapsed: boolean;
  isEditing: boolean;
  isHidden: boolean;
}

const initialState = (): ITodo[] => {
  const serializedTodos = localStorage.getItem('todos');
  const mock = '[]';
  return JSON.parse(serializedTodos || mock);
}

export const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<{ parentId: string }>) => {
      const { parentId } = action.payload;
      const newTodo: ITodo = {
        id: uuidv4(),
        parentId,
        level: 0,
        text: '',
        isEditing: true,
        isCollapsed: false,
        isHidden: false,
      };

      if (parentId === 'root') {
        state.push(newTodo);
        return;
      }

      const parentIndex = state.findIndex(todo => todo.id === parentId);
      const level = state[parentIndex].level + 1;
      newTodo.level = level;
      let index: number;
      if (ADD_TO_END) {
        //FIXME
        index = state.findIndex((todo, i) => (i > parentIndex && todo.level < level) || i === state.length) + 1;
      } else {
        index = parentIndex + 1;
      }
      state.splice(index, 0, newTodo);
    },
    remove: (state, action: PayloadAction<{ todoId: string }>) => {
      const todoIndex = state.findIndex(todo => todo.id === action.payload.todoId);
      const todo = state[todoIndex];
      descendantsOf(todo, state).forEach(cur => cur.level -= 1);

      state.splice(todoIndex, 1);
    },
    move: (state, action: PayloadAction<{ todoId: string, hostId: string, type: DropAreas }>) => {
      const { todoId, hostId, type } = action.payload;
      const todoIndex = state.findIndex(todo => todo.id === todoId);
      if (todoIndex < 0) return;
      const todo = state[todoIndex];

      descendantsOf(todo, state).forEach(cur => cur.level -= 1);

      state.splice(todoIndex, 1);//remove self

      let newIndex = state.findIndex(todo => todo.id === hostId);
      const host = state[newIndex];
      if (type === DropAreas.after || type === DropAreas.to) newIndex += 1;
      //calculate new indent level
      todo.level = type === DropAreas.to
        || (type === DropAreas.after && state[newIndex + 1].level > host.level)
        ? host.level + 1 : host.level;

      state.splice(newIndex, 0, todo);//insert back
    },
    edit: (state, action: PayloadAction<{ todoId: string, text?: string }>) => {
      const { todoId, text } = action.payload;
      const todo = state.find(todo => todo.id === todoId);
      if (!todo) return;
      if (!todo.isEditing) {
        todo.isEditing = true;
        return;
      }
      todo.text = text || todo.text;
      todo.isEditing = false;
    },
    toggleStatus: (state, action: PayloadAction<{ todoId: string }>) => {
      const todo = state.find(todo => todo.id === action.payload.todoId);
      if (!todo) return state;
      let status = todo.status;
      switch (status) {
        case 'active':
          status = 'completed';
          break;
        case undefined:
          status = 'active';
          break;
        case 'completed':
          status = undefined;
          break
        default:
          break;
      }
      todo.status = status;
    },
    toggleCollapsed: (state, action: PayloadAction<{ todoId: string }>) => {
      const index = state.findIndex(todo => todo.id === action.payload.todoId);
      const todo = state[index];
      todo.isCollapsed = !todo.isCollapsed;

      let temp = Number.MAX_SAFE_INTEGER;
      descendantsOf(todo, state).filter(cur => {
        if (cur.level > temp) return false;
        if (cur.isCollapsed) temp = cur.level;
        else temp = Number.MAX_SAFE_INTEGER;
        
        return true;
      }).forEach(cur => cur.isHidden = todo.isCollapsed);
    }
  },
});

export const { add, remove, move, edit, toggleStatus, toggleCollapsed } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todos;

export default todoSlice.reducer;

const descendantsOf = (todo: ITodo, state: ITodo[]) => {
  const res = [];
  //TODO get index from call?
  const index = state.findIndex(cur => cur.id === todo.id);

  for (let i = index + 1; state.length > i; i++) {
    const cur = state[i];
    if (cur.level > todo.level) {
      res.push(cur);
    } else {
      break;
    }
  }
  return res;
}