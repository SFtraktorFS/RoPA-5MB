'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username || username);
        
        const userRole = data.role?.toLowerCase() || 'user';
        localStorage.setItem('role', userRole);
        
        if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      } else {
        setError(data.detail || 'Invalid username or password');
        if (data.detail && data.detail.includes('Invalid')) {
          const setupRes = await fetch(`${API_BASE}/setup`);
          const setupData = await setupRes.json();
          if (setupData.status === 'success' || setupData.status === 'exists') {
            setError('ระบบได้สร้าง admin ใหม่ กรุณาล็อกอินอีกครั้ง: adminOwen / Owen123');
          }
        }
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm text-gray-600">RoPA System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-blue-500 focus:bg-white outline-none transition"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black focus:border-blue-500 focus:bg-white outline-none transition"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 border border-red-200 rounded-lg p-3 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}