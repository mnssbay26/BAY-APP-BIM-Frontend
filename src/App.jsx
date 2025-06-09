import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import HomePage from "./pages/general/Home.page";
import LoginPage from "./pages/general/Login.page";
import PlatformPage from "./pages/general/Platform.page";

import AccProjectsPage from "./pages/acc/acc.projects.page";
import AccProjectPage from "./pages/acc/acc.project.page.jsx";
import AccProjectIssuesPage from "./pages/acc/acc.issues.page.jsx";
import AccProjectUsersPage from "./pages/acc/acc.users.page";
import AccProjectRfisPage from "./pages/acc/acc.rfis.page.jsx";
import AccProjectSubmittalsPage from "./pages/acc/acc.submittals.page.jsx";
import AccProjectFolderPermitsPage from "./pages/acc/acc.folder.permits.page.jsx";

import Bim360ProjectsPage from "./pages/bim360/bim360.projects.page.jsx"
import Bim360ProjectPage from "./pages/bim360/bim360.project.page.jsx";
import Bim360ProjectIssuesPage from "./pages/bim360/bim360.issues.page.jsx";
import Bim360ProjectUsersPage from "./pages/bim360/bim360.users.page.jsx";
import Bim360ProjectRfisPage from "./pages/bim360/bim360.rfis.page.jsx";
import Bim360ProjectFolderPermitsPage from "./pages/bim360/bim360.folder.permits.page.jsx";

import UnauthorizedPage from "./pages/general/UnaurhorizedPage.jsx";
import NotFoundPage from "./pages/general/NotFoundPage";

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
          <Route path="/acc/projects/:accountId/:projectId" element={<AccProjectPage />} />
          <Route path="/acc/projects/:accountId/:projectId/issues" element={<AccProjectIssuesPage />} />
          <Route path="/acc/projects/:accountId/:projectId/users" element={<AccProjectUsersPage />} />
          <Route path="/acc/projects/:accountId/:projectId/rfis" element={<AccProjectRfisPage />} />
          <Route path="/acc/projects/:accountId/:projectId/submittals" element={<AccProjectSubmittalsPage />} />
          <Route path="/acc/projects/:accountId/:projectId/folder-permits" element={<AccProjectFolderPermitsPage />} />

          {/* BIM 360 */ }
          <Route path="/bim360/projects/" element={<Bim360ProjectsPage />} />
          <Route path="/bim360/projects/:accountId/:projectId" element={<Bim360ProjectPage />} />
          <Route path="/bim360/projects/:accountId/:projectId/issues" element={<Bim360ProjectIssuesPage />} />
          <Route path="/bim360/projects/:accountId/:projectId/users" element={<Bim360ProjectUsersPage />} />
          <Route path="/bim360/projects/:accountId/:projectId/rfis" element={<Bim360ProjectRfisPage />} />
          <Route path="/bim360/projects/:accountId/:projectId/folder-permits" element={<Bim360ProjectFolderPermitsPage />} />

          {/* Catch-all route for 404 */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
