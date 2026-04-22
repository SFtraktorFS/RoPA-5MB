"use client";

import { useState, useEffect } from "react";

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

export default function Home() {
  const [ropaRecords, setRopaRecords] = useState<ROPA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ROPA | null>(null);
  const [editForm, setEditForm] = useState({
    purpose: '',
    data_subject: '',
    data_category: '',
    legal_basis: '',
    retention_period: 0,
    status: '',
  });
  const [filterValues, setFilterValues] = useState({
    legal_basis: '',
    status: '',
    retention_period: '',
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3340";

  // ฟังก์ชันดึงข้อมูล
  const fetchRopaRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/ropa`); // แก้ไข: ใส่ backtick
      const data = await response.json();
      if (data.status === "success") {
        setRopaRecords(data.data);
      }
    } catch (error) {
      console.error("Error fetching ROPA records:", error);
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

      const response = await fetch(`${API_BASE}/ropa/filter?${params.toString()}`);
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

  const handleEditClick = (record: ROPA) => {
    setSelectedRecord(record);
    setEditForm({
      purpose: record.purpose,
      data_subject: record.data_subject,
      data_category: record.data_category,
      legal_basis: record.legal_basis,
      retention_period: record.retention_period,
      status: record.status,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === 'retention_period' ? parseInt(value) || 0 : value }));
  };

  const handleEditSubmit = async () => {
    if (!selectedRecord) return;
    try {
      const response = await fetch(`${API_BASE}/ropa/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowEditModal(false);
        await fetchRopaRecords();
      }
    } catch (error) {
      console.error('Error updating ROPA record:', error);
    }
  };

  // คำนวณค่าต่างๆ (Derived State)
  const activeCount = ropaRecords.filter((r) => r.status === "active").length;
  const consentCount = ropaRecords.filter((r) => r.legal_basis === "consent").length;
  const averageRetention =
    ropaRecords.length > 0
      ? Math.round(
          ropaRecords.reduce((sum, r) => sum + r.retention_period, 0) /
            ropaRecords.length
        )
      : 0;

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ── Hero Section ── */}
        <header className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-blue-900/5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-medium uppercase tracking-wider text-blue-700">RoPA Master</p>
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                ยินดีต้อนรับสู่ระบบ
              </h1>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RoPA Master
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                จัดการข้อมูลการประมวลผลส่วนบุคคล (ROPA) ขององค์กรคุณอย่างมีประสิทธิภาพ
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                + เพิ่มข้อมูลใหม่
              </a>
              <a
                href="/ropa"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-4 text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-white hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ดูบันทึกทั้งหมด
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-4 text-sm font-semibold text-slate-700 shadow-md transition-all hover:bg-white hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ดู Dashboard
              </a>
            </div>
          </div>
        </header>

        {/* ── Quick Stats ── */}
        {ropaRecords.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickStatCard 
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="กิจกรรมทั้งหมด"
              value={ropaRecords.length}
              desc="Record ทั้งหมด"
              color="blue"
            />
            <QuickStatCard 
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="กำลังใช้งาน"
              value={activeCount}
              desc={`${ropaRecords.length === 0 ? 0 : Math.round((activeCount / ropaRecords.length) * 100)}% ของทั้งหมด`}
              color="emerald"
            />
            <QuickStatCard 
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="ค่าเฉลี่ย Retention"
              value={`${averageRetention} ปี`}
              desc="ระยะเวลาเก็บข้อมูล"
              color="amber"
            />
            <QuickStatCard 
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="ฐานทางกฎหมาย"
              value={consentCount}
              desc="ใช้ความยินยอม"
              color="violet"
            />
          </section>
        )}

        {/* ── Empty State ── */}
        {ropaRecords.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">ยังไม่มีข้อมูล ROPA</h2>
            <p className="mt-2 text-slate-600 max-w-md">เริ่มต้นการจัดการข้อมูลการประมวลผลส่วนบุคคลโดยการเพิ่มรายการแรกของคุณ</p>
            <a
              href="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มข้อมูล ROPA ของคุณ
            </a>
          </div>
        )}
        
      </div>
    </div>
  );
}

// ── Components ──

function QuickStatCard({ icon, title, value, desc, color = "blue" }: any) {
  const colorClasses: any = {
    blue: "from-blue-50 to-blue-100/50 border-blue-100 text-blue-600",
    emerald: "from-emerald-50 to-emerald-100/50 border-emerald-100 text-emerald-600",
    amber: "from-amber-50 to-amber-100/50 border-amber-100 text-amber-600",
    violet: "from-violet-50 to-violet-100/50 border-violet-100 text-violet-600",
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorClasses[color]} p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-current/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-start justify-between">
        <div className="p-2 rounded-xl bg-white/60 backdrop-blur">
          {icon}
        </div>
        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div className="relative mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-600">{desc}</p>
      </div>
    </div>
  );
}