// views
import {
  About,
  Clients,
  Contact,
  Experience,
  Footer,
  Hero,
  Projects,
  Skills,
  Stats,
} from "./views";

// react
import { Suspense, lazy } from "react";

// components
import { BackToTop, CustomCursor, Navbar, ScrollProgress } from "./components";
import { useIdle } from "./useIdle";

// Not needed for the first paint: fetched in their own chunks once the
// browser is idle (the assistant's launcher only appears after the intro)
const AskAdvaith = lazy(() => import("./components/AskAdvaith"));
const CommandPalette = lazy(() => import("./components/CommandPalette"));

function App() {
  const idle = useIdle();
  return (
    <div className="relative overflow-x-clip">
      {/* Ambient background: dot grid + fixed gradient glows */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-night bg-glow">
        <div className="absolute inset-0 bg-grid" />
      </div>

      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Experience />
        <Skills />
        <Clients />
        <Projects />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      {idle && (
        <Suspense fallback={null}>
          <CommandPalette />
          <AskAdvaith />
        </Suspense>
      )}
      <CustomCursor />
    </div>
  );
}

export default App;
