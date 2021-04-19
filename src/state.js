import { useReducer } from "react";

export function useCompositeState(args) {
  const red = (state, action) => {
    //return (state) => ({ ...state, ...action.payload });
    return { ...state, ...action.payload(state) };
  };

  const [state, dispatch] = useReducer(red, { ...args });

  return new Proxy(state, {
    get: (obj, key) => {
      if (key === "reset") {
        return () => dispatch({ payload: args });
      } else {
        return state[key];
      }
    },
    set: (obj, key, value) => {
      if (typeof value === "function") {
        dispatch({ payload: (state) => ({ [key]: value(state) }) });
      } else {
        dispatch({ payload: () => ({ [key]: value }) });
      }
      return true;
    },
  });
}
