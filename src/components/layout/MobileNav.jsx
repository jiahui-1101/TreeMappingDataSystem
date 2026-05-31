import { MOBILE_PAGES } from "../../config/navigation.js";
import Icon from "../common/Icon.jsx";

export default function MobileNav({ role, activePage, onNavigate }) {
  const items = MOBILE_PAGES[role];
  return (
    <nav className={`mobile-nav mobile-nav-${role}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={activePage === item.id ? "active" : ""}
          onClick={() => onNavigate(item.id)}
        >
          <Icon name={item.icon} />
          <span>{item.label.replace("Tree ", "").replace(" & Route", "")}</span>
        </button>
      ))}
    </nav>
  );
}
