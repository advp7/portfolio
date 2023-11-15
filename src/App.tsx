// views
import { About, Contact, Hero, Projects } from "./views";

// components
import { Menu } from "./components";
import Skills from "./views/Skills";
import Clients from "./views/Clients";

function App() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      {/* <Clients /> */}
      <Projects />
      <Contact />
      <Menu />
    </>
  );
}

export default App;
