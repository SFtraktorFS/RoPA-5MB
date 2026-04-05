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
  const [filter, setFilter] = useState({
    legal_basis: '',
    status: '',
    retention_period: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.legal_basis) params.append('legal_basis', filter.legal_basis);
      if (filter.status) params.append('status', filter.status);
      if (filter.retention_period) params.append('retention_period', filter.retention_period);

      const url = params.toString() ? `${API_BASE}/ropa/filter?${params}` : `${API_BASE}/ropa`;
      const response = await fetch(url);
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchRecords();
  };

  const clearFilters = () => {
    setFilter({
      legal_basis: '',
      status: '',
      retention_period: '',
    });
    setSearchTerm('');
    fetchRecords();
  };

  const filteredRecords = records.filter(record =>
    record.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.data_subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.data_category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับสู่ Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">บันทึกกิจกรรม ROPA</h1>
            <p className="mt-2 text-sm text-gray-600">ดูและจัดการบันทึกกิจกรรมประมวลผลข้อมูลส่วนบุคคลทั้งหมด</p>
          </div>
          <div className="flex gap-3">
            <Link href="/create" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
              + เพิ่มกิจกรรมใหม่
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">กรองข้อมูล</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ฐานทางกฎหมาย</label>
              <select
                name="legal_basis"
                value={filter.legal_basis}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              >
                <option value="">ทั้งหมด</option>
                <option value="consent">Consent</option>
                <option value="not_consent">Not Consent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              >
                <option value="">ทั้งหมด</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาเก็บรักษา</label>
              <input
                type="number"
                name="retention_period"
                value={filter.retention_period}
                onChange={(e) => setFilter(prev => ({ ...prev, retention_period: e.target.value }))}
                placeholder="ปี"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                กรอง
              </button>
              <button
                onClick={clearFilters}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                ล้าง
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาจากชื่อกิจกรรม, ประเภทข้อมูล..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">บันทึกทั้งหมด ({filteredRecords.length} รายการ)</h2>
            <button
              onClick={fetchRecords}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              รีเฟรช
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">ไม่พบบันทึก</h3>
              <p className="mt-1 text-sm text-slate-500">ลองปรับตัวกรองหรือเพิ่มกิจกรรมใหม่</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ชื่อกิจกรรม</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ประเภทเจ้าของข้อมูล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ประเภทข้อมูล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ฐานทางกฎหมาย</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ระยะเวลา</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">วันที่สร้าง</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{record.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{record.purpose}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{record.data_subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{record.data_category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.legal_basis === 'consent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.legal_basis}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{record.retention_period} ปี</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(record.created_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
