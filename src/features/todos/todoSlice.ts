import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { RootState } from "../../app/store";
import { DropAreas } from "./components/Todo";

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
  const mock = `
  [{"id":"4a118737-8b0e-4ee9-9cd5-9c29186fc8b5","parentId":"0a95d34b-1c7d-4013-a1be-8c08b2d775d3","level":0,"text":"Basic todo list","isEditing":false,"isCollapsed":false,"isHidden":false,"status":"completed"},{"id":"2326d2bf-7cae-4cd6-8fd8-5b8bd269e93b","parentId":"0a95d34b-1c7d-4013-a1be-8c08b2d775d3","level":0,"text":"Only allow one editor","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"e9a8ce7a-b00f-40de-abd8-77ce78428cf5","parentId":"0a95d34b-1c7d-4013-a1be-8c08b2d775d3","level":0,"text":"Features","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"b02876f4-2357-43ea-8b6f-80c46472bb4b","parentId":"0a95d34b-1c7d-4013-a1be-8c08b2d775d3","level":1,"text":"Collapse/Expand","isEditing":false,"isCollapsed":false,"isHidden":false,"status":"completed"},{"id":"d97fa32c-e42a-475c-b945-f15f28a5d9dd","parentId":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","level":2,"text":"Show children number","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"3644e6af-89f5-4782-a8ad-116f3bd4f8cf","parentId":"29e8d986-42f2-44c0-b7f3-81a7bbeefd1e","level":3,"text":"how? w/ hasChildren: number?","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"18c214ce-00ad-45d5-a3de-ecf4ffb2451c","parentId":"e9a8ce7a-b00f-40de-abd8-77ce78428cf5","level":1,"text":"Move todos","isEditing":false,"isCollapsed":false,"isHidden":false,"status":"completed"},{"id":"77cd7062-cc1b-4b62-8ad2-9be6aa89bf54","parentId":"0a95d34b-1c7d-4013-a1be-8c08b2d775d3","level":2,"text":"Move with children if collapsed","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"d273d350-16b2-4141-9abf-e99524726724","parentId":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","level":2,"text":"Add new todos after the last child","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","parentId":"0a95d34b-1c7d-4013-a1be-8c08b2d775d3","level":0,"text":"View","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"1a83ec26-b6f8-4ea9-925a-54636cb4fe10","parentId":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","level":1,"text":"Animations w/ thunk?","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"c25c9e7a-69c1-44f6-b8f4-61df86c0bd18","parentId":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","level":1,"text":"CSS","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"436c3eba-a6a9-4ad2-b468-80f2ba38e967","parentId":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","level":1,"text":"Help/about panel","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"3fe3b605-f6ee-4600-8fc1-77fe556b231b","parentId":"0f10f91f-dcfb-46aa-8da1-75e1a559ca99","level":1,"text":"Keyboard shortcuts","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"042e9375-1a16-475b-9682-89b047acf4df","parentId":"3fe3b605-f6ee-4600-8fc1-77fe556b231b","level":2,"text":"Arrow navigation","isEditing":false,"isCollapsed":true,"isHidden":false},{"id":"bd71c68d-ca1d-45cf-aa03-d964116dcf59","parentId":"042e9375-1a16-475b-9682-89b047acf4df","level":3,"text":"Skip hidden elements","isEditing":false,"isCollapsed":false,"isHidden":true},{"id":"d9b6bf24-991b-491f-a93f-543bc483d114","parentId":"042e9375-1a16-475b-9682-89b047acf4df","level":3,"text":"Collapse on ArrowLeft, expand on ArrowRight","isEditing":false,"isCollapsed":false,"isHidden":true},{"id":"d39e0214-b37a-4dab-b1af-a3e5431cb379","parentId":"042e9375-1a16-475b-9682-89b047acf4df","level":3,"text":"Select parent on ArrowLeft if no chlidren or isCollapsed","isEditing":false,"isCollapsed":false,"isHidden":true},{"id":"93d20227-78fc-4226-8d94-88fd8329f979","parentId":"3fe3b605-f6ee-4600-8fc1-77fe556b231b","level":2,"text":"Move todos with Alt + Up/Down","isEditing":false,"isCollapsed":false,"isHidden":false},{"id":"c5ef15c6-ebb3-40ea-bce9-9a5a88624c00","parentId":"3fe3b605-f6ee-4600-8fc1-77fe556b231b","level":2,"text":"Change status with w","isEditing":false,"isCollapsed":false,"isHidden":false}]
  `;
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