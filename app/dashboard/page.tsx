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

export default function Dashboard() {
  const [ropaRecords, setRopaRecords] = useState<ROPA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3340";

  const fetchRopaRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/ropa`);
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

  // Calculate derived data
  const activeCount = ropaRecords.filter((r) => r.status === "active").length;
  const consentCount = ropaRecords.filter((r) => r.legal_basis === "consent").length;
  const averageRetention =
    ropaRecords.length > 0
      ? Math.round(
          ropaRecords.reduce((sum, r) => sum + r.retention_period, 0) /
            ropaRecords.length
        )
      : 0;
  
  const activePercent = ropaRecords.length === 0 ? 0 : Math.round((activeCount / ropaRecords.length) * 100);
  const consentPercent = ropaRecords.length === 0 ? 0 : Math.round((consentCount / ropaRecords.length) * 100);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  ropaRecords.forEach(r => {
    categoryCounts[r.data_category] = (categoryCounts[r.data_category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-6 top-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-slate-200 transition hover:bg-white"
        aria-label="เปิดเมนู"
      >
        <span className="flex h-6 w-6 flex-col justify-between">
          <span className="block h-0.5 w-5 rounded-full bg-slate-900"></span>
          <span className="block h-0.5 w-5 rounded-full bg-slate-900"></span>
          <span className="block h-0.5 w-5 rounded-full bg-slate-900"></span>
        </span>
      </button>

      <div className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 max-w-full overflow-hidden bg-white/95 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">เมนูหลัก</h2>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            aria-label="ปิดเมนู"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6 space-y-3">
          <a href="/main" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
            หน้าแรก
          </a>
          <a href="/create" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
            เพิ่มข้อมูลใหม่
          </a>
          <a href="/ropa" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
            ดูบันทึกทั้งหมด
          </a>
          <a href="/dashboard" className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
            ดู Dashboard
          </a>
        </div>
      </aside>
        
        {/* ── Header ── */}
        <header className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-blue-900/5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-700">Dashboard</p>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              สถิติและภาพรวมข้อมูล ROPA
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-600">
              ติดตามและวิเคราะห์ข้อมูลการประมวลผลส่วนบุคคลขององค์กร
            </p>
          </div>
        </header>

        {/* ── Stats Section ── */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard 
            title="กิจกรรมทั้งหมด"
            value={ropaRecords.length}
            desc="จำนวน Record"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            color="blue"
          />
          <StatCard 
            title="สถานะ Active" 
            value={`${activePercent}%`} 
            desc={`${activeCount} รายการ`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="emerald"
          />
          <StatCard 
            title="ค่าเฉลี่ย Retention" 
            value={`${averageRetention} ปี`} 
            desc="ระยะเวลาเก็บข้อมูล"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="amber"
          />
          <StatCard 
            title="ฐาน Consent" 
            value={consentCount} 
            desc={`${consentPercent}% ของทั้งหมด`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            color="violet"
          />
        </section>

        {/* ── Progress Bars Section ── */}
        {ropaRecords.length > 0 && (
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Status Distribution */}
            <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">สถานะกิจกรรม</h3>
              <p className="mt-1 text-sm text-slate-500">สัดส่วนสถานะของกิจกรรมทั้งหมด</p>
              
              <div className="mt-6 space-y-4">
                <ProgressBar label="Active" value={activePercent} color="emerald" />
                <ProgressBar label="Pending" value={ropaRecords.length === 0 ? 0 : Math.round(((ropaRecords.filter(r => r.status === "pending").length) / ropaRecords.length) * 100)} color="amber" />
                <ProgressBar label="Expired" value={ropaRecords.length === 0 ? 0 : Math.round(((ropaRecords.filter(r => r.status === "expired").length) / ropaRecords.length) * 100)} color="red" />
                <ProgressBar label="Inactive" value={ropaRecords.length === 0 ? 0 : Math.round(((ropaRecords.filter(r => r.status === "inactive").length) / ropaRecords.length) * 100)} color="slate" />
              </div>
            </div>

            {/* Top Categories */}
            <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">หมวดหมู่ข้อมูล</h3>
              <p className="mt-1 text-sm text-slate-500">ประเภทข้อมูลที่พบบ่อยที่สุด</p>
              
              <div className="mt-6 space-y-4">
                {topCategories.length > 0 ? topCategories.map(([cat, count], idx) => (
                  <ProgressBar 
                    key={cat} 
                    label={cat} 
                    value={ropaRecords.length === 0 ? 0 : Math.round((count / ropaRecords.length) * 100)} 
                    color={["blue", "emerald", "amber", "violet"][idx]}
                  />
                )) : (
                  <p className="text-sm text-slate-500">ไม่มีข้อมูล</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Loading State ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-500">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && ropaRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">ยังไม่มีข้อมูลสำหรับดู</h2>
            <p className="mt-2 text-slate-600 max-w-md">เพิ่มข้อมูล ROPA ก่อนเพื่อดูสถิติและการวิเคราะห์</p>
            <a
              href="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              เพิ่มข้อมูล ROPA
            </a>
          </div>
        )}
         
      </div>
    </div>
  );
}

// ── Components ──

function StatCard({ title, value, desc, icon, color = "blue" }: any) {
  const colorClasses: any = {
    blue: "from-blue-50/80 to-blue-100/40 border-blue-100 text-blue-600",
    emerald: "from-emerald-50/80 to-emerald-100/40 border-emerald-100 text-emerald-600",
    amber: "from-amber-50/80 to-amber-100/40 border-amber-100 text-amber-600",
    violet: "from-violet-50/80 to-violet-100/40 border-violet-100 text-violet-600",
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorClasses[color]} p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-current/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-xl bg-white/60 backdrop-blur shadow-sm">
            {icon}
          </div>
          <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color = "blue" }: any) {
  const colorClasses: any = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    slate: "bg-slate-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div 
          className={`h-full rounded-full ${colorClasses[color]} transition-all duration-500`} 
          style={{ width: `${value}%` }}
        />
      </div>
</div>
  );
}