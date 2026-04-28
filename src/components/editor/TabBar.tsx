import { X, Plus, Circle } from "lucide-react";
import { useEditorStore, type Tab } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";

export default function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const newTab = useEditorStore((s) => s.newTab);

  if (tabs.length === 0) return null;

  return (
    <div className="tab-bar flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onActivate={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
        />
      ))}
      <button
        onClick={newTab}
        className="tab-new-btn flex items-center justify-center"
        title="New tab (Ctrl+N)"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

function TabItem({
  tab,
  isActive,
  onActivate,
  onClose,
}: {
  tab: Tab;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
}) {
  const isDirty = tab.saveStatus === "dirty";

  return (
    <div
      className={cn("tab-item group", isActive && "active")}
      onClick={onActivate}
    >
      <span className="tab-name truncate">
        {tab.name}
        {tab.path === null && <span className="tab-unsaved-badge">•</span>}
      </span>
      <button
        className="tab-close-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        title="Close tab"
      >
        {isDirty ? (
          <Circle size={8} className="fill-current text-[var(--warning)]" />
        ) : (
          <X size={12} />
        )}
      </button>
    </div>
  );
}
