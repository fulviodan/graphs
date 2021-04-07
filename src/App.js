import logo from "./logo.svg";
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";

import { motion } from "framer-motion";
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
  notify(id, msg) {
    const observers = this.observers[id] != null ? this.observers[id] : {};
    Object.values(observers).forEach((el) => {
      el(msg);
    });
  }
}
const o = new Observer();

export function Node({ id, x, y, r = 50 }) {
  const state = useCompositeState({ x, y });
  useEffect(() => {
    o.notify(id, { x, y });
  }, [x, y]);

  return (
    <motion.rect
      drag={true}
      dragMomentum={false}
      onDrag={(event, info) => {
        const { x, y } = info.delta;
        state.x = state.x + x;
        state.y = state.y + y;

        o.notify(id, { x: state.x + x, y: state.y + y, delta: info.delta });
      }}
      x={x}
      y={y}
      width={90}
      height={60}
      fill="red"
    />
  );
}

function Edge({ id, start, end }) {
  const state = useCompositeState({ x: 0, y: 0, ex: 0, ey: 0 });
  console.log("Rerender", id, start, end);
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
  const width = 1920;
  const height = 1080;
  const nodes = [];
  const nn = 20;
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
  for (let i = 0; i < nn * 3; i++) {
    edges.push(
      <Edge
        id={i}
        start={Math.floor(Math.random() * nn)}
        end={Math.floor(Math.random() * nn)}
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

export default () => (
  <ChakraProvider>
    <App />
  </ChakraProvider>
);
