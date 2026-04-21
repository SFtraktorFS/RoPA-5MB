"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface User {
  username: string;
  password: string;
  createdAt: string;
}

export default function Admin() {
  const router = useRouter();
  const [ropaRecords, setRopaRecords] = useState<ROPA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"ropa" | "users">("ropa");
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [filterValues, setFilterValues] = useState({
    legal_basis: '',
    status: '',
    retention_period: '',
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3340";

  useEffect(() => {
    const storedUsers = localStorage.getItem("ropa_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    fetchRopaRecords();
  }, []);

  const fetchRopaRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/ropa`);
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

  const handleCreateUser = () => {
    setUserError("");
    setUserSuccess("");

    if (!newUsername.trim() || !newPassword.trim()) {
      setUserError("Please enter both username and password");
      return;
    }

    if (users.some(u => u.username === newUsername)) {
      setUserError("Username already exists");
      return;
    }

    if (newPassword.length < 6) {
      setUserError("Password must be at least 6 characters");
      return;
    }

    const updatedUsers = [...users, { username: newUsername, password: newPassword, createdAt: new Date().toISOString() }];
    setUsers(updatedUsers);
    localStorage.setItem("ropa_users", JSON.stringify(updatedUsers));
    
    setUserSuccess(`User "${newUsername}" created successfully!`);
    setNewUsername("");
    setNewPassword("");
    
    setTimeout(() => {
      setShowUserModal(false);
      setUserSuccess("");
    }, 2000);
  };

  const handleDeleteUser = (username: string) => {
    if (username === "admin") {
      setUserError("Cannot delete default admin user");
      return;
    }
    
    const updatedUsers = users.filter(u => u.username !== username);
    setUsers(updatedUsers);
    localStorage.setItem("ropa_users", JSON.stringify(updatedUsers));
    setUserSuccess(`User "${username}" deleted successfully!`);
    setTimeout(() => setUserSuccess(""), 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    router.push("/");
  };

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
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                System Management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage ROPA records and system users
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex gap-2 border-t border-slate-200 pt-4">
            <button
              onClick={() => setActiveTab("ropa")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "ropa"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ROPA Records
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              User Management
            </button>
          </div>
        </header>

        {/* ── ROPA Tab Content ── */}
        {activeTab === "ropa" && (
          <>
            {/* Stats Section */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Activities" value={ropaRecords.length} desc="Total ROPA Records" />
              <StatCard 
                title="Active Status" 
                value={`${ropaRecords.length === 0 ? 0 : Math.round((activeCount / ropaRecords.length) * 100)}%`} 
                desc="Percentage of active records"
                color="text-emerald-600"
              />
              <StatCard title="Avg Retention" value={`${averageRetention} years`} desc="Average retention period" />
              <StatCard title="Consent Based" value={consentCount} desc="Records using consent" />
            </section>

            {/* Main Content */}
            <section className="grid gap-6">
              
              {/* Table Part */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-slate-900">Latest Records</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchRopaRecords}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilterModal(true)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      🔍 Filter
                    </button>
                  </div>
                </div>

            {isLoading ? (
              <div className="py-20 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
            ) : ropaRecords.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                ยังไม่มีบันทึก ROPA
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3">Legal Basis</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ropaRecords.map((record) => (
                      <tr key={record.id} className="bg-slate-50 transition hover:bg-slate-100">
                        <td className="rounded-l-2xl px-4 py-4 text-sm font-medium">{record.id}</td>
                        <td className="px-4 py-4 text-sm">{record.purpose}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{record.legal_basis}</td>
                        <td className="px-4 py-4 text-sm">
                          {/* แก้ไข: ใส่ backtick ใน className */}
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            record.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                          }`}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">{record.retention_period} ปี</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {showFilterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
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
        </section>
          </>
        )}

        {/* ── Users Tab Content ── */}
        {activeTab === "users" && (
          <section className="space-y-6">
            {/* User Management Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">User Management</h2>
                <button
                  onClick={() => {
                    setShowUserModal(true);
                    setNewUsername("");
                    setNewPassword("");
                    setUserError("");
                    setUserSuccess("");
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  + Create User
                </button>
              </div>

              {/* Success Message */}
              {userSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">{userSuccess}</p>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 text-left">Username</th>
                      <th className="px-4 py-3 text-left">Password</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                          No users yet
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.username} className="bg-slate-50 hover:bg-slate-100">
                          <td className="rounded-l-2xl px-4 py-4 text-sm font-medium">{user.username}</td>
                          <td className="px-4 py-4 text-sm font-mono">••••••••</td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="rounded-r-2xl px-4 py-4 text-sm">
                            {user.username === "admin" ? (
                              <span className="text-slate-400 italic">System Admin</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="text-red-600 hover:text-red-800 font-semibold"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>

    {/* User Creation Modal */}
    {showUserModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New User</h2>
          <p className="text-gray-600 mb-6">Add a new system user</p>

          {userError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{userError}</p>
            </div>
          )}

          {userSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{userSuccess}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowUserModal(false);
                setNewUsername("");
                setNewPassword("");
                setUserError("");
              }}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </div>
      </div>
    )}
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