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
  isExpanded: boolean;
  isEditing: boolean;
  isRemoved?: boolean;
}

const initialState = (): ITodo[] => {
  const serializedTodos = localStorage.getItem('todos');
  const mock = `
  "[
    {
      \"id\": \"99aab367-b5b0-432f-ac73-6087d06853ac\",
      \"parentId\": \"root\",
      \"level\": 0,
      \"text\": \"TODO app\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"9025fa11-6f41-44b5-bc88-862200892809\",
      \"parentId\": \"99aab367-b5b0-432f-ac73-6087d06853ac\",
      \"level\": 1,
      \"text\": \"Editor\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"caeb06e5-aefc-4a31-b22a-8af9f27fadc7\",
      \"parentId\": \"9025fa11-6f41-44b5-bc88-862200892809\",
      \"level\": 2,
      \"text\": \"Fix keyboard event handlers putting the entered key into the input field\",
      \"isEditing\": false,
      \"isExpanded\": true,
      \"status\": \"completed\"
    },
    {
      \"id\": \"0326e074-29ac-4273-958f-0af26063ba01\",
      \"parentId\": \"99aab367-b5b0-432f-ac73-6087d06853ac\",
      \"level\": 1,
      \"text\": \"UI\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"9a0a516a-44ec-4b13-b085-2d4138fdae1b\",
      \"parentId\": \"0326e074-29ac-4273-958f-0af26063ba01\",
      \"level\": 2,
      \"text\": \"Keyboard shortcuts\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"438ba402-d1eb-44e3-a1df-6a8985d32d74\",
      \"parentId\": \"e0a3a486-21e4-42e7-a540-06cc225a8d53\",
      \"level\": 3,
      \"text\": \"Collapse on ArrowLeft, Expand on ArrowRight\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"0751ad9d-2c66-40ba-8714-80567c34cbeb\",
      \"parentId\": \"9a0a516a-44ec-4b13-b085-2d4138fdae1b\",
      \"level\": 3,
      \"text\": \"Move with Alt + Up/Down\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"cf2e6ae8-6352-46b7-a26d-6f4610204cfd\",
      \"parentId\": \"9a0a516a-44ec-4b13-b085-2d4138fdae1b\",
      \"level\": 3,
      \"text\": \"Change status with W\",
      \"isEditing\": false,
      \"isExpanded\": true,
      \"status\": \"completed\"
    },
    {
      \"id\": \"f1174e02-bdef-45d4-9eef-98c84afa299d\",
      \"parentId\": \"0326e074-29ac-4273-958f-0af26063ba01\",
      \"level\": 2,
      \"text\": \"CSS\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"e0a3a486-21e4-42e7-a540-06cc225a8d53\",
      \"parentId\": \"0326e074-29ac-4273-958f-0af26063ba01\",
      \"level\": 2,
      \"text\": \"UI Slice\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"eecc5512-9a0f-463c-8ee0-951199064ac4\",
      \"parentId\": \"e0a3a486-21e4-42e7-a540-06cc225a8d53\",
      \"level\": 3,
      \"text\": \"Currently selected, edited, dragged, etc.\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"4a437503-9e2a-4d05-a505-93b88318c132\",
      \"parentId\": \"99aab367-b5b0-432f-ac73-6087d06853ac\",
      \"level\": 1,
      \"text\": \"Expand/collapse todos\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"40c02626-bdd8-4da6-9b8c-89ed90931bcd\",
      \"parentId\": \"99aab367-b5b0-432f-ac73-6087d06853ac\",
      \"level\": 1,
      \"text\": \"Fix move action: If appending to a node with children, add as a first child instead\",
      \"isEditing\": false,
      \"isExpanded\": true
    },
    {
      \"id\": \"3c823768-b2f5-4f29-b0c7-200671539e52\",
      \"parentId\": \"40c02626-bdd8-4da6-9b8c-89ed90931bcd\",
      \"level\": 1,
      \"text\": \"Move with children if collapsed\",
      \"isEditing\": false,
      \"isExpanded\": true
    }
  ]"    
`
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
    move: (state, action: PayloadAction<{ todoId: string, prevId?: string, nextId?: string, parentId?: string, hostId: string, type: DropAreas }>) => {
      const { todoId, prevId, nextId, parentId, hostId, type } = action.payload;
      const todoIndex = state.findIndex(todo => todo.id === todoId);
      if (todoIndex < 0) return;
      const todo = state[todoIndex];
      state.splice(todoIndex, 1);
      let newIndex = state.findIndex(todo => todo.id === hostId);
      const host = state[newIndex];
      if (type === DropAreas.after || type === DropAreas.to) newIndex += 1;
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
      if (type === DropAreas.after) {
        for (let i = newIndex; i < state.length; i++) {
          const cur = state[i];
          if (cur.level > todo.level) {
            newIndex += 1;
          } else {
            break;
          }
        }
      }

      todo.level = type === DropAreas.to ? host.level + 1 : host.level;
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
    }
  },
});

export const { add, remove, move, edit, toggleStatus } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todos.filter(todo => !todo.isRemoved);

export default todoSlice.reducer;