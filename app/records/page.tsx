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
  expiration_date?: string;
  created_at: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<ROPA[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ropa`);
      const data = await response.json();
      if (data.status === 'success') {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Purpose', 'Data Subject', 'Data Category', 'Legal Basis', 'Retention Period', 'Status', 'Created At'];
    const rows = records.map(r => [
      r.id,
      r.purpose,
      r.data_subject,
      r.data_category,
      r.legal_basis,
      r.retention_period,
      r.status,
      new Date(r.created_at).toLocaleDateString('th-TH')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ropa-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">รายการบันทึกกิจกรรม (RoPA)</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={records.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Export CSV
            </button>
            <Link href="/create" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              + เพิ่มเติมห้อ
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-slate-500">ยังไม่มีบันทึก ROPA</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สิ่งบันทึก</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ข้อมูลประเมินการจองทะเบียน</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ระยะเวลาการเก็บรักษา</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ประเภทข้อมูล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ตัวเลือก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.purpose}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{record.data_category}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{record.retention_period} ปี</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{record.data_subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-red-600 hover:text-red-700 font-semibold">🗑️</button>
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