import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Websites from "./pages/Websites";
import Changes from "./pages/Changes";
import Tasks from "./pages/Tasks";
import Issues from "./pages/Issues";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="websites" element={<Websites />} />
          <Route path="changes" element={<Changes />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="issues" element={<Issues />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
