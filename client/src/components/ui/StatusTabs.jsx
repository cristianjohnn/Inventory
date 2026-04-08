/**
 * Horizontal status filter tabs with counts.
 * Shows active tab with orange accent.
 */
export default function StatusTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="status-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`status-tab ${activeTab === tab.value ? 'active' : ''}`}
        >
          {tab.label}
          <span className="count">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}
