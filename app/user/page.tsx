'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ROPA {
  id: number;
  purpose: string;
  data_subject: string;
  data_category: string;
  legal_basis: string;
  retention_period: number;
  status: string;
  created_at: string;
}

export default function UserPage() {
  const [records, setRecords] = useState<ROPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/user/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = records.filter((r) => r.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">RoPA User</p>
              <h1 className="text-2xl font-bold text-slate-900">แผงควบคุม</h1>
              <p className="text-sm text-slate-600">สวัสดี, {username}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/create"
                className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + สร้างคำขอ
              </Link>
              <Link
                href="/"
                className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                ออกจากระบบ
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">รายการทั้งหมด</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{records.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">ใช้งานอยู่</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-600">{activeCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">รออนุมัติ</p>
            <p className="mt-4 text-3xl font-semibold text-yellow-600">-</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">รายการของคุณ</h2>
          {loading ? (
            <div className="py-12 text-center text-slate-500">กำลังโหลด...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-slate-500">ยังไม่มีรายการ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Data Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Legal Basis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Retention</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm">{record.purpose}</td>
                      <td className="px-4 py-4 text-sm">{record.data_subject}</td>
                      <td className="px-4 py-4 text-sm">{record.legal_basis}</td>
                      <td className="px-4 py-4 text-sm">{record.retention_period} ปี</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}