'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

const DEMO_USERS: User[] = [
  { id: 1, username: 'admin_demo', name: 'ผู้ดูแลระบบ', role: 'admin', created_at: '2024-01-01' },
  { id: 2, username: 'john_doe', name: 'จอห์น ดอว์', role: 'user', created_at: '2024-02-15' },
  { id: 3, username: 'jane_smith', name: 'เจน สมิธ', role: 'user', created_at: '2024-03-20' },
  { id: 4, username: 'bob_wilson', name: 'บอบ วิลสัน', role: 'user', created_at: '2024-04-10' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: 'user' });
  const [token, setToken] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setIsDemo(false);
      } else {
        setIsDemo(true);
        setUsers([...DEMO_USERS]);
      }
    } catch (error) {
      setIsDemo(true);
      setUsers([...DEMO_USERS]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      const maxId = Math.max(...users.map(u => u.id), 0);
      const today = new Date().toISOString().split('T')[0];
      const createdUser: User = {
        id: maxId + 1,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        created_at: today,
      };
      setUsers([...users, createdUser]);
      setShowModal(false);
      setNewUser({ username: '', name: '', password: '', role: 'user' });
      alert('สร้างบัญชีสำเร็จ (DEMO)');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        alert('สร้างบัญชีสำเร็จ');
        setShowModal(false);
        setNewUser({ username: '', name: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.detail || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อระบบได้');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('ยืนยันการลบบัญชีนี้?')) return;

    if (isDemo) {
      setUsers(users.filter(u => u.id !== userId));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/delete/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">จัดการบัญชีผู้ใช้</h1>
            <p className="text-sm text-slate-700">สร้างและจัดการบัญชีผู้ใช้งาน</p>

            {isDemo && (
              <span className="mt-2 inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-black">
                โหมด DEMO - ข้อมูลไม่ถูกบันทึกลงฐานข้อมูล
              </span>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + สร้างบัญชีใหม่
          </button>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-slate-700">กำลังโหลด...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-700">ยังไม่มีบัญชีผู้ใช้</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm text-slate-900">{user.id}</td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {user.username}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-800">
                      {user.name}
                    </td>

                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          ลบ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4">สร้างบัญชีใหม่</h2>

              <form onSubmit={handleCreateUser} className="space-y-4">

                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
                  required
                />

                <input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
                  required
                />

                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-800"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white"
                  >
                    สร้าง
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}