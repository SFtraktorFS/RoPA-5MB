'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

interface UserData {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    role: 'Data Owner',
  });

  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    role: '',
    is_active: true,
  });

  const { user, token } = useAuth();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3340';

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, token]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowCreateModal(false);
        setCreateForm({ username: '', password: '', role: 'Data Owner' });
        await fetchUsers();
      } else {
        alert(data.detail || 'เกิดข้อผิดพลาดในการสร้างบัญชี');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleEditClick = (u: UserData) => {
    setSelectedUser(u);
    setEditForm({
      username: u.username,
      password: '', // Don't show hashed password, allow updating
      role: u.role,
      is_active: u.is_active,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // Only send password if it's not empty
    const body: any = {
      username: editForm.username,
      role: editForm.role,
      is_active: editForm.is_active,
    };
    if (editForm.password) {
      body.password = editForm.password;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowEditModal(false);
        await fetchUsers();
      } else {
        alert(data.detail || 'เกิดข้อผิดพลาดในการแก้ไขบัญชี');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === user?.id) {
        alert('คุณไม่สามารถลบบัญชีของตัวเองได้');
        return;
    }
    const confirmed = window.confirm('ยืนยันการลบบัญชีผู้ใช้นี้?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!user || user.role !== 'Admin') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-0 pt-20 pb-8 px-4 md:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">จัดการบัญชีผู้ใช้</h1>
              <p className="text-slate-500 mt-1">จัดการข้อมูลและสิทธิ์การเข้าถึงระบบของผู้ใช้งาน</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              สร้างบัญชีใหม่
            </button>
          </div>

          {/* User List Table */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">กำลังดึงข้อมูลผู้ใช้...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">ผู้ใช้งาน</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">บทบาท</th>
                      <th className="px-8 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">สถานะ</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-slate-600 uppercase tracking-widest">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr 
                        key={u.id} 
                        onClick={() => handleEditClick(u)}
                        className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{u.username}</div>
                              <div className="text-xs text-slate-600 font-bold">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                            u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'DPO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></span>
                            <span className={`text-xs font-bold ${u.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(u)}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="ดูรายละเอียด/แก้ไข"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(u.id);
                              }}
                              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="ลบผู้ใช้"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">สร้างบัญชีผู้ใช้ใหม่</h3>
              <p className="text-slate-600 font-medium">กรอกข้อมูลเพื่อลงทะเบียนผู้ใช้งานเข้าสู่ระบบ</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">ชื่อผู้ใช้งาน (Username)</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="เช่น somchai_dpo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">รหัสผ่าน (Password)</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  placeholder="กำหนดรหัสผ่าน"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">บทบาท (Role)</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                >
                  <option value="Admin">Admin</option>
                  <option value="DPO">DPO</option>
                  <option value="Data Owner">Data Owner</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  ยืนยันการสร้าง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/View User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                    {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedUser.username}</h3>
                    <p className="text-xs text-slate-600 font-bold tracking-wider uppercase">User Information</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">User ID</label>
                        <div className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-800 border border-slate-200">
                            #{selectedUser.id}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Current Role</label>
                        <div className="w-full rounded-2xl bg-blue-100 px-5 py-3 text-sm font-bold text-blue-800 border border-blue-200 text-center">
                            {selectedUser.role}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800 ml-1">ชื่อผู้ใช้งาน</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800 ml-1">เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
                  <div className="relative">
                    <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                        ENCRYPTED
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800 ml-1">บทบาท</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat"
                  >
                    <option value="Admin">Admin</option>
                    <option value="DPO">DPO</option>
                    <option value="Data Owner">Data Owner</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 border border-slate-200">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">สถานะบัญชี</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Active Status</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={editForm.is_active} 
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-black hover:-translate-y-0.5 active:translate-y-0"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
