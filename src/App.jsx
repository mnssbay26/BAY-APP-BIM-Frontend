import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import HomePage from "./pages/general/Home.page";
import LoginPage from "./pages/general/Login.page";
import PlatformPage from "./pages/general/Platform.page";

import AccProjectsPage from "./pages/acc/acc.projects.page";
import Bim360ProjectsPage from "./pages/bim360/bim360.projects.page.jsx"

function App() {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/platform" element={<PlatformPage />} />

          {/* ACC Pages */}
          <Route path="/acc/projects" element={<AccProjectsPage />} />

          {/* BIM 36O */ }
          <Route path="/bim360/projects/" element={<Bim360ProjectsPage />} />

        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
