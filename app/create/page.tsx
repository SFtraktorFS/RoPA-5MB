'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateFormData {
  purpose: string;
  data_subject: string;
  data_category: string;
  legal_basis: 'consent' | 'not_consent';
  retention_period: number;
}

export default function CreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateFormData>({
    purpose: '',
    data_subject: 'พนักงาน',
    data_category: 'ข้อมูลทั่วไป',
    legal_basis: 'consent',
    retention_period: 1,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'retention_period' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/ropa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'active' }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setMessage('✅ บันทึกกิจกรรมเรียบร้อยแล้ว');
        setFormData({
          purpose: '',
          data_subject: 'พนักงาน',
          data_category: 'ข้อมูลทั่วไป',
          legal_basis: 'consent',
          retention_period: 1,
        });
      } else {
        setMessage(data.message || '❌ เกิดข้อผิดพลาดขณะบันทึกข้อมูล');
      }
    } catch (error) {
      setMessage('❌ ไม่สามารถเชื่อมต่อระบบได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        
        {/* ── ปุ่มย้อนกลับ ── */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          ย้อนกลับ
        </button>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold">New Entry</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">เพิ่มกิจกรรม ROPA</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Purpose (กรอกข้อความ) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">1. ชื่อกิจกรรม (Purpose)</label>
              <input
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                placeholder="ระบุชื่อกิจกรรม เช่น การจัดทำทะเบียนประวัติพนักงาน"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* 2. Data Subject (เลือก - Dropdown) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">2. ประเภทเจ้าของข้อมูล</label>
                <select
                  name="data_subject"
                  value={formData.data_subject}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:border-blue-500 focus:bg-white outline-none transition cursor-pointer"
                >
                  <option value="พนักงาน">พนักงาน</option>
                  <option value="ลูกค้า">ลูกค้า</option>
                  <option value="คู่ค้า">คู่ค้า</option>
                  <option value="บุคคลภายนอก">บุคคลภายนอก</option>
                </select>
              </div>

              {/* 3. Data Category (เลือก - Dropdown) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">3. ประเภทข้อมูล</label>
                <select
                  name="data_category"
                  value={formData.data_category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:border-blue-500 focus:bg-white outline-none transition cursor-pointer"
                >
                  <option value="ข้อมูลทั่วไป">ข้อมูลทั่วไป (ชื่อ-สกุล, ที่อยู่)</option>
                  <option value="ข้อมูลทางการเงิน">ข้อมูลทางการเงิน (เลขบัญชี)</option>
                  <option value="ข้อมูลอ่อนไหว">ข้อมูลอ่อนไหว (ศาสนา, สุขภาพ)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* 4. Legal Basis (เลือก - Dropdown) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">4. ฐานทางกฎหมาย</label>
                <select
                  name="legal_basis"
                  value={formData.legal_basis}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition cursor-pointer"
                >
                  <option value="consent" className="text-emerald-600">✅ Consent (ได้รับความยินยอม)</option>
                  <option value="not_consent" className="text-rose-600">❌ Not Consent (ฐานทางกฎหมายอื่น)</option>
                </select>
              </div>

              {/* 5. Retention Period (กรอกตัวเลข) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">5. ระยะเวลาเก็บรักษา (ปี)</label>
                <input
                  name="retention_period"
                  type="number"
                  min={1}
                  max={99}
                  value={formData.retention_period}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-xs text-slate-500 font-medium italic">
                  สถานะบันทึกอัตโนมัติ: <span className="text-emerald-600 font-bold uppercase">Active</span>
                </p>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-10 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'กำลังส่งข้อมูล...' : 'บันทึกกิจกรรม ROPA'}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-6 rounded-2xl p-4 text-sm font-bold text-center border ${
              message.includes('✅') 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}