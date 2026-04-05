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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ── Header ── */}
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
              <a
                href="/create"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                + เพิ่มข้อมูลใหม่
              </a>
              <a
                href="/records"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                ดูบันทึกทั้งหมด
              </a>
            </div>
          </div>
        </header>

        {/* ── Stats Section ── */}
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

        {/* ── Main Content ── */}
        <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          
          {/* Table Part */}
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
                          {/* แก้ไข: ใส่ backtick ใน className */}
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

          {/* Sidebar Part */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-5">เมนูด่วน</p>
              <div className="grid gap-3">
                <QuickLink href="/create" label="+ เพิ่มข้อมูล ROPA" primary />
                <QuickLink href="/records" label="ดูบันทึกทั้งหมด" />
                <QuickLink href="/filter" label="กรองข้อมูล ROPA" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-4">สถานะโดยรวม</p>
              <div className="space-y-3 text-sm font-medium">
                <StatusRow label="Active" value={activeCount} />
                <StatusRow label="Inactive" value={ropaRecords.length - activeCount} />
                <StatusRow label="Consent" value={consentCount} />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

// ── Components ย่อยเพื่อความสะอาดของโค้ด ──

function StatCard({ title, value, desc, color = "text-slate-900" }: any) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-4 text-3xl font-semibold ${color}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function QuickLink({ href, label, primary = false }: any) {
  return (
    <a
      href={href}
      className={`block rounded-2xl px-4 py-4 text-sm font-semibold transition text-center ${
        primary 
        ? "bg-blue-600 text-white hover:bg-blue-700" 
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      }`}
    >
      {label}
    </a>
  );
}

function StatusRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-600">{label}</span>
      <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs">{value}</span>
    </div>
  );
}