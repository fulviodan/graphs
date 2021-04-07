import { useReducer } from "react";

export function useCompositeState(args) {
  const red = (state, action) => {
    //return (state) => ({ ...state, ...action.payload });
    return { ...state, ...action.payload };
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
      dispatch({ payload: { [key]: value } });
      return true;
    },
  });
}
