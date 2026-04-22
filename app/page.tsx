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
        setRopaRecords(data.data);
      }
    } catch (error) {
      console.error('Error filtering ROPA records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setFilterValues({ legal_basis: '', status: '', retention_period: '' });
    await fetchRopaRecords();
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
        await fetchRopaRecords();
      }
    } catch (error) {
      console.error('Error updating ROPA record:', error);
    }
  };

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
                ยินดีต้อนรับสู่ระบบ RoPA Master
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
              <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                🔍 กรองข้อมูล
              </button>
            </div>
          </div>
        </header>

        
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