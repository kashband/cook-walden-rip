import { useHashRoute } from "./useHashRoute";
import VisitorMap from "./VisitorMap";
import EditorPage from "./EditorPage";
import "leaflet/dist/leaflet.css";

export default function App() {
  const route = useHashRoute();
  const isEditor = route.startsWith("/editor");

  return (
    <div className="app">
      <header className="banner">
        <h1>Cook-Walden &mdash; IABA Section</h1>
        <span className="tag">Demo &middot; boundary approximate</span>
        {import.meta.env.DEV && !isEditor && (
          <a className="editor-link" href="#/editor">
            Editor
          </a>
        )}
      </header>
      {isEditor ? <EditorPage /> : <VisitorMap />}
    </div>
  );
}
