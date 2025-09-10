import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import HomePage from "./pages/general/Home.page";
import LoginPage from "./pages/general/Login.page";
import PlatformPage from "./pages/general/Platform.page";

import AccProjectsPage from "./pages/acc/acc.projects.page";
import AccGeneralReportPage from "./pages/acc/acc.general.report.page.jsx";
import AccProjectPage from "./pages/acc/acc.project.page.jsx";
import AccProjectIssuesPage from "./pages/acc/acc.issues.page.jsx";
import AccProjectUsersPage from "./pages/acc/acc.users.page";
import AccProjectRfisPage from "./pages/acc/acc.rfis.page.jsx";
import AccProjectSubmittalsPage from "./pages/acc/acc.submittals.page.jsx";
import AccProjectFolderPermitsPage from "./pages/acc/acc.folder.permits.page.jsx";
import AccModelDatabasePage from "./pages/acc/acc.model.database.page.jsx";
import AccDigitalTwin from "./pages/acc/acc.digital.twin.page";


import Bim360ProjectsPage from "./pages/bim360/bim360.projects.page.jsx";
import Bim360GeneralReportPage from "./pages/bim360/bim360.general.report.page.jsx";
import Bim360ProjectPage from "./pages/bim360/bim360.project.page.jsx";
import Bim360ProjectIssuesPage from "./pages/bim360/bim360.issues.page.jsx";
import Bim360ProjectUsersPage from "./pages/bim360/bim360.users.page.jsx";
import Bim360ProjectRfisPage from "./pages/bim360/bim360.rfis.page.jsx";
import Bim360ProjectFolderPermitsPage from "./pages/bim360/bim360.folder.permits.page.jsx";
import Bim360ModelDatabasePage from "./pages/bim360/bim360.model.database.page";
import Bim360DigitalTwin from "./pages/bim360/bim360.digital.twin.page"

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
          <Route path="/acc/general-report" element={<AccGeneralReportPage />} />
          <Route
            path="/acc/projects/:accountId/:projectId"
            element={<AccProjectPage />}
          />
          <Route
            path="/acc/projects/:accountId/:projectId/issues"
            element={<AccProjectIssuesPage />}
          />
          <Route
            path="/acc/projects/:accountId/:projectId/users"
            element={<AccProjectUsersPage />}
          />
          <Route
            path="/acc/projects/:accountId/:projectId/rfis"
            element={<AccProjectRfisPage />}
          />
          <Route
            path="/acc/projects/:accountId/:projectId/submittals"
            element={<AccProjectSubmittalsPage />}
          />
          <Route
            path="/acc/projects/:accountId/:projectId/folder-permits"
            element={<AccProjectFolderPermitsPage />}
          />
          <Route
            path="/acc/projects/:accountId/:projectId/model-database"
            element={<AccModelDatabasePage />}
          />
          <Route 
            path = "/acc/projects/:accountId/:projectId/digital-twin"
            element = {<AccDigitalTwin />}
            />

          {/* BIM 360 */}
          <Route path="/bim360/projects/" element={<Bim360ProjectsPage />} />
          <Route path="/bim360/general-report" element={<Bim360GeneralReportPage />} />
          <Route
            path="/bim360/projects/:accountId/:projectId"
            element={<Bim360ProjectPage />}
          />
          <Route
            path="/bim360/projects/:accountId/:projectId/issues"
            element={<Bim360ProjectIssuesPage />}
          />
          <Route
            path="/bim360/projects/:accountId/:projectId/users"
            element={<Bim360ProjectUsersPage />}
          />
          <Route
            path="/bim360/projects/:accountId/:projectId/rfis"
            element={<Bim360ProjectRfisPage />}
          />
          <Route
            path="/bim360/projects/:accountId/:projectId/folder-permits"
            element={<Bim360ProjectFolderPermitsPage />}
          />
          <Route
            path="/bim360/projects/:accountId/:projectId/model-database"
            element={<Bim360ModelDatabasePage />}
          />
          <Route
            path="/bim360/projects/:accountId/:projectId/digital-twin"
            element = {<Bim360DigitalTwin/>}
            />

          {/* Catch-all route for 404 */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
