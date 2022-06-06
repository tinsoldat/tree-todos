import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { RootState } from "../../app/store";

export interface ITodo {
  id: string;
  parentId: string;
  level: number;
  text: string;
  status: 'completed' | 'active' | 'none';
  color?: string;
  isSelected: boolean;
  isExpanded: boolean;
  isRemoved?: boolean;
}

const initialState: ITodo[] = JSON.parse(localStorage.getItem('todos') || '[]');

// (): ITodo[] => {
//   const serializedTodos = localStorage.getItem('todos');
//   return serializedTodos ? JSON.parse(serializedTodos) : [];
// }

export const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<{ text: string, parentId: string, level: number, color?: string }>) => {
      const { text, parentId, level, color } = action.payload;
      const newTodo: ITodo = {
        id: uuidv4(),
        parentId,
        level,
        text,
        status: "none",
        color: color,
        isSelected: false,
        isExpanded: true,
      };
      const parentIndex = state.findIndex(todo => todo.id === parentId);
      const lastChildIndex = state.findIndex((todo, i) => (i > parentIndex && todo.level < level) || i === state.length);
      state.splice(lastChildIndex, 0, newTodo);
    },
    remove: (state, action: PayloadAction<{ todoId: string }>) => {
      const todoIndex = state.findIndex(todo => todo.id === action.payload.todoId);
      const todo = state[todoIndex];
      todo.isRemoved = true;
      //decrease the indents of all the children
      for (let i = todoIndex + 1; i < state.length; i++) {
        const cur = state[i];
        if (todoIndex < 0) break;
        if (cur.level > todo.level) {
          cur.level -= 1;
        } else {
          break;
        }
      }
    },
    toggleStatus: (state, action: PayloadAction<{ todoId: string }>) => {
      const todo = state.find(todo => todo.id === action.payload.todoId);
      if (!todo) return state;
      let status = todo.status;
      switch (status) {
        case 'active':
          status = 'completed';
          break;
        case 'none':
          status = 'active';
          break;
        case 'completed':
          status = 'none';
          break
        default:
          break;
      }
      todo.status = status;
    }
  },
});

export const { add, remove, toggleStatus } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todos.filter(todo => !todo.isRemoved);

export default todoSlice.reducer;