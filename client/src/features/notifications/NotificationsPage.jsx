import { Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'alert', title: 'Asset Depreciation Warning: Macbook Pro 16"', desc: 'IT-ASSET-0001 has reached 90% of its depreciated value.', time: '10 mins ago', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', isRead: false },
    { id: 2, type: 'success', title: 'Audit Completed', desc: 'Q3 IT Equipment audit finalized by sysadmin.', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', isRead: false },
    { id: 3, type: 'info', title: 'System Update Scheduled', desc: 'Core server maintenance scheduled for Saturday 2AM.', time: '1 day ago', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', isRead: true },
    { id: 4, type: 'info', title: 'New Employee Onboarding', desc: 'Asset assignment uncompleted for 3 new hires.', time: '2 days ago', icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10', isRead: true },
    { id: 5, type: 'success', title: 'Bulk Import Successful', desc: 'Imported 150 new peripherals from warehouse log.', time: '1 week ago', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', isRead: true },
  ];

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read', { icon: '👏' });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
            <div className="p-2.5 rounded-xl bg-[var(--accent-bg-strong)] text-[var(--accent)] shadow-sm">
              <Bell size={24} /> 
            </div>
            Notifications Hub
          </h1>
          <p className="text-sm mt-2 ml-1" style={{ color: 'var(--color-text-secondary)' }}>
            View and manage all system alerts and important updates.
          </p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="text-sm font-semibold hover:underline transition-colors px-4 py-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md" 
          style={{ color: 'var(--accent)' }}
        >
          Mark all as read
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border shadow-sm bg-[var(--color-bg-surface)]" style={{ borderColor: 'var(--color-border)' }}>
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div 
                key={n.id}
                className={`p-6 flex flex-col md:flex-row gap-5 transition-colors hover:bg-[var(--color-bg-surface-hover)] cursor-pointer group ${n.isRead ? 'opacity-70' : ''}`}
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex gap-5 flex-1">
                  <div className={`mt-1 shrink-0 p-3 rounded-full ${n.bg} ${n.color} flex items-center justify-center`}>
                    <Icon size={22} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                      <p className={`text-[15px] ${n.isRead ? 'font-medium' : 'font-bold'}`} style={{ color: 'var(--color-text-primary)' }}>
                        {n.title}
                      </p>
                      <p className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-tertiary)' }}>
                        {n.time}
                      </p>
                    </div>
                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {n.desc}
                    </p>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="shrink-0 flex items-center justify-end md:justify-center pt-2 md:pt-0">
                    <div className="w-3 h-3 rounded-full animate-pulse shadow-sm" style={{ background: 'var(--accent)' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t bg-[var(--color-bg-base)] flex justify-center" style={{ borderColor: 'var(--color-border)' }}>
          <button className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--color-bg-surface-hover)] hover:shadow-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Load older notifications
          </button>
        </div>
      </div>
    </div>
  );
}
