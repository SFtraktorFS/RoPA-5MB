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

export default function AdminPage() {
  const [ropaRecords, setRopaRecords] = useState<ROPA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterValues, setFilterValues] = useState({
    legal_basis: '',
    status: '',
    retention_period: '',
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  const fetchRopaRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/admin/ropa`);
      const data = await response.json();
      if (data.status === 'success') {
        setRopaRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching ROPA records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRopaRecords();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilter = async () => {
    setShowFilterModal(false);
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filterValues.legal_basis) params.append('legal_basis', filterValues.legal_basis);
      if (filterValues.status) params.append('status', filterValues.status);
      if (filterValues.retention_period) params.append('retention_period', filterValues.retention_period);

      const response = await fetch(`${API_BASE}/admin/ropa/filter?${params.toString()}`);
      const data = await response.json();
      if (data.status === 'success') {
        setRopaRecords(data.data);
      }
    } catch (error) {
      console.error('Error filtering ROPA records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setFilterValues({ legal_basis: '', status: '', retention_period: '' });
    await fetchRopaRecords();
  };

  const activeCount = ropaRecords.filter((r) => r.status === 'active').length;
  const consentCount = ropaRecords.filter((r) => r.legal_basis === 'consent').length;
  const averageRetention =
    ropaRecords.length > 0
      ? Math.round(
          ropaRecords.reduce((sum, r) => sum + r.retention_period, 0) /
            ropaRecords.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                ROPA Master
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                แผงควบคุม (Dashboard)
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                ดูภาพรวมข้อมูล ROPA ทั้งหมด พร้อมจัดการข้อมูลการประมวลผลส่วนบุคคล
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                 จัดการบัญชี
              </Link>
              <Link
                href="/admin/approval"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                 อนุมัติ
              </Link>
              <Link
                href="/records"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                ดูบันทึกทั้งหมด
              </Link>
              <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                🔍 กรองข้อมูล
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                ออกจากระบบ
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="กิจกรรมทั้งหมด" value={ropaRecords.length} desc="จำนวน Record ทั้งหมด" />
          <StatCard 
            title="สถานะ Active" 
            value={`${ropaRecords.length === 0 ? 0 : Math.round((activeCount / ropaRecords.length) * 100)}%`} 
            desc="เปอร์เซ็นต์ข้อมูลที่ใช้งานอยู่"
            color="text-emerald-600"
          />
          <StatCard title="ค่าเฉลี่ย Retention" value={`${averageRetention} วัน`} desc="ระยะเวลาเก็บข้อมูลเฉลี่ย" />
          <StatCard title="ฐานทางกฎหมาย (Consent)" value={consentCount} desc="รายการที่ใช้ความยินยอม" />
        </section>

        <section className="grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">รายการล่าสุด</h2>
              <button
                onClick={fetchRopaRecords}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                รีเฟรช
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : ropaRecords.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                ยังไม่มีบันทึก ROPA
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Legal Basis</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ropaRecords.map((record) => (
                      <tr key={record.id} className="bg-slate-50 transition hover:bg-slate-100">
                        <td className="rounded-l-2xl px-4 py-4 text-sm font-medium">{record.id}</td>
                        <td className="px-4 py-4 text-sm">{record.purpose}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{record.legal_basis}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            record.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                          }`}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4 text-sm">{record.retention_period} วัน</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showFilterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">กรองข้อมูล ROPA</h3>
                    <p className="text-sm text-slate-500">เลือกตัวกรองแล้วกดยืนยันเพื่อดูผล</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(false)}
                    className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ฐานทางกฎหมาย</label>
                    <select
                      name="legal_basis"
                      value={filterValues.legal_basis}
                      onChange={handleFilterChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="consent">Consent</option>
                      <option value="not_consent">Not Consent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">สถานะ</label>
                    <select
                      name="status"
                      value={filterValues.status}
                      onChange={handleFilterChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">เวลาเก็บรักษา (ปี)</label>
                    <input
                      type="number"
                      name="retention_period"
                      value={filterValues.retention_period}
                      onChange={handleFilterChange}
                      min={1}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                      placeholder="เช่น 1"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    ล้างตัวกรอง
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    กรองข้อมูล
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, desc, color = 'text-slate-900' }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-4 text-3xl font-semibold ${color}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}