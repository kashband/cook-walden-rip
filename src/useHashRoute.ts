import { useEffect, useState } from "react";

/** Current location.hash (without "#"), reactive to hashchange. */
export function useHashRoute(): string {
  const [route, setRoute] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const onChange = () => setRoute(window.location.hash.slice(1));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
