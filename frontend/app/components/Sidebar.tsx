"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const menuItems = [
    { name: "หน้าแรก", href: "/main", roles: ["Admin", "DPO", "Data Owner"], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: "แดชบอร์ด", href: "/dashboard", roles: ["Admin", "DPO"], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: "บันทึก RoPA ทั้งหมด", href: "/ropa", roles: ["Admin", "DPO"], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { name: "บันทึกของฉัน", href: "/ropa", roles: ["Data Owner"], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { name: "เพิ่มข้อมูลใหม่", href: "/create", roles: ["Admin", "Data Owner"], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )},
    { name: "จัดการบัญชีผู้ใช้", href: "/users", roles: ["Admin"], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-slate-200 transition hover:bg-white focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={() => setIsOpen(false)} 
      />

      <aside 
        className={`fixed inset-y-0 left-0 z-[70] w-80 max-w-[85vw] overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                R
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">RoPA Master</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <div className="mb-8 px-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100/50 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-blue-600 text-lg font-bold shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-none mb-1">{user.username}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {filteredMenu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === item.href 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 border border-red-100 group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
