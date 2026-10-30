import { useNuiEvent } from "fivem-nui-react";
import type { NuiMessage, RadialNode } from "../../resource/common/radial";
import { Wheel } from "./components/Wheel";
import { MOCK_OPEN } from "./dev/mock";
import { closed, opened, updated } from "./features/wheel";
import { useAppDispatch } from "./store";

type OpenData = Extract<NuiMessage, { action: "open" }>["data"];

/** Client messages into the store: open (snapshot), update (a refresh of the open wheel), close. */
export function App() {
  const dispatch = useAppDispatch();
  useNuiEvent<OpenData>("open", (d) => dispatch(opened(d)), {
    mockData: MOCK_OPEN,
    mockDelay: 100,
  });
  useNuiEvent<{ items: RadialNode[] }>("update", (d) =>
    dispatch(updated(d.items)),
  );
  useNuiEvent("close", () => dispatch(closed()));
  return <Wheel />;
}
