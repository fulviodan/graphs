import { useEffect, useState } from "react";

export function useKeyListener(node, handle) {
  useEffect(() => {
    let target = document;

    if (node?.current) {
      target = node.current;
    }

    //target.addEventListener("keydown", handle);
    //target.addEventListener("keyup", handle);
    return () => {
      //target.removeEventListener("keydown", handle);
      target.removeEventListener("keyup", handle);
    };
  }, [node, handle]);
}
