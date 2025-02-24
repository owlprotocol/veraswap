import { createLazyFileRoute } from "@tanstack/react-router";
import { SwapInterface } from "../components/SwapInterface.js";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <SwapInterface />
    </div>
  );
}
