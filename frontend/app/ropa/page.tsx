'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function RecordsPage() {
  const [records, setRecords] = useState<ROPA[]>([]);
  const [loading, setLoading] = useState(true);
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

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    fetchRecords();
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
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ropa`);
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
    const confirmed = window.confirm('ยืนยันการลบบันทึกนี้? การลบจะไม่สามารถกู้คืนได้');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/ropa/${recordId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.status === 'success') {
        await fetchRecords();
      } else {
        console.error('Error deleting record:', data);
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
            <Link href="/create" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              + เพิ่มข้อมูลใหม่
            </Link>
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
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.purpose}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{record.data_category}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{record.retention_period} ปี</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{record.data_subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          🗑️ ลบ
                        </button>
                        <button
                          onClick={() => handleEditClick(record)}
                          className="ml-3 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          ✏️ แก้ไข
                        </button>
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