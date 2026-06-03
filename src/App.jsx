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
import TreeIdCardModal from "./features/ss3-visitor/TreeIdCardModal.jsx";
import ITDashboardPage from "./features/it-support/ITDashboardPage.jsx";
import IncidentTicketsPage from "./features/it-support/IncidentTicketsPage.jsx";
import SystemMonitoringPage from "./features/it-support/SystemMonitoringPage.jsx";
import UserAccessPage from "./features/it-support/UserAccessPage.jsx";
import RangerReportsPage from "./features/ss2-field/RangerReportsPage.jsx";
import AuditPage from "./features/ss4-map/AuditPage.jsx";
import MapPage from "./features/ss4-map/MapPage.jsx";
import SpatialPage from "./features/ss4-map/SpatialPage.jsx";
import { DEFAULT_PAGE } from "./config/navigation.js";
import { INITIAL_FIELD_REPORTS } from "./data/fieldReports.js";
import { INITIAL_TASKS } from "./data/tasks.js";
import { TREES } from "./data/trees.js";
import { ROLE } from "./models.js";
import { canAccessPage } from "./services/mockAuthService.js";
import { nextTaskId, updateTreeRecord } from "./services/adminService.js";
import { createFieldReport } from "./services/rangerService.js";
import { addCollectedTreeWithStatus, loadCollection, loadLanguage, saveLanguage } from "./services/storageService.js";
import { visitorText } from "./services/visitorI18n.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [trees, setTrees] = useState(TREES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [fieldReports, setFieldReports] = useState(INITIAL_FIELD_REPORTS);
  const [collection, setCollection] = useState(loadCollection);
  const [language, setLanguage] = useState(loadLanguage);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedTree, setScannedTree] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = useCallback((message) => setToast(message), []);

  if (!user) return <LoginPage onLogin={(nextUser) => { setUser(nextUser); setActivePage(DEFAULT_PAGE[nextUser.role]); }} />;

  const navigate = (page) => {
    if (canAccessPage(user.role, page)) setActivePage(page);
    else showToast("Access denied for this role.");
  };
  const collect = (tree) => {
    const result = addCollectedTreeWithStatus(tree.id);
    setCollection(result.collection);
    showToast(visitorText(language, result.isNew ? "collection.unlocked" : "collection.alreadyCollected", { name: tree.name }));
  };
  const completeScan = (tree, message, reportDraft) => {
    if (user.role === ROLE.VISITOR) {
      collect(tree);
      setScannedTree(tree);
      return null;
    }
    if (user.role === ROLE.RANGER && reportDraft) {
      const report = createFieldReport({ draft: reportDraft, tree, rangerName: user.name, tasks, existingReports: fieldReports });
      setFieldReports((current) => [report, ...current]);
      if (report.taskId) setTasks((current) => current.map((task) => task.id === report.taskId ? { ...task, status: "completed" } : task));
      setTrees((current) => current.map((item) => item.id === report.treeId ? { ...item, status: report.observedStatus, health: report.observedStatus === "critical" ? 38 : report.observedStatus === "monitor" ? 68 : 94 } : item));
      showToast(`${report.id} submitted. Report synced to admin dashboard.`);
      return report;
    }
    showToast(message);
    return null;
  };
  const updateTask = (id, status) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task));
  const addTask = (taskDraft) => {
    const task = { ...taskDraft, id: taskDraft.id || nextTaskId(tasks), status: taskDraft.status || "pending" };
    setTasks((current) => [...current, task]);
    return task;
  };
  const updateTree = (id, patch) => setTrees((current) => updateTreeRecord(current, id, patch));
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

  const pageProps = { role: user.role, user, trees, tasks, fieldReports, language, showToast };
  let content;
  switch (activePage) {
    case "dashboard": content = <DashboardPage {...pageProps} onNavigate={navigate} />; break;
    case "inventory": content = <InventoryPage {...pageProps} onAddTree={addTree} onArchiveTree={archiveTree} onUpdateTree={updateTree} />; break;
    case "maintenance": content = <MaintenancePage {...pageProps} onAddTask={addTask} />; break;
    case "schedule": content = <SchedulePage {...pageProps} onAddTask={addTask} />; break;
    case "rangers": content = <RangerManagementPage {...pageProps} />; break;
    case "tasks": content = <TaskTrackerPage {...pageProps} onUpdateTask={updateTask} />; break;
    case "ranger-tasks": content = <RangerTasksPage {...pageProps} onUpdateTask={updateTask} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "ranger-reports": content = <RangerReportsPage {...pageProps} />; break;
    case "qr": content = <QRPage role={user.role} language={language} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "map": content = <MapPage {...pageProps} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "spatial": content = <SpatialPage {...pageProps} />; break;
    case "audit": content = <AuditPage {...pageProps} />; break;
    case "explore": content = <ExplorePage {...pageProps} onLanguage={changeLanguage} onTreeClick={setScannedTree} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "profiles": content = <ProfilesPage {...pageProps} onCollect={collect} />; break;
    case "chat": content = <ChatPage language={language} />; break;
    case "collection": content = <CollectionPage {...pageProps} collection={collection} onOpenScanner={() => setScannerOpen(true)} />; break;
    case "it-dashboard": content = <ITDashboardPage {...pageProps} onNavigate={navigate} />; break;
    case "it-monitoring": content = <SystemMonitoringPage {...pageProps} />; break;
    case "it-users": content = <UserAccessPage {...pageProps} />; break;
    case "it-tickets": content = <IncidentTicketsPage {...pageProps} />; break;
    default: content = <DashboardPage {...pageProps} onNavigate={navigate} />;
  }

  return (
    <AppShell role={user.role} user={user} activePage={activePage} language={language} onNavigate={navigate} onLogout={() => setUser(null)}>
      {content}
      {scannerOpen && <QRScanner role={user.role} trees={trees} language={language} onClose={() => setScannerOpen(false)} onComplete={completeScan} />}
      {scannedTree && user.role === ROLE.VISITOR && <TreeIdCardModal tree={scannedTree} language={language} onClose={() => setScannedTree(null)} onCollect={(tree) => { collect(tree); setScannedTree(null); }} />}
      {user.role === ROLE.VISITOR && activePage !== "chat" && <ChatFloatingButton language={language} onClick={() => navigate("chat")} />}
      <Toast message={toast} onClose={() => setToast("")} />
    </AppShell>
  );
}
