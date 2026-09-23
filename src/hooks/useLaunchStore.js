import { useEffect, useState } from "react";
import { getState, subscribe, tickOpenings } from "../lib/store.js";

export function useLaunchStore() {
  const [state, setState] = useState(getState);
  useEffect(() => subscribe(() => setState(getState())), []);
  useEffect(() => {
    tickOpenings();
    const id = setInterval(tickOpenings, 1000);
    return () => clearInterval(id);
  }, []);
  return state;
}
