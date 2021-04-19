import logo from "./logo.svg";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useCompositeState } from "./state";
import { useEffect } from "react";

class Observer {
  constructor() {
    this.observers = {};
  }
  add(id, observerId, cb) {
    if (this.observers[id] == null) {
      this.observers[id] = {};
    }
    this.observers[id][observerId] = cb;
  }
  remove(id, observerId) {
    if (this.observers[id] != null) {
      delete this.observers[id][observerId];
    }
  }
  async notify(id, msg) {
    const observers = this.observers[id] != null ? this.observers[id] : {};
    Object.values(observers).forEach((el) => {
      el(msg);
    });
  }
}
const o = new Observer();

export function Node({ id, x, y, r = 50, selected = false }) {
  const state = useCompositeState({
    selected: false,
    delta: null,
    dragging: false,
  });
  const mx = useMotionValue(x);
  const my = useMotionValue(y);

  useEffect(() => {
    o.notify(id, { x, y });
  }, [x, y]);

  useEffect(() => {
    return mx.onChange((latest) => {
      o.notify(id, { x: latest, y: my.get() });
      if (state.dragging && state.delta) {
        o.notify("move", { sid: id, delta: state.delta });
      }
    });
  }, [mx, state.dragging, state.delta]);

  useEffect(() => {
    return my.onChange((latest) => {
      o.notify(id, { x: mx.get(), y: latest });
      if (state.dragging && state.last != null) {
        console.log("Notifico delta", state.delta);
        o.notify("move", { sid: id, delta: state.delta });
      }
    });
  }, [my, state.last, state.dragging]);

  useEffect(() => {
    if (state.selected) {
      o.add("move", id, ({ sid, delta }) => {
        console.log({ sid, delta });
        if (sid !== id) {
          const { x, y } = delta;
          mx.set(mx.get() + x);
          my.set(my.get() + y);
        }
      });
    } else {
      o.remove("move", id);
    }
  }, [state.selected, mx, my]);

  return (
    <motion.rect
      drag
      dragMomentum={false}
      onDragStart={(e) => {
        state.dragging = true;
        console.log(e);
      }}
      onDragEnd={(e) => {
        state.dragging = false;
        state.delta = null;
      }}
      onDrag={(event, info) => {
        const { x, y } = info.delta;
        if (x !== 0 || y !== 0) {
          state.delta = { x: info.delta.x, y: info.delta.y };
        } else {
          console.log("L'inguaggcchcio");
          state.delta = null;
        }
      }}
      style={{ x: mx, y: my }}
      width={90}
      height={60}
      fill={state.selected ? "yellow" : "red"}
      onClick={(e) => {
        state.selected = !state.selected;
      }}
    />
  );
}

function Edge({ id, start, end }) {
  const state = useCompositeState({ x: 0, y: 0, ex: 0, ey: 0 });
  o.add(start, id, ({ x, y }) => {
    state.x = x;
    state.y = y;
  });

  o.add(end, id, ({ x, y }) => {
    state.ex = x;
    state.ey = y;
  });

  return (
    <path
      d={`M${state.x} ${state.y} L${state.ex} ${state.ey} Z`}
      stroke="black"
    />
  );
}

function App() {
  const width = 1320;
  const height = 800;
  const nodes = [];
  const nn = 4;

  for (let i = 0; i < nn; i++) {
    nodes.push(
      <Node
        id={i}
        x={20 + width * Math.random()}
        y={20 + height * Math.random()}
        r={40}
      />
    );
  }
  const edges = [];
  for (let i = 0; i < nn - 1; i++) {
    edges.push(
      <Edge
        id={i}
        start={Math.floor(Math.random() * (nn - 1))}
        end={Math.floor(Math.random() * (nn - 1))}
      />
    );
  }
  return (
    <svg width={width} height={height}>
      {edges}
      {nodes}
    </svg>
  );
}

function App2() {
  const x = useMotionValue(0);

  useEffect(() => {
    x.onChange((latest) => {
      console.log(latest);
    });
  }, [x]);

  return (
    <>
      <motion.div drag dragMomentum={false} style={{ x }}>
        draggami
      </motion.div>
    </>
  );
}

export default () => (
  <ChakraProvider>
    <App />
  </ChakraProvider>
);
