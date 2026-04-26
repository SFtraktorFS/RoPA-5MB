'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface CreateFormData {
  purpose: string;
  data_subject: string;
  data_category: string;
  legal_basis: 'consent' | 'not_consent';
  retention_period: number;
}

export default function CreatePage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState<CreateFormData>({
    purpose: '',
    data_subject: 'พนักงาน',
    data_category: '',
    legal_basis: 'consent',
    retention_period: 1,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  if (!user) return null;

  // Role Protection: DPO cannot create records
  if (user.role === 'DPO') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full text-center space-y-6 p-10 rounded-[2.5rem] bg-white shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">คุณไม่มีสิทธิ์สร้างบันทึก</h2>
          <p className="text-slate-600">เฉพาะ Admin และ Data Owner เท่านั้นที่สามารถเพิ่มบันทึก RoPA ใหม่ได้</p>
          <button 
            onClick={() => router.push('/main')}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'retention_period' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/ropa`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setMessage('✅ บันทึกกิจกรรมเรียบร้อยแล้ว');
        setTimeout(() => router.push('/ropa'), 2000);
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
    <div className="min-h-screen bg-gray-100 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">เพิ่มกิจกรรมประมวลผลใหม่</h2>
            <p className="mt-2 text-sm text-gray-600">ระบุรายละเอียดกิจกรรมเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
            
            {/* 1. Purpose - ชื่อกิจกรรม (text input) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1. ชื่อกิจกรรม</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
                placeholder="เช่น จัดทำทะเบียนพนักงาน"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* 2. Data Subject - ประเภทเจ้าของข้อมูล (dropdown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2. ประเภทเจ้าของข้อมูล</label>
              <select
                name="data_subject"
                value={formData.data_subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              >
                <option value="พนักงาน">พนักงาน</option>
                <option value="ลูกค้า">ลูกค้า</option>
                <option value="คู่ค้า">คู่ค้า</option>
                <option value="บุคคลภายนอก">บุคคลภายนอก</option>
              </select>
            </div>

            {/* 3. Data Category - ประเภทข้อมูล (textarea) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">3. ประเภทข้อมูล</label>
              <textarea
                name="data_category"
                value={formData.data_category}
                onChange={handleChange}
                required
                rows={4}
                placeholder="ระบุประเภทข้อมูลที่ประมวลผล"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* 4. Legal Basis - ฐานทางกฎหมาย (dropdown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">4. ประเภทฐานทางกฎหมาย</label>
              <select
                name="legal_basis"
                value={formData.legal_basis}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              >
                <option value="consent">✅ Consent (ได้รับความยินยอม)</option>
                <option value="not_consent">❌ Not Consent (ฐานทางกฎหมายอื่น)</option>
              </select>
            </div>

            {/* 5. Retention Period - ระยะเวลาการเก็บรักษา (number input) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">5. ระยะเวลาการสัญญา (ปี)</label>
              <input
                type="number"
                name="retention_period"
                value={formData.retention_period}
                onChange={handleChange}
                min={1}
                max={99}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>

            {/* Personal Data Type Checkboxes */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">ประเภทข้อมูลส่วนบุคคล (เลือกได้มากกว่า 1 ข้อ)</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">ข้อมูลระบุตัวตน (บัตรประชาชน, ชื่อ-สกุล)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">ข้อมูลติดต่อ</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">ข้อมูลสุขภาพ (ความเชื่อทางศาสนา, สุขภาพ)</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกกิจกรรม'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                ยกเลิก
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-6 rounded-lg p-4 text-sm font-medium text-center ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}