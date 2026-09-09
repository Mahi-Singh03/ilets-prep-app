"use client";

import { useEffect, useState } from 'react';

function normalizeAvatarUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('googleusercontent.com') || parsed.hostname.includes('lh3.googleusercontent.com')) {
      return parsed.toString();
    }

    return url;
  } catch (error) {
    return url;
  }
}

export default function GoogleAccessManager({ adminToken }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken || ''}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Unable to load users');
      }

      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setMessage(error.message || 'Unable to load Google users');
    } finally {
      setLoading(false);
    }
  };

  const updateAccess = async (userId, nextAccess) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken || ''}`,
        },
        body: JSON.stringify({ userId, canAccess: nextAccess }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to update access');
      }

      setMessage(`Access ${nextAccess ? 'granted' : 'revoked'} for ${data.user?.name || 'user'}.`);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || 'Unable to update access');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <section className="rounded-3xl border p-6" style={{ backgroundColor: 'var(--cardBg)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-black uppercase tracking-[.2em]" style={{ color: 'var(--muted)' }}>Admin</div>
          <h3 className="text-2xl font-black mt-2" style={{ color: 'var(--text)' }}>Google User Access</h3>
        </div>
        <button className="px-4 py-2 rounded-2xl font-bold" style={{ backgroundColor: 'var(--primary)', color: '#fff' }} onClick={loadUsers}>
          Refresh
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-2xl px-4 py-3 text-sm font-bold" style={{ backgroundColor: 'var(--accent)', color: 'var(--primary)' }}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>Loading Google users...</div>
      ) : users.length === 0 ? (
        <div className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>No Google users found.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between gap-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  {user.image ? (
                    <img src={normalizeAvatarUrl(user.image)} alt={user.name || 'Google user'} className="w-full h-full object-cover" onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '';
                      event.currentTarget.style.display = 'none';
                      const parent = event.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('span');
                        fallback.className = 'font-black text-sm';
                        fallback.style.color = 'var(--primary)';
                        fallback.innerText = (user.name || user.email || 'G').slice(0, 1).toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }} />
                  ) : (
                    <span className="font-black">{(user.name || user.email || 'G').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="font-black" style={{ color: 'var(--text)' }}>{user.name || 'Google User'}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: user.canAccess ? 'var(--success)' : 'var(--error)', color: '#fff' }}>
                  {user.canAccess ? 'Access Granted' : 'Access Denied'}
                </span>
                <button
                  disabled={saving}
                  className="rounded-2xl px-4 py-2 font-bold text-sm"
                  style={{ backgroundColor: user.canAccess ? 'var(--error)' : 'var(--success)', color: '#fff' }}
                  onClick={() => updateAccess(user._id, !user.canAccess)}
                >
                  {saving ? 'Saving...' : user.canAccess ? 'Revoke Access' : 'Grant Access'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
