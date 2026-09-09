"use client";

import { useEffect, useState } from 'react';
import GoogleAccessManager from '@/src/app/components/admin/GoogleAccessManager';

export default function UserAccessPage() {
  const [adminToken, setAdminToken] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';
    setAdminToken(token);
  }, []);

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
      <section className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-[.2em]" style={{ color: 'var(--muted)' }}>Admin Console</div>
          <h1 className="text-4xl font-black mt-3" style={{ color: 'var(--text)' }}>Google User Access</h1>
        </div>
        <GoogleAccessManager adminToken={adminToken} />
      </section>
    </main>
  );
}
