import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Trash2, 
  ShieldCheck,
  Building2,
  Mail,
  BadgeCheck,
  Shield,
  Layers,
  Sparkles,
  UserPlus,
  Users,
  Key,
  Copy,
  Check,
  ShieldAlert,
  Fingerprint,
  Activity,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const AVAILABLE_PERMISSIONS = [
  { id: 'VIEW_DASHBOARD', label: 'View Dashboard & Telemetry', desc: 'Real-time incident rates, risk index, and facility tracking' },
  { id: 'SUBMIT_OBSERVATION', label: 'Submit Incident / Observation', desc: 'Create new field reports, SIF precursor observations' },
  { id: 'VIEW_REPORTS', label: 'Access All Safety Reports', desc: 'Browse comprehensive incident dossiers and safety logs' },
  { id: 'VIEW_SIGNALS', label: 'Analyze Weak Signals', desc: 'View AI correlation analysis, anomalies, and precursor alerts' },
  { id: 'MANAGE_USERS', label: 'Manage & Provision Users', desc: 'Authority to create, modify, and revoke platform user logins' },
  { id: 'REPORTS_EDIT', label: 'Approve & Edit Reports', desc: 'Review, modify, and sign off official HSE incident investigations' },
  { id: 'UPDATE_PRECURSOR_STATUS', label: 'Update Precursor Mitigation', desc: 'Verify and transition SIF precursor mitigation barricades' },
  { id: 'RESET_DATA', label: 'Reset Baseline Telemetry', desc: 'Administrative authority to wipe operational telemetry data' },
];

export default function SettingsView({ onNavigate }) {
  const { user, updateUser } = useAuth();
  const isAdmin = Boolean(
    user?.is_admin || 
    user?.role === 'ADMINISTRATOR' || 
    user?.role_name === 'Administrator' || 
    (user?.email && user.email.toLowerCase().includes('admin'))
  );

  // Profile States
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef(null);

  // Synchronize if user changes in auth
  useEffect(() => {
    if (user?.full_name && !fullName) {
      setFullName(user.full_name);
    }
    if (user?.avatar && !avatarPreview) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  // User Provisioning States (Admin)
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserOrgId, setNewUserOrgId] = useState(user?.organization_id || 'id001');
  const [newUserRole, setNewUserRole] = useState('NORMAL_USER');
  const [newUserPermissions, setNewUserPermissions] = useState([
    'VIEW_DASHBOARD', 
    'SUBMIT_OBSERVATION', 
    'VIEW_REPORTS', 
    'VIEW_SIGNALS'
  ]);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userCreateSuccess, setUserCreateSuccess] = useState('');
  const [userCreateError, setUserCreateError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Load existing users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle Role Change -> auto-adjust permission presets
  const handleRoleChange = (role) => {
    setNewUserRole(role);
    if (role === 'ADMINISTRATOR') {
      setNewUserPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
    } else if (role === 'HSE_SPECIALIST') {
      setNewUserPermissions([
        'VIEW_DASHBOARD', 
        'SUBMIT_OBSERVATION', 
        'VIEW_REPORTS', 
        'VIEW_SIGNALS', 
        'UPDATE_PRECURSOR_STATUS'
      ]);
    } else {
      setNewUserPermissions([
        'VIEW_DASHBOARD', 
        'SUBMIT_OBSERVATION', 
        'VIEW_REPORTS', 
        'VIEW_SIGNALS'
      ]);
    }
  };

  // Toggle individual permission
  const togglePermission = (permId) => {
    setNewUserPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId) 
        : [...prev, permId]
    );
  };

  // Select All permissions
  const handleSelectAllPermissions = () => {
    setNewUserPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
  };

  // Reset to Default permissions
  const handleResetPermissions = () => {
    setNewUserPermissions([
      'VIEW_DASHBOARD', 
      'SUBMIT_OBSERVATION', 
      'VIEW_REPORTS', 
      'VIEW_SIGNALS'
    ]);
  };

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserCreateError('');
    setUserCreateSuccess('');

    const cleanName = newUserName.trim();
    const cleanEmail = newUserEmail.trim().toLowerCase();
    const cleanPassword = newUserPassword.trim();
    const cleanOrg = newUserOrgId.trim().toLowerCase() || 'id001';

    if (!cleanName) {
      setUserCreateError('Please enter user full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setUserCreateError('Please enter a valid login email address.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 5) {
      setUserCreateError('Password must be at least 5 characters in length.');
      return;
    }
    if (newUserPermissions.length === 0) {
      setUserCreateError('Please grant at least one access permission.');
      return;
    }

    setIsCreatingUser(true);

    try {
      const payload = {
        full_name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        organization_id: cleanOrg,
        role: newUserRole,
        permissions: newUserPermissions
      };

      await api.createUser(payload);

      setUserCreateSuccess(`User "${cleanName}" (${cleanEmail}) provisioned successfully! This user can now log in immediately.`);
      
      // Clear fields
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('NORMAL_USER');
      setNewUserPermissions([
        'VIEW_DASHBOARD', 
        'SUBMIT_OBSERVATION', 
        'VIEW_REPORTS', 
        'VIEW_SIGNALS'
      ]);

      // Reload list
      await loadUsers();

      setTimeout(() => setUserCreateSuccess(''), 7000);
    } catch (err) {
      setUserCreateError(err.message || 'Failed to create user account.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser) => {
    if (targetUser.email === 'admin1@gmail.com' || targetUser.email === 'admin2@gmail.com') {
      alert('Root primary administrator accounts cannot be deleted.');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to revoke and delete login credentials for ${targetUser.full_name} (${targetUser.email})?`);
    if (!confirmDelete) return;

    setDeletingUserId(targetUser.id);
    try {
      await api.deleteUser(targetUser.id, targetUser.email);
      setUsersList(prev => prev.filter(u => u.id !== targetUser.id && u.email !== targetUser.email));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingUserId(null);
    }
  };

  // Copy Login Credentials
  const handleCopyCredentials = (u) => {
    const text = `SafetyAI Login Credentials:\nOrganization ID: ${u.organization_id || 'id001'}\nEmail: ${u.email}\nRole: ${u.role_name || u.role}\nPlatform: http://localhost:3000`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEmail(u.email);
      setTimeout(() => setCopiedEmail(null), 2500);
    });
  };

  // Handle Avatar File Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image file size must be less than 5MB.');
      return;
    }

    setProfileError('');
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target.result;
      setAvatarPreview(dataUrl);
      if (updateUser) {
        updateUser({ avatar: dataUrl });
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3500);
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (updateUser) {
      updateUser({ avatar: null });
    }
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  // Handle Save Profile Name
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    if (updateUser) {
      updateUser({ full_name: fullName.trim(), avatar: avatarPreview });
    }
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  // Avatar Initials
  const userInitials = (fullName || user?.full_name || 'HSE')
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF5A36] shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Platform Settings &amp; User Provisioning
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-12">
            Manage your personal profile icon, customize display identity, and provision user logins with role-based access.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isAdmin ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            <span>Role: {user?.role_name || (isAdmin ? 'Administrator' : 'Normal User')}</span>
          </span>
        </div>
      </div>

      {/* 2. Top Row: Profile & Icon (Left) + Active Session & Security Context (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: User Profile & Icon Upload (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE6E1] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#EAE6E1] flex items-center justify-between bg-[#FAF8F5]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/60 text-[#FF5A36] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Profile Details &amp; User Icon
                </h2>
                <p className="text-[11px] text-slate-500">
                  Update your display name and upload a profile photo as your account icon
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-emerald-600" />
              Verified Account
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-6">
            
            {/* Success / Error Alerts */}
            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your profile name and avatar icon have been updated and synchronized!</span>
              </div>
            )}
            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Avatar Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                User Icon / Avatar Photo
              </label>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
                
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="User Avatar Preview" 
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF5A36] shadow-md ring-2 ring-orange-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FFA133] text-white flex items-center justify-center font-black text-xl shadow-md ring-2 ring-orange-100">
                      {userInitials}
                    </div>
                  )}

                  {/* Camera icon badge */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload new icon"
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-[#FF5A36] transition-colors cursor-pointer border-2 border-white"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Controls & Instructions */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF5A36] hover:bg-[#E04826] text-white transition-all shadow-xs cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload New Image</span>
                    </button>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Upload an image to personalize your account. It will appear across the Top Navigation bar, Left Sidebar, and Audit Dossiers.
                  </p>
                </div>

              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="user-full-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name / Display Name
              </label>
              <input
                id="user-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mousumi Borah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6E1] bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/20 focus:border-[#FF5A36] transition-all"
              />
              <p className="text-[11px] text-slate-500">
                This name is reflected in real time across the application header, sidebar, and incident review approvals.
              </p>
            </div>

            {/* Read-only Context Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>Email Address</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 truncate">
                  {user?.email || 'admin1@gmail.com'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]/80 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>Access Role</span>
                </div>
                <div className="text-xs font-bold text-[#FF5A36] truncate">
                  {user?.role_name || (user?.is_admin ? 'Administrator' : 'Normal User')}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Update Profile &amp; Name</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Active Session & Security Context (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE6E1] shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-[#EAE6E1] flex items-center justify-between bg-[#FAF8F5]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-heading">
                  Active Security Credentials
                </h2>
                <p className="text-[11px] text-slate-500">
                  Current authentication state and granted permissions
                </p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Session Active"></span>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Identity Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Signed In As</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  Tenant: {user?.organization_id || 'id001'}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{user?.full_name || 'Safety Officer'}</div>
                <div className="text-xs font-mono text-slate-500">{user?.email || 'admin1@gmail.com'}</div>
              </div>
              <div className="pt-2 border-t border-[#EAE6E1] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Authorization Level:</span>
                <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                  isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
                }`}>
                  {user?.role_name || (isAdmin ? 'Administrator' : 'Normal User')}
                </span>
              </div>
            </div>

            {/* Active Granted Permissions */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                <span>Granted Access Privileges</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
                {(user?.permissions || ['VIEW_DASHBOARD', 'SUBMIT_OBSERVATION', 'VIEW_REPORTS', 'VIEW_SIGNALS']).map((perm) => (
                  <span 
                    key={perm}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-white border border-[#EAE6E1] text-slate-700 shadow-2xs"
                  >
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>{perm}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Security Session Note */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>RBAC Security Policy</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                All telemetry access, observation submission, and precursor approvals are strictly verified against your token claims.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Dedicated Section: Manual User Provisioning & Access Management */}
      <div className="bg-white rounded-2xl border border-[#EAE6E1] shadow-xs overflow-hidden">
        
        {/* Section Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE6E1] bg-gradient-to-r from-[#FAF8F5] to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  User Account Provisioning &amp; Access Control
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manually register and configure employee logins with customized passwords, roles, and granular access permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              disabled={loadingUsers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] border border-[#EAE6E1] text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-[#FF5A36]' : 'text-slate-400'}`} />
              <span>{loadingUsers ? 'Refreshing...' : 'Refresh Users'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 lg:p-8 space-y-8">

          {/* Form to Add User */}
          <form onSubmit={handleCreateUser} className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6E1]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#FF5A36] text-white flex items-center justify-center text-xs font-bold">
                  +
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Manually Add User Login
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Created logins will reflect immediately at the login portal
              </span>
            </div>

            {/* Success / Error Alerts */}
            {userCreateSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm">User Login Created!</div>
                  <div>{userCreateSuccess}</div>
                  <div className="text-[11px] text-emerald-700 font-mono pt-1">
                    Tip: You can log out or open an incognito tab to log in with these new credentials right now.
                  </div>
                </div>
              </div>
            )}
            {userCreateError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{userCreateError}</span>
              </div>
            )}

            {/* Input Row 1: Name, Email, Password */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name / Officer Name <span className="text-[#FF5A36]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EAE6E1] bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/20 focus:border-[#FF5A36] transition-all"
                  />
                </div>
              </div>

              {/* Login Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Login Email / Username <span className="text-[#FF5A36]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@oilindia.in"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EAE6E1] bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/20 focus:border-[#FF5A36] transition-all"
                  />
                </div>
              </div>

              {/* Login Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Set Account Password <span className="text-[#FF5A36]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimum 5 characters"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#EAE6E1] bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/20 focus:border-[#FF5A36] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Input Row 2: Role Selection & Tenant ID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Role Selection */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assign User Role <span className="text-[#FF5A36]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('NORMAL_USER')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newUserRole === 'NORMAL_USER'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200'
                        : 'bg-white border-[#EAE6E1] hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Normal User</div>
                    <div className="text-[10px] text-slate-500">Field reporting &amp; telemetry</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('HSE_SPECIALIST')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newUserRole === 'HSE_SPECIALIST'
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200'
                        : 'bg-white border-[#EAE6E1] hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">HSE Specialist</div>
                    <div className="text-[10px] text-slate-500">Precursor barricade approvals</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('ADMINISTRATOR')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newUserRole === 'ADMINISTRATOR'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                        : 'bg-white border-[#EAE6E1] hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Administrator</div>
                    <div className="text-[10px] text-slate-500">Full administrative authority</div>
                  </button>
                </div>
              </div>

              {/* Tenant Org ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Organization Tenant ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={newUserOrgId}
                    onChange={(e) => setNewUserOrgId(e.target.value)}
                    placeholder="id001"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EAE6E1] bg-white text-slate-900 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/20 focus:border-[#FF5A36] transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Granular Permissions Section */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Granular Access Permissions &amp; Capabilities
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select the platform features this user account is permitted to access.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-[11px] font-bold text-[#FF5A36] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleResetPermissions}
                    className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                  >
                    Standard User
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = newUserPermissions.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-white border-[#FF5A36] shadow-xs'
                          : 'bg-white/60 border-[#EAE6E1] hover:border-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 text-[#FF5A36]">
                        {isChecked ? <CheckSquare className="w-4 h-4 fill-orange-50" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold truncate ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                          {perm.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {perm.id}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Submit Button */}
            <div className="pt-3 flex items-center justify-between border-t border-[#EAE6E1]">
              <span className="text-xs text-slate-500">
                {newUserPermissions.length} permission(s) selected
              </span>
              <button
                type="submit"
                disabled={isCreatingUser}
                className="px-6 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#E04826] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isCreatingUser ? 'Provisioning Account...' : 'Create & Provision User Login'}</span>
              </button>
            </div>

          </form>

          {/* Provisioned Users Directory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5A36]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Provisioned Platform Users ({usersList.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Authorized accounts can log in using their credentials
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersList.map((u) => {
                const isItemAdmin = u.is_admin || u.role === 'ADMINISTRATOR' || (u.email && u.email.includes('admin'));
                const isRootAdmin = u.email === 'admin1@gmail.com' || u.email === 'admin2@gmail.com';
                const initials = (u.full_name || 'User')
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={u.id || u.email}
                    className="p-4 rounded-2xl bg-white border border-[#EAE6E1] hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Row: User Avatar + Name + Role Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isItemAdmin
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-sky-100 text-sky-900 border border-sky-200'
                          }`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {u.full_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isItemAdmin
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}>
                          {u.role_name || (isItemAdmin ? 'Administrator' : 'Normal User')}
                        </span>
                      </div>

                      {/* Permissions Tags */}
                      <div className="mt-3 pt-3 border-t border-[#EAE6E1]/70">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                          Granted Access Rights ({u.permissions?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {(u.permissions || []).slice(0, 4).map((p) => (
                            <span 
                              key={p} 
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF8F5] text-slate-600 border border-[#EAE6E1]"
                            >
                              {p}
                            </span>
                          ))}
                          {(u.permissions?.length || 0) > 4 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                              +{(u.permissions.length - 4)} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-[#EAE6E1] flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-400">
                        Org: {u.organization_id || 'id001'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(u)}
                          title="Copy login details"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FAF8F5] hover:bg-slate-100 text-slate-700 border border-[#EAE6E1] transition-all cursor-pointer"
                        >
                          {copiedEmail === u.email ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {!isRootAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            disabled={deletingUserId === u.id}
                            title="Delete User"
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
