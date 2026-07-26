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

// components
import { BackToTop, CursorGlow, Navbar, ScrollProgress } from "./components";

function App() {
  return (
    <div className="relative overflow-x-clip">
      {/* Ambient background: dot grid + fixed gradient glows */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-night bg-glow">
        <div className="absolute inset-0 bg-grid" />
      </div>

      <CursorGlow />
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
    </div>
  );
}

export default App;
