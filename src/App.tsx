// views
import { About, Contact, Hero, Projects } from "./views";

// components
import { Menu } from "./components";
import Skills from "./views/Skills";

function App() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Contact />
      <Menu />
    </>
  );
}

export default App;
