"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3340";

  const fetchRopaRecords = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/ropa`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
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
    if (token) {
      fetchRopaRecords();
    }
  }, [token]);

  if (!user) return null;

  const activeCount = ropaRecords.filter((r) => r.status === "active").length;
  const consentCount = ropaRecords.filter((r) => r.legal_basis === "consent").length;

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'Admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'DPO': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getRoleDescription = () => {
    switch (user.role) {
      case 'Admin': return 'คุณมีสิทธิ์เข้าถึงการจัดการระบบทั้งหมด รวมถึงการจัดการผู้ใช้งานและบันทึก RoPA ทุกรายการ';
      case 'DPO': return 'คุณสามารถตรวจสอบและติดตามความปลอดภัยของข้อมูล รวมถึงการเรียกดูรายงานสรุปทั้งหมด';
      case 'Data Owner': return 'คุณสามารถจัดการบันทึก RoPA ของหน่วยงานที่คุณรับผิดชอบและสร้างรายการใหม่ได้';
      default: return '';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-100/40 to-indigo-100/40" />

      <main className="relative mx-auto flex min-h-screen items-center justify-center px-6 py-12 md:py-24">
        <div className="w-full max-w-4xl rounded-[3rem] border border-white/80 bg-white/70 p-8 md:p-14 shadow-2xl shadow-blue-900/10 backdrop-blur-2xl">
          <div className="grid gap-12">
            <div className="space-y-6 text-center">
              <div className={`mx-auto inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${getRoleBadgeColor()}`}>
                {user.role} Role
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
                  ยินดีต้อนรับ, <span className="text-blue-600">{user.username}</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl leading-relaxed text-slate-600 max-w-2xl mx-auto">
                  {getRoleDescription()}
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="group rounded-3xl border border-white bg-white/50 p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">บันทึกทั้งหมด</p>
                <p className="mt-4 text-4xl font-bold text-slate-900">{ropaRecords.length}</p>
              </div>
              <div className="group rounded-3xl border border-white bg-white/50 p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">กำลังใช้งาน</p>
                <p className="mt-4 text-4xl font-bold text-emerald-600">{activeCount}</p>
              </div>
              <div className="group rounded-3xl border border-white bg-white/50 p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">ฐานความยินยอม</p>
                <p className="mt-4 text-4xl font-bold text-purple-600">{consentCount}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {['Admin', 'Data Owner'].includes(user.role) && (
                <a href="/create" className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  เพิ่มข้อมูลใหม่
                </a>
              )}
              
              {['Admin', 'DPO'].includes(user.role) && (
                <a href="/dashboard" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  ดู Dashboard
                </a>
              )}

              <a href="/ropa" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                ดูบันทึก RoPA
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

