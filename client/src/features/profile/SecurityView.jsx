import { useState } from 'react';
import { Lock, ShieldAlert, Smartphone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SecurityView() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const daysSinceChange = user?.lastPasswordChanged
    ? Math.floor((Date.now() - new Date(user.lastPasswordChanged).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await usersApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
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
            Last changed {daysSinceChange} day{daysSinceChange !== 1 ? 's' : ''} ago.
          </p>

          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl border font-semibold text-sm transition-colors hover:bg-[var(--color-bg-surface-hover)]"
              style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4 max-w-md">
              {['current', 'new', 'confirm'].map((field) => {
                const name = field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword';
                const label = field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password';
                return (
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--color-text-tertiary)' }}>{label}</label>
                    <div className="relative">
                      <input
                        type={showPasswords[field] ? 'text' : 'password'}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="filter-input w-full !px-4 !py-3 !pr-10 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                      >
                        {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="btn btn-secondary">Cancel</button>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
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
