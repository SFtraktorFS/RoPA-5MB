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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-sky-100/60 to-indigo-100/60" />
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

      <main className="relative mx-auto flex min-h-screen items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl rounded-[2.5rem] border border-white/70 bg-white/90 p-10 shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
          <div className="grid gap-10">
            <div className="space-y-5 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm shadow-blue-100">
                <span className="text-2xl font-bold">R</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  RoPA Master
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  หน้าหลักที่จัดวางสวยงามและใช้ปุ่มนำทางจากซ้ายเพื่อไปยังหน้าต่าง ๆ ได้ทันที
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{ropaRecords.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{activeCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Consent</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{consentCount}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <a href="/create" className="rounded-3xl bg-blue-600 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-blue-700">
                เพิ่มข้อมูลใหม่
              </a>
              <a href="/ropa" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                ดูบันทึกทั้งหมด
              </a>
              <a href="/dashboard" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                ดู Dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

