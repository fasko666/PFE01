import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Briefcase, Settings, Lock, ShieldCheck, Bell,
  ArrowDownToLine, Link2, CheckCircle2, Check, Building2,
  GitBranch, Globe, Sparkles, Eye, EyeOff, AlertTriangle,
  Phone, Mail,
} from 'lucide-react';
import { api } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const getNav = (role) => [
  {
    section: 'User Settings',
    items: [
      { key: 'contact',       label: 'Contact Info',          icon: User },
      ...(role === 'freelancer' ? [
        { key: 'profile',          label: 'My Profile',           icon: Briefcase },
        { key: 'profile_settings', label: 'Profile Settings',      icon: Settings },
      ] : []),
      { key: 'password',      label: 'Password & Security',   icon: Lock },
      { key: 'identity',      label: 'Identity Verification', icon: ShieldCheck },
      { key: 'notifications', label: 'Notification Settings', icon: Bell },
    ],
  },
  {
    section: 'Billing & Payments',
    items: [
      { key: 'membership', label: 'Membership',        icon: Sparkles },
      ...(role === 'freelancer' ? [{ key: 'withdrawals', label: 'Withdrawals', icon: ArrowDownToLine }] : []),
      { key: 'connected',  label: 'Connected Services', icon: Link2 },
    ],
  },
];

const NOTIF_SETTINGS = [
  { key: 'job_matches',       label: 'New job matches',   desc: 'When a job matches your skills' },
  { key: 'proposal_accepted', label: 'Proposal accepted', desc: 'When a client accepts your proposal' },
  { key: 'messages',          label: 'New messages',      desc: 'New messages from clients or team' },
  { key: 'payments',          label: 'Payment received',  desc: 'When milestone payments are released' },
  { key: 'contract_updates',  label: 'Contract updates',  desc: 'Status changes on your contracts' },
  { key: 'marketing',         label: 'Marketing & tips',  desc: 'News, tips, and special offers', default: false },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary-500' : 'bg-dark-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SectionHeader({ title, desc }) {
  return (
    <div className="pb-4 border-b border-dark-800">
      <h2 className="font-semibold text-white text-base">{title}</h2>
      {desc && <p className="text-sm text-dark-500 mt-0.5">{desc}</p>}
    </div>
  );
}

function IdentityVerification({ user, updateUser }) {
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const phoneVerified = user?.phone_verified ?? false;
  const hasPhone      = !!user?.phone;

  const handleVerifyPhone = async () => {
    if (!hasPhone) {
      toast.error('Please add your phone number in Contact Info first');
      return;
    }
    setVerifyingPhone(true);
    try {
      const res = await api.auth.verifyPhone();
      updateUser(res.data.user);
      toast.success('Phone number verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const items = [
    {
      label:    'Email Address',
      icon:     Mail,
      verified: true,
      desc:     user?.email,
      action:   null,
    },
    {
      label:    'Phone Number',
      icon:     Phone,
      verified: phoneVerified,
      desc:     phoneVerified
        ? user?.phone
        : hasPhone
          ? `${user.phone} — click Verify to confirm`
          : 'Add a phone number in Contact Info first',
      action: (
        <button
          onClick={handleVerifyPhone}
          disabled={verifyingPhone || !hasPhone}
          className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {verifyingPhone ? 'Verifying…' : 'Verify'}
        </button>
      ),
    },
    {
      label:    'Government ID',
      icon:     ShieldCheck,
      verified: false,
      desc:     'Upload a valid ID document',
      action:   <span className="text-xs text-dark-500 bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full">Coming soon</span>,
    },
    {
      label:    'Video Verification',
      icon:     ShieldCheck,
      verified: false,
      desc:     'Record a short verification video',
      action:   <span className="text-xs text-dark-500 bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full">Coming soon</span>,
    },
  ];

  return (
    <div className="card p-6 space-y-5">
      <SectionHeader title="Identity Verification" desc="Verify your identity to post jobs and build trust" />

      {!phoneVerified && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-xs text-dark-400 leading-relaxed">
            <span className="text-amber-400 font-medium">Phone verification required to post jobs.</span>{' '}
            Add your phone number in Contact Info, then click Verify below.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                item.verified ? 'border-green-500/25 bg-green-500/5' : 'border-dark-700 bg-dark-800/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.verified ? 'bg-green-500/15' : 'bg-dark-800'}`}>
                {item.verified
                  ? <Check className="w-4 h-4 text-green-400" strokeWidth={2.5} />
                  : <Icon className="w-4 h-4 text-dark-500" strokeWidth={1.75} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-dark-500 truncate mt-0.5">{item.desc}</p>
              </div>
              {item.verified
                ? <span className="text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full shrink-0">Verified</span>
                : item.action
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FreelancerSettings() {
  const { user, updateUser, logout } = useAuthStore();
  const [activeKey, setActiveKey] = useState('contact');
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState({});
  const NAV = getNav(user?.role);

  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
  });

  const [profileForm, setProfileForm] = useState({ title: '', bio: '' });

  const [profileSettings, setProfileSettings] = useState({
    visibility: 'public',
    availability: 'available',
    hourly_rate: '',
  });

  const [pwForm, setPwForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [notifState, setNotifState] = useState(
    Object.fromEntries(NOTIF_SETTINGS.map((n) => [n.key, n.default !== false]))
  );

  const saveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.auth.updateProfile(contactForm);
      updateUser(res.data.data);
      toast.success('Contact info updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) return toast.error('Passwords do not match');
    if (pwForm.password.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await api.auth.changePassword(pwForm);
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const avatar = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4361ff&color=fff&size=128`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">Settings</h1>
        <p className="text-sm text-dark-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left nav */}
        <aside className="w-52 shrink-0 space-y-5">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="text-2xs font-semibold text-dark-600 uppercase tracking-widest px-3 mb-1.5">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveKey(item.key)}
                      className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeKey === item.key
                          ? 'bg-dark-800 text-white'
                          : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${activeKey === item.key ? 'text-primary-400' : 'text-dark-600'}`} strokeWidth={activeKey === item.key ? 2 : 1.75} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Main panel */}
        <div className="flex-1 min-w-0">
          <motion.div key={activeKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {/* â”€â”€ Contact Info â”€â”€ */}
            {activeKey === 'contact' && (
              <div className="card p-6 space-y-5">
                <SectionHeader title="Contact Info" desc="Update your personal contact information" />
                <div className="flex items-center gap-4">
                  <img src={avatar} alt={user?.name} className="w-14 h-14 rounded-2xl ring-2 ring-dark-700 object-cover" />
                  <div>
                    <p className="font-semibold text-white">{user?.name}</p>
                    <p className="text-sm text-dark-500 capitalize">{user?.role} Â· {user?.email}</p>
                  </div>
                </div>
                <form onSubmit={saveContact} className="space-y-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input value={user?.email} className="input opacity-40 cursor-not-allowed" disabled />
                    <p className="text-xs text-dark-600 mt-1">Email cannot be changed</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Phone</label>
                      <input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="input" placeholder="+212 600 000 000" />
                    </div>
                    <div>
                      <label className="input-label">Country</label>
                      <input value={contactForm.country} onChange={(e) => setContactForm({ ...contactForm, country: e.target.value })} className="input" placeholder="Morocco" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Savingâ€¦' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* â”€â”€ My Profile â”€â”€ */}
            {activeKey === 'profile' && (
              <div className="card p-6 space-y-5">
                <SectionHeader title="My Profile" desc="Clients see this on your public profile page" />
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try { await api.freelancers.updateProfile(profileForm); toast.success('Profile updated'); }
                    catch { toast.error('Failed to update profile'); }
                    finally { setSaving(false); }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="input-label">Professional Title</label>
                    <input value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} className="input" placeholder="e.g. Full Stack Developer | React & Laravel Expert" />
                  </div>
                  <div>
                    <label className="input-label">Professional Overview</label>
                    <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} className="input h-36 resize-none" placeholder="Describe your skills, experience, and the value you bring to clientsâ€¦" />
                    <p className="text-xs text-dark-600 mt-1">{profileForm.bio.length}/1000 characters</p>
                  </div>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Savingâ€¦' : 'Save Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* â”€â”€ Profile Settings â”€â”€ */}
            {activeKey === 'profile_settings' && (
              <div className="card p-6 space-y-5">
                <SectionHeader title="Profile Settings" desc="Control your visibility and work preferences" />
                <div className="space-y-5">
                  <div>
                    <label className="input-label">Profile Visibility</label>
                    <div className="space-y-2 mt-2">
                      {[
                        { value: 'public',  label: 'Public',  desc: 'Visible to everyone on PANDA' },
                        { value: 'private', label: 'Private', desc: 'Only visible to clients you work with' },
                      ].map((opt) => (
                        <label key={opt.value} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${profileSettings.visibility === opt.value ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 hover:border-dark-600'}`}>
                          <input type="radio" name="visibility" value={opt.value} checked={profileSettings.visibility === opt.value} onChange={(e) => setProfileSettings({ ...profileSettings, visibility: e.target.value })} className="accent-primary-500" />
                          <div>
                            <div className="text-sm font-medium text-white">{opt.label}</div>
                            <div className="text-xs text-dark-500">{opt.desc}</div>
                          </div>
                          {profileSettings.visibility === opt.value && <Check className="w-4 h-4 text-primary-400 ml-auto shrink-0" strokeWidth={2.5} />}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Availability</label>
                    <select value={profileSettings.availability} onChange={(e) => setProfileSettings({ ...profileSettings, availability: e.target.value })} className="input">
                      <option value="available">Available for work</option>
                      <option value="busy">Busy â€” not taking new work</option>
                      <option value="selective">Selectively available</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Hourly Rate (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 text-sm">$</span>
                      <input type="number" value={profileSettings.hourly_rate} onChange={(e) => setProfileSettings({ ...profileSettings, hourly_rate: e.target.value })} className="input pl-8 pr-12" placeholder="50" min="5" />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-600 text-xs">/hr</span>
                    </div>
                    <p className="text-xs text-dark-600 mt-1">You keep 90% after the 10% platform fee</p>
                  </div>
                  <button onClick={() => toast.success('Profile settings saved')} className="btn btn-primary">
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* â”€â”€ Password & Security â”€â”€ */}
            {activeKey === 'password' && (
              <div className="space-y-4">
                <div className="card p-6 space-y-5">
                  <SectionHeader title="Password & Security" desc="Keep your account secure with a strong password" />
                  <form onSubmit={changePassword} className="space-y-4">
                    {[
                      { key: 'current_password', label: 'Current Password' },
                      { key: 'password', label: 'New Password' },
                      { key: 'password_confirmation', label: 'Confirm New Password' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="input-label">{f.label}</label>
                        <div className="relative">
                          <input type={showPw[f.key] ? 'text' : 'password'} value={pwForm[f.key]} onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })} className="input pr-10" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                          <button type="button" onClick={() => setShowPw((s) => ({ ...s, [f.key]: !s[f.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                            {showPw[f.key] ? <EyeOff className="w-4 h-4" strokeWidth={1.75} /> : <Eye className="w-4 h-4" strokeWidth={1.75} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={saving} className="btn btn-primary">
                      {saving ? 'Changingâ€¦' : 'Change Password'}
                    </button>
                  </form>
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="font-semibold text-white text-sm">Two-Factor Authentication</h3>
                  <p className="text-sm text-dark-500">Add an extra layer of security to your account.</p>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                    <div>
                      <p className="text-sm font-medium text-white">Authenticator App</p>
                      <p className="text-xs text-dark-500">Use an app like Google Authenticator</p>
                    </div>
                    <span className="text-xs text-dark-500 bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full">Coming soon</span>
                  </div>
                </div>

                <div className="card p-6 space-y-3 border border-red-900/30">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2} />
                    <h3 className="font-semibold text-white text-sm">Danger Zone</h3>
                  </div>
                  <p className="text-sm text-dark-500">These actions are permanent and cannot be undone.</p>
                  <button
                    onClick={async () => { if (window.confirm('Sign out of all devices?')) await logout(); }}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all"
                  >
                    Sign out of all devices
                  </button>
                </div>
              </div>
            )}

            {/* ── Identity Verification ── */}
            {activeKey === 'identity' && (
              <IdentityVerification user={user} updateUser={updateUser} />
            )}

            {/* â”€â”€ Notification Settings â”€â”€ */}
            {activeKey === 'notifications' && (
              <div className="card p-6 space-y-5">
                <SectionHeader title="Notification Settings" desc="Choose what you want to be notified about" />
                <div className="space-y-1">
                  {NOTIF_SETTINGS.map((n) => (
                    <div key={n.key} className="flex items-center justify-between py-3.5 border-b border-dark-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{n.label}</p>
                        <p className="text-xs text-dark-500 mt-0.5">{n.desc}</p>
                      </div>
                      <Toggle checked={notifState[n.key]} onChange={() => setNotifState((s) => ({ ...s, [n.key]: !s[n.key] }))} />
                    </div>
                  ))}
                </div>
                <button onClick={() => toast.success('Notification preferences saved')} className="btn btn-primary">
                  Save Preferences
                </button>
              </div>
            )}

            {/* â”€â”€ Membership â”€â”€ */}
            {activeKey === 'membership' && (
              <div className="space-y-4">
                <div className="card p-6 space-y-5">
                  <SectionHeader title="Membership Plan" desc="Your current subscription and available upgrades" />
                  <div className="p-5 rounded-2xl border border-primary-500/30 bg-primary-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-lg">Free Plan</p>
                        <p className="text-sm text-dark-400 mt-0.5">10 proposals/month Â· Standard visibility</p>
                      </div>
                      <span className="text-xs font-semibold bg-dark-800 border border-dark-700 text-dark-300 px-3 py-1.5 rounded-full">Active</span>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Pro',      price: '$14.99', proposals: '50 proposals/month',       perks: 'Top search placement' },
                      { name: 'Business', price: '$29.99', proposals: 'Unlimited proposals',       perks: 'Priority support + Featured badge' },
                    ].map((plan) => (
                      <div key={plan.name} className="p-5 rounded-2xl border border-dark-700 hover:border-primary-500/40 transition-all space-y-4">
                        <div>
                          <p className="font-bold text-white">{plan.name}</p>
                          <p className="text-2xl font-bold text-primary-400">{plan.price}<span className="text-sm text-dark-500 font-normal">/mo</span></p>
                        </div>
                        <ul className="space-y-2 text-xs text-dark-400">
                          {[plan.proposals, plan.perks].map((p) => (
                            <li key={p} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" strokeWidth={2} />
                              {p}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => toast('Upgrade coming soon')} className="w-full px-3 py-2 border border-primary-500/40 text-primary-400 hover:bg-primary-500/10 rounded-xl text-xs font-medium transition-all">
                          Upgrade to {plan.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* â”€â”€ Withdrawals â”€â”€ */}
            {activeKey === 'withdrawals' && (
              <div className="card p-6 space-y-5">
                <SectionHeader title="Withdrawals" desc="Manage how you receive your earnings" />
                <div className="space-y-3">
                  {[
                    { label: 'Bank Transfer (ACH)', icon: Building2, desc: 'Direct to your bank account' },
                    { label: 'PayPal',              icon: Globe,     desc: 'Send to your PayPal account' },
                    { label: 'Wise',                icon: Globe,     desc: 'Low-fee international transfers' },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.label} className="flex items-center gap-4 p-4 rounded-xl border border-dark-700 bg-dark-800/30">
                        <div className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-dark-500" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{method.label}</p>
                          <p className="text-xs text-dark-500">{method.desc}</p>
                        </div>
                        <span className="text-xs text-dark-500 bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full">Coming soon</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-dark-600">Withdrawal methods will be available in the next release. Funds are held safely in your wallet in the meantime.</p>
              </div>
            )}

            {/* â”€â”€ Connected Services â”€â”€ */}
            {activeKey === 'connected' && (
              <div className="card p-6 space-y-5">
                <SectionHeader title="Connected Services" desc="Apps and services connected to your account" />
                <div className="space-y-3">
                  {[
                    { label: 'Google',   icon: Globe,   desc: 'Sign in with Google Â· SSO' },
                    { label: 'GitHub',   icon: GitBranch, desc: 'Show your repositories on profile' },
                    { label: 'LinkedIn', icon: Globe,   desc: 'Import profile data' },
                  ].map((svc) => {
                    const Icon = svc.icon;
                    return (
                      <div key={svc.label} className="flex items-center gap-4 p-4 rounded-xl border border-dark-700 bg-dark-800/30">
                        <div className="w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-dark-400" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{svc.label}</p>
                          <p className="text-xs text-dark-500">{svc.desc}</p>
                        </div>
                        <button onClick={() => toast(`${svc.label} integration coming soon`)} className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                          Connect
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}

