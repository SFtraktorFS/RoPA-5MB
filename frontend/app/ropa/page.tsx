'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ROPA {
  id: number;
  purpose: string;
  data_subject: string;
  data_category: string;
  legal_basis: string;
  retention_period: number;
  status: string;
  reason?: string;
  expiration_date?: string;
  created_at: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<ROPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ROPA | null>(null);
  const [approvalForm, setApprovalForm] = useState({
    status: 'active',
    reason: '',
  });
  const [editForm, setEditForm] = useState({
    purpose: '',
    data_subject: '',
    data_category: '',
    legal_basis: '',
    retention_period: 0,
    status: '',
    reason: '',
  });
  const [filterValues, setFilterValues] = useState({
    legal_basis: '',
    status: '',
    retention_period: '',
  });

  const { user, token } = useAuth();
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    if (token) {
      fetchRecords();
    }
  }, [token]);

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

      const response = await fetch(`${API_BASE}/ropa/filter?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error filtering ROPA records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setFilterValues({ legal_basis: '', status: '', retention_period: '' });
    await fetchRecords();
  };

  const fetchRecords = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ropa`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (user?.role === 'DPO') return;
    const confirmed = window.confirm('ยืนยันการลบบันทึกนี้? การลบจะไม่สามารถกู้คืนได้');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/ropa/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        await fetchRecords();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
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
      reason: record.reason || '',
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: name === 'retention_period' ? parseInt(value) || 0 : value }));
  };

  const handleViewClick = (record: ROPA) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleApproveClick = (record: ROPA) => {
    setSelectedRecord(record);
    setApprovalForm({
      status: 'active',
      reason: '',
    });
    setShowApproveModal(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRecord) return;
    try {
      const response = await fetch(`${API_BASE}/ropa/${selectedRecord.id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(approvalForm),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowApproveModal(false);
        setShowViewModal(false);
        await fetchRecords();
      }
    } catch (error) {
      console.error('Error approving record:', error);
    }
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
        await fetchRecords();
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Purpose', 'Data Subject', 'Data Category', 'Legal Basis', 'Retention Period', 'Status', 'Created At'];
    const rows = records.map(r => [
      r.id,
      r.purpose,
      r.data_subject,
      r.data_category,
      r.legal_basis,
      r.retention_period,
      r.status,
      new Date(r.created_at).toLocaleDateString('th-TH')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ropa-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/main" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">รายการบันทึกกิจกรรม (RoPA)</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={records.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Export CSV
            </button>
            {user?.role !== 'DPO' && (
              <Link href="/create" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                + เพิ่มข้อมูลใหม่
              </Link>
            )}
            <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                🔍 กรองข้อมูล
              </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-slate-500">ยังไม่มีบันทึก ROPA</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สิ่งบันทึก</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ข้อมูลประเมินการจองทะเบียน</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ระยะเวลาการเก็บรักษา</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ประเภทข้อมูล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ตัวเลือก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {records.map((record) => (
                      <tr 
                        key={record.id} 
                        onClick={() => {
                          if (record.status === 'inactive' && user?.role === 'Data Owner') return;
                          handleViewClick(record);
                        }}
                        className={`${record.status === 'inactive' && user?.role === 'Data Owner' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-50/50 cursor-pointer'} transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.purpose}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{record.data_category}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{record.retention_period} ปี</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{record.data_subject}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : record.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'active' ? 'Active' : record.status === 'pending' ? 'Pending' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-3">
                          {user?.role !== 'DPO' && record.status !== 'inactive' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(record);
                                }}
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRecord(record.id);
                                }}
                                className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                              >
                                🗑️ ลบ
                              </button>
                            </>
                          )}
                          {(user?.role === 'DPO' || user?.role === 'Admin') && record.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveClick(record);
                              }}
                              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                            >
                              ✅ อนุมัติ
                            </button>
                          )}
                          {(user?.role === 'DPO' || user?.role === 'Admin') && record.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                                setApprovalForm({ status: 'inactive', reason: '' });
                                setShowApproveModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                            >
                              🛑 หยุด/ยกเลิก
                            </button>
                          )}
                          {(user?.role === 'DPO' || user?.role === 'Admin') && record.status === 'inactive' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(record);
                                setApprovalForm({ status: 'active', reason: '' });
                                setShowApproveModal(true);
                              }}
                              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                            >
                              🔓 เปิดใช้งานใหม่
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showEditModal && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl text-gray-600">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">แก้ไขข้อมูล ROPA</h3>
                  <p className="text-sm text-slate-500">ID: {selectedRecord.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Purpose</label>
                  <input
                    type="text"
                    name="purpose"
                    value={editForm.purpose}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data Subject</label>
                  <input
                    type="text"
                    name="data_subject"
                    value={editForm.data_subject}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data Category</label>
                  <input
                    type="text"
                    name="data_category"
                    value={editForm.data_category}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Legal Basis</label>
                    <select
                      name="legal_basis"
                      value={editForm.legal_basis}
                      onChange={handleEditChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                    >
                      <option value="consent">Consent</option>
                      <option value="not_consent">Not Consent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Retention Period (Years)</label>
                  <input
                    type="number"
                    name="retention_period"
                    value={editForm.retention_period}
                    onChange={handleEditChange}
                    min={1}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">เหตุผล / หมายเหตุ (Reason)</label>
                  <textarea
                    name="reason"
                    value={editForm.reason}
                    onChange={handleEditChange}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                    placeholder="ระบุเหตุผลหรือหมายเหตุเพิ่มเติม"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleEditSubmit}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>
        )}

        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl text-gray-700">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">รายละเอียด RoPA</h3>
                <button onClick={() => setShowViewModal(false)} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">✕</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase">วัตถุประสงค์</p>
                  <p className="text-lg text-slate-900">{selectedRecord.purpose}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase">เจ้าของข้อมูล</p>
                  <p className="text-lg text-slate-900">{selectedRecord.data_subject}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase">หมวดหมู่ข้อมูล</p>
                  <p className="text-lg text-slate-900">{selectedRecord.data_category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase">ฐานทางกฎหมาย</p>
                  <p className="text-lg text-slate-900">{selectedRecord.legal_basis === 'consent' ? 'Consent' : 'Not Consent'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase">ระยะเวลาเก็บรักษา</p>
                  <p className="text-lg text-slate-900">{selectedRecord.retention_period} ปี</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500 uppercase">สถานะ</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    selectedRecord.status === 'active' ? 'bg-green-100 text-green-800' : 
                    selectedRecord.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedRecord.status.toUpperCase()}
                  </span>
                </div>
                <div className="md:col-span-2 space-y-1 pt-4 border-t">
                  <p className="text-sm font-semibold text-slate-500 uppercase">เหตุผล / หมายเหตุ</p>
                  <p className="text-slate-800 bg-slate-50 p-4 rounded-xl italic">
                    {selectedRecord.reason || 'ไม่มีข้อมูลเหตุผล'}
                  </p>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-sm font-semibold text-slate-500 uppercase">วันที่สร้าง</p>
                  <p className="text-slate-600">{new Date(selectedRecord.created_at).toLocaleString('th-TH')}</p>
                </div>
                <div className="space-y-1 pt-2">
                  <p className="text-sm font-semibold text-slate-500 uppercase">วันหมดอายุ</p>
                  <p className="text-slate-600">{selectedRecord.expiration_date ? new Date(selectedRecord.expiration_date).toLocaleDateString('th-TH') : '-'}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                {(user?.role === 'DPO' || user?.role === 'Admin') && selectedRecord.status === 'pending' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleApproveClick(selectedRecord);
                    }}
                    className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    ดำเนินการตรวจสอบ
                  </button>
                )}
                {(user?.role === 'DPO' || user?.role === 'Admin') && selectedRecord.status === 'inactive' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedRecord(selectedRecord);
                      setApprovalForm({ status: 'active', reason: '' });
                      setShowApproveModal(true);
                    }}
                    className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    🔓 เปิดใช้งานใหม่
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {showApproveModal && selectedRecord && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-gray-700">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {selectedRecord.status === 'inactive' ? 'เปิดใช้งาน RoPA อีกครั้ง' : 
                 approvalForm.status === 'inactive' ? 'ระงับการใช้งาน RoPA' : 'ดำเนินการตรวจสอบ RoPA'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">การตัดสินใจ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setApprovalForm(f => ({...f, status: 'active'}))}
                      className={`py-3 rounded-2xl border-2 transition font-bold ${approvalForm.status === 'active' ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      อนุมัติ (Active)
                    </button>
                    <button
                      onClick={() => setApprovalForm(f => ({...f, status: 'inactive'}))}
                      className={`py-3 rounded-2xl border-2 transition font-bold ${approvalForm.status === 'inactive' ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      ปฏิเสธ (Inactive)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เหตุผลการอนุมัติ/ปฏิเสธ</label>
                  <textarea
                    rows={4}
                    value={approvalForm.reason}
                    onChange={(e) => setApprovalForm(f => ({...f, reason: e.target.value}))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
                    placeholder="ระบุเหตุผลประกอบการพิจารณา..."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleApproveSubmit}
                  disabled={!approvalForm.reason}
                  className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  ยืนยันการตรวจสอบ
                </button>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {showFilterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl text-gray-600">
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
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">เวลาเก็บรักษา(เช่น น้อยกว่า3ปี)</label>
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
      </div>
    </div>
  );
}