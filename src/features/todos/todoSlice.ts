import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { RootState } from "../../app/store";

const ADD_TO_END = false; //TODO add as an option

export interface ITodo {
  id: string;
  parentId: string;
  level: number;
  text: string;
  status: 'completed' | 'active' | 'none';
  isSelected: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  isRemoved?: boolean;
}

const initialState = (): ITodo[] => {
  const serializedTodos = localStorage.getItem('todos');
  return serializedTodos ? JSON.parse(serializedTodos) : [];
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
        status: "none",
        isSelected: false,
        isEditing: true,
        isExpanded: true,
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
        index = state.findIndex((todo, i) => (i > parentIndex && todo.level < level) || i === state.length) + 1;
      } else {
        index = parentIndex + 1;
      }
      state.splice(index, 0, newTodo);
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
    move: (state, action: PayloadAction<{ todoId: string, prevId?: string, nextId?: string, parentId?: string }>) => {
      const { todoId, prevId, nextId, parentId } = action.payload;
      const todoIndex = state.findIndex(todo => todo.id === todoId);
      if (todoIndex < 0) return;
      const todo = state[todoIndex];
      state.splice(todoIndex, 1);
      let newIndex = state.findIndex(todo => todo.id === (prevId || nextId || parentId));
      const host = state[newIndex];
      if (nextId || parentId) newIndex += 1;
      //decrease the indents of all children
      for (let i = todoIndex; i < state.length; i++) {
        const cur = state[i];
        if (cur.level > todo.level) {
          cur.level -= 1;
        } else {
          break;
        }
      }
      //add after the children if needed
      if (nextId) {
        for (let i = newIndex; i < state.length; i++) {
          const cur = state[i];
          if (cur.level > todo.level) {
            newIndex += 1;
          } else {
            break;
          }
        }
      }

      todo.level = parentId ? host.level + 1 : host.level;
      state.splice(newIndex, 0, todo);
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

export const { add, remove, move, edit, toggleStatus } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todos.filter(todo => !todo.isRemoved);

export default todoSlice.reducer;