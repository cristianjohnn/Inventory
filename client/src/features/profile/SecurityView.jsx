import { Lock, ShieldAlert, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityView() {
  const handleUpdatePassword = () => {
    toast.success('Password update link sent to email');
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="border-b px-8 py-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>Security Settings</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Manage your password and multi-factor authentication.</p>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Password Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--accent-bg-strong)] text-[var(--accent)]"><Lock size={18} /></div>
            <h3 className="font-semibold text-md" style={{ color: 'var(--color-text-primary)' }}>Password</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            You are using a single sign-on (SSO) password managed by the IT admin portal. 
            Last changed 45 days ago.
          </p>
          <button 
            onClick={handleUpdatePassword}
            className="px-6 py-2.5 rounded-xl border font-semibold text-sm transition-colors hover:bg-[var(--color-bg-surface-hover)]"
            style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
          >
            Request Password Reset
          </button>
        </div>

        <hr style={{ borderColor: 'var(--color-border)' }} />

        {/* 2FA Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><Smartphone size={18} /></div>
            <h3 className="font-semibold text-md" style={{ color: 'var(--color-text-primary)' }}>Multi-Factor Auth (MFA)</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            MFA is enforced globally for your security group. An authenticator app must be used upon login.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 w-fit text-green-600 border border-green-500/20 text-sm font-semibold">
            <ShieldAlert size={16} /> MFA strictly enabled
          </div>
        </div>

      </div>
    </div>
  );
}
