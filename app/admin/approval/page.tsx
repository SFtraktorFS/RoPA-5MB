'use client';

import { useState, useEffect } from 'react';

interface Approval {
  id: number;
  user_id: number;
  purpose: string;
  data_subject: string;
  data_category: string;
  legal_basis: string;
  retention_period: number;
  approval_status: string;
  created_at: string;
}

const DEMO_APPROVALS: Approval[] = [
  {
    id: 1,
    user_id: 1,
    purpose: 'การประมวลผลข้อมูลสำหรับการตลาด',
    data_subject: 'ลูกค้าปัจจุบัน',
    data_category: 'ข้อมูลส่วนตัว',
    legal_basis: 'ความตกลง',
    retention_period: 3,
    approval_status: 'pending',
    created_at: '2024-04-01'
  },
  {
    id: 2,
    user_id: 2,
    purpose: 'การวิเคราะห์พฤติกรรมผู้ใช้งาน',
    data_subject: 'ผู้ใช้งานเว็บไซต์',
    data_category: 'ข้อมูลการใช้งาน',
    legal_basis: '↓↓ness Interest',
    retention_period: 2,
    approval_status: 'approved',
    created_at: '2024-03-15'
  },
  {
    id: 3,
    user_id: 3,
    purpose: 'การส่งสื่อ Sanders',
    data_subject: 'عضو club',
    data_category: 'ผู้ùng完整Free',
    legal_basis: 'ความยินยอม',
    retention_period: 1,
    approval_status: 'pending',
    created_at: '2024-04-10'
  },
];

export default function ApprovalPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/approval`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.data || []);
        setIsDemo(false);
      } else {
        setIsDemo(true);
        setApprovals([...DEMO_APPROVALS]);
      }
    } catch (error) {
      setIsDemo(true);
      setApprovals([...DEMO_APPROVALS]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId: number, status: 'approved' | 'rejected') => {
    if (!confirm(`ยืนยัน${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}?`)) return;

    if (isDemo) {
      setApprovals(approvals.map(a =>
        a.id === approvalId ? { ...a, approval_status: status } : a
      ));
      alert(`${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}สำเร็จ (DEMO)`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/approval/${approvalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approval_status: status })
      });

      if (res.ok) {
        alert(`${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}สำเร็จ`);
        fetchApprovals();
      } else {
        const data = await res.json();
        alert(data.detail || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อระบบได้');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">อนุมัติข้อมูล</h1>
            <p className="text-sm text-slate-600">ตรวจสอบและอนุมัติคำขอ ROPA</p>
            {isDemo && (
              <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-black">
                โหมด DEMO - ข้อมูลไม่ถูกบันทึกลงฐานข้อมูล
              </span>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-slate-500">กำลังโหลด...</div>
          ) : approvals.length === 0 ? (
            <div className="py-12 text-center text-slate-500">ไม่มีคำขอที่รออนุมัติ</div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">ID: {approval.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(approval.approval_status)}`}>
                          {approval.approval_status}
                        </span>
                      </div>
                      <h3 className="font-semibold">{approval.purpose}</h3>
                      <p className="text-sm text-slate-600">ประเภทเจ้าของข้อมูล: {approval.data_subject}</p>
                      <p className="text-sm text-slate-600">ประเภทข้อมูล: {approval.data_category}</p>
                      <p className="text-sm text-slate-600">ฐานทางกฎหมาย: {approval.legal_basis}</p>
                      <p className="text-sm text-slate-600">ระยะเวลาเก็บรักษา: {approval.retention_period} ปี</p>
                    </div>
                    {approval.approval_status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval(approval.id, 'approved')}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, 'rejected')}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}