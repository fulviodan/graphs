import logo from "./logo.svg";
import "./App.css";
import { ChakraProvider, Flex, Kbd, Stack } from "@chakra-ui/react";

import {
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useCompositeState } from "./state";
import { useEffect, useRef } from "react";
import { useKeyListener } from "./keyboard";

export function Selection({ state }) {
  return (
    <rect
      x={state.x}
      y={state.y}
      width={state.x2 - state.x}
      height={state.y2 - state.y}
    />
  );
}

export function Node({
  id,
  x,
  y,
  r = 50,
  selected = false,
  exportState,
  onMove,
  onClick,
}) {
  const state = useCompositeState({
    selected: false,
    delta: null,
    dragging: false,
  });

  const mx = useMotionValue(x);
  const my = useMotionValue(y);
  useEffect(() => {
    if (state != null) {
      exportState(id, { x: mx, y: my, state });
    }
  }, []);

  return (
    <motion.rect
      drag
      dragMomentum={false}
      onDrag={(event, info) => {
        const { x, y } = info.delta;
        if (!state.dragged) {
          state.dragged = true;
        }
        if (x !== 0 || y !== 0) {
          onMove(id, x, y);
          console.log(id);
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onDragEnd={(e) => (state.dragging = false)}
      style={{ x: mx, y: my }}
      width={30}
      height={20}
      fill={state.selected ? "yellow" : "red"}
      onMouseUp={(e) => {
        if (!state.dragged) {
          state.selected = !state.selected;
          onClick(e);
        }
        state.dragged = false;
      }}
      onMouseMove={(e) => e.stopPropagation()}
    />
  );
}

function Edge({ id, x1, y1, x2, y2 }) {
  const state = useCompositeState({
    x1: x1.get(),
    x2: x2.get(),
    y1: y1.get(),
    y2: y2.get(),
  });
  useEffect(() => {
    x1.onChange((latest) => (state.x1 = latest));
    y1.onChange((latest) => (state.y1 = latest));
    x2.onChange((latest) => (state.x2 = latest));
    y2.onChange((latest) => (state.y2 = latest));
  }, [x1, y1, x2, y2]);

  return (
    <path
      d={`M${state.x1} ${state.y1} L${state.x2} ${state.y2} Z`}
      stroke="black"
    />
  );
}

function createGraph({
  numNodes = 50,
  numEdges = 50,
  width = 800,
  height = 800,
}) {
  const nodes = {};
  const edges = {};
  for (let i = 0; i < numNodes; i++) {
    nodes[i] = { id: i, x: Math.random() * width, y: Math.random() * height };
  }
  for (let i = 0; i < numEdges; i++) {
    const start = Math.floor(Math.random() * (numNodes - 1));
    const end = Math.floor(Math.random() * (numNodes - 1));
    edges[i] = { id: i, start, end };
  }
  return { nodes, edges };
}
function quantize(n, step) {
  return Math.floor(n / step) * step;
}

function Graph({ graph, width = 800, height = 800 }) {
  const state = useCompositeState({
    states: {},
    selected: {},
    nodes: graph.nodes,
    edges: graph.edges,
  });
  const selection = useCompositeState();

  console.log("Rerender");
  function computeSelection(selection) {
    Object.entries(state.states).forEach(([id, n]) => {
      if (n.x.get() >= selection.x && n.x.get() < selection.y) {
        console.log("Gropu");
        n.state.selected = true;
        state.selected[id] = true;
      }
    });
  }

  return (
    <div
      tabIndex="0"
      onKeyDown={(e) => {
        console.log(e.key);
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "Delete") {
          const newnodes = { ...state.nodes };
          const newstates = { ...state.states };
          const toDelete = {};
          Object.entries(state.selected).forEach(([id, v]) => {
            if (v) {
              toDelete[id] = true;
              delete newnodes[id];
              delete newstates[id];
            }
          });
          const nedges = {};
          Object.entries(state.edges).forEach(([id, e]) => {
            if (!toDelete[e.start] && !toDelete[e.end]) {
              nedges[id] = e;
            }
          });
          console.log("NN", Object.keys(newnodes));
          state.nodes = newnodes;
          state.selected = {};
          state.states = newstates;
          state.edges = nedges;
        }
        if (e.key === "a" && e.ctrlKey) {
          console.log("Select all");
          Object.entries(state.states).forEach(([id, el]) => {
            el.state.selected = true;
            state.selected[id] = true;
          });
        }
        if (e.key === "Escape") {
          console.log("Select none");
          Object.entries(state.states).forEach(([id, el]) => {
            el.state.selected = false;
            state.selected[id] = false;
          });
        }
        if (e.key === "r" && e.ctrlKey) {
          console.log("Select random");
          Object.entries(state.states).forEach(([id, el]) => {
            if (Math.random() > 0.9) {
              el.state.selected = true;
              state.states[id].selected = true;
            }
          });
        }
        if (e.key === "q" && e.ctrlKey) {
          Object.entries(state.states).forEach(([id, el]) => {
            el.x.set(quantize(el.x.get(), 100));
            el.y.set(quantize(el.y.get(), 100));
          });
        }
      }}
    >
      <svg
        width={width}
        height={height}
        // onMouseDown={(e) => {
        //   selection.x = e.clientX;
        //   selection.y = e.clientY;
        //   selection.x2 = e.clientX;
        //   selection.y2 = e.clientY;
        // }}
        // onMouseUp={(e) => {
        //   console.log("Selection", selection);
        //   computeSelection(selection);
        //   selection.x = 0;
        //   selection.y = 0;
        //   selection.x2 = 0;
        //   selection.y2 = 0;
        // }}
        // onMouseMove={(e) => {
        //   if (e.buttons === 1) {
        //     selection.x2 = e.clientX;
        //     selection.y2 = e.clientY;
        //   }
        // }}
      >
        {/* <Selection state={selection} /> */}
        {Object.entries(state.edges).map(([id, e]) => {
          const state1 = state.states[e.start] || {};
          const state2 = state.states[e.end] || {};
          if (Object.keys(state1).length && Object.keys(state2).length) {
            return (
              <Edge
                key={id}
                id={id}
                x1={state1.x}
                y1={state1.y}
                x2={state2.x}
                y2={state2.y}
              />
            );
          } else {
            return null;
          }
        })}
        {Object.entries(state.nodes).map(([id, n]) => {
          return (
            <Node
              id={id}
              x={n.x}
              y={n.y}
              key={id}
              exportState={(id, nodeState) => {
                state.states = (state) => ({
                  ...state.states,
                  [id]: nodeState,
                });
              }}
              onMove={(id, x, y) => {
                Object.entries(state.states).map(([k, v]) => {
                  if (k !== id && state.selected[k]) {
                    v.x.set(v.x.get() + x);
                    v.y.set(v.y.get() + y);
                  }
                });
              }}
              onClick={(e) => (state.selected[id] = !state.selected[id])}
            />
          );
        })}
      </svg>
    </div>
  );
}

function App() {
  const width = 1920;
  const height = 700;
  const graph = createGraph({ numNodes: 100, numEdges: 200, width, height });
  return (
    <Flex direction="column">
      <Graph graph={graph} width={width} height={height} />
      <Stack>
        <span>
          <Kbd>Click</Kbd> add node to selection
        </span>
        <span>
          <Kbd>Esc</Kbd> cancel selection
        </span>
        <span>
          <Kbd>Ctrl+a</Kbd> select all
        </span>
        <span>
          <Kbd>Ctrl+r</Kbd> select random nodes
        </span>
        <span>
          <Kbd>Ctrl+q</Kbd> align nodes
        </span>
        <span>
          <Kbd>Delete</Kbd> delete selected nodes
        </span>
      </Stack>
    </Flex>
  );
}

export default () => (
  <ChakraProvider>
    <App />
  </ChakraProvider>
);
