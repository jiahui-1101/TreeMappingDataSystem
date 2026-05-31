import { useCallback, useState } from "react";
import AppShell from "./components/layout/AppShell.jsx";
import Toast from "./components/common/Toast.jsx";
import QRScanner from "./components/qr/QRScanner.jsx";
import QRPage from "./components/qr/QRPage.jsx";
import LoginPage from "./features/auth/LoginPage.jsx";
import DashboardPage from "./features/ss1-health/DashboardPage.jsx";
import InventoryPage from "./features/ss1-health/InventoryPage.jsx";
import MaintenancePage from "./features/ss1-health/MaintenancePage.jsx";
import RangerManagementPage from "./features/ss2-field/RangerManagementPage.jsx";
import RangerTasksPage from "./features/ss2-field/RangerTasksPage.jsx";
import SchedulePage from "./features/ss2-field/SchedulePage.jsx";
import TaskTrackerPage from "./features/ss2-field/TaskTrackerPage.jsx";
import ChatPage, { ChatFloatingButton } from "./features/ss3-visitor/ChatPage.jsx";
import CollectionPage from "./features/ss3-visitor/CollectionPage.jsx";
import ExplorePage from "./features/ss3-visitor/ExplorePage.jsx";
import ProfilesPage from "./features/ss3-visitor/ProfilesPage.jsx";
import AuditPage from "./features/ss4-map/AuditPage.jsx";
import MapPage from "./features/ss4-map/MapPage.jsx";
import SpatialPage from "./features/ss4-map/SpatialPage.jsx";
import { DEFAULT_PAGE } from "./config/navigation.js";
import { INITIAL_TASKS } from "./data/tasks.js";
import { TREES } from "./data/trees.js";
import { ROLE } from "./models.js";
import { canAccessPage } from "./services/mockAuthService.js";
import { addCollectedTree, loadCollection, loadLanguage, saveLanguage } from "./services/storageService.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [trees, setTrees] = useState(TREES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [collection, setCollection] = useState(loadCollection);
  const [language, setLanguage] = useState(loadLanguage);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = useCallback((message) => setToast(message), []);

  if (!user) return <LoginPage onLogin={(nextUser) => { setUser(nextUser); setActivePage(DEFAULT_PAGE[nextUser.role]); }} />;

  const navigate = (page) => {
    if (canAccessPage(user.role, page)) setActivePage(page);
    else showToast("Access denied for this role.");
  };
  const collect = (tree) => {
    const updated = addCollectedTree(tree.id);
    setCollection(updated);
    showToast(`${tree.name} added to your visitor collection.`);
  };
  const completeScan = (tree, message) => {
    if (user.role === ROLE.VISITOR) collect(tree);
    else showToast(message);
  };
  const updateTask = (id, status) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task));
  const addTree = ({ name, scientificName }) => {
    const id = `TBJ-${String(trees.length + 1).padStart(3, "0")}`;
    setTrees((current) => [...current, { id, name, scientificName, zone: "Arboretum", age: 1, height: 1, health: 100, status: "healthy", rare: false, x: 42, y: 51, description: "New tree record created in the modular UI prototype." }]);
    showToast(`${id} created with a mock QR label.`);
  };
  const archiveTree = (id) => {
    setTrees((current) => current.filter((tree) => tree.id !== id));
    showToast(`${id} archived. Its previous QR label is now invalid in the UI mock.`);
  };
  const changeLanguage = (next) => {
    saveLanguage(next); setLanguage(next);
  };

  const pageProps = { role: user.role, trees, tasks, showToast };
  let content;
  switch (activePage) {
    case "dashboard": content = <DashboardPage {...pageProps} onNavigate={navigate} />; break;
    case "inventory": content = <InventoryPage {...pageProps} onAddTree={addTree} onArchiveTree={archiveTree} />; break;
    case "maintenance": content = <MaintenancePage {...pageProps} />; break;
    case "schedule": content = <SchedulePage {...pageProps} />; break;
    case "rangers": content = <RangerManagementPage {...pageProps} />; break;
    case "tasks": content = <TaskTrackerPage {...pageProps} onUpdateTask={updateTask} />; break;
    case "ranger-tasks": content = <RangerTasksPage {...pageProps} onUpdateTask={updateTask} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "qr": content = <QRPage role={user.role} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "map": content = <MapPage {...pageProps} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "spatial": content = <SpatialPage {...pageProps} />; break;
    case "audit": content = <AuditPage {...pageProps} />; break;
    case "explore": content = <ExplorePage {...pageProps} language={language} onLanguage={changeLanguage} onTreeClick={(tree) => showToast(`${tree.name} profile selected from map.`)} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "profiles": content = <ProfilesPage {...pageProps} onCollect={collect} />; break;
    case "chat": content = <ChatPage />; break;
    case "collection": content = <CollectionPage {...pageProps} collection={collection} onOpenScanner={() => setScannerOpen(true)} />; break;
    default: content = <DashboardPage {...pageProps} onNavigate={navigate} />;
  }

  return (
    <AppShell role={user.role} user={user} activePage={activePage} onNavigate={navigate} onLogout={() => setUser(null)}>
      {content}
      {scannerOpen && <QRScanner role={user.role} onClose={() => setScannerOpen(false)} onComplete={completeScan} />}
      {user.role === ROLE.VISITOR && activePage !== "chat" && <ChatFloatingButton onClick={() => navigate("chat")} />}
      <Toast message={toast} onClose={() => setToast("")} />
    </AppShell>
  );
}
