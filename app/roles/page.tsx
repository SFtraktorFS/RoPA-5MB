"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RoleSelection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const user = sessionStorage.getItem("currentUser");
    if (!user) {
      router.push("/login");
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  const handleRoleSelect = (role: string) => {
    if (role === "admin") {
      setShowPasswordModal(true);
      setSelectedRole(role);
    } else {
      setSelectedRole(role);
      setTimeout(() => {
        router.push(`/${role.toLowerCase().replace(' ', '-')}`);
      }, 500);
    }
  };

  const handlePasswordSubmit = () => {
    setPasswordError("");
    if (adminPassword === "1234321") {
      setShowPasswordModal(false);
      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } else {
      setPasswordError("Invalid password. Please try again.");
      setAdminPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    router.push("/login");
  };

  const roles = [
    {
      id: "admin",
      name: "Admin",
      description: "Full system access and management",
      icon: "👑",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      id: "dpo",
      name: "DPO",
      description: "Data Protection Officer oversight",
      icon: "🛡️",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
    },
    {
      id: "data-owner",
      name: "Data Owner",
      description: "Big Data management and analytics",
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors"
      >
        Logout
      </button>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Select Your Role</h1>
          <p className="text-xl text-blue-100 mb-2">Welcome, <span className="font-semibold">{currentUser}</span></p>
          <p className="text-blue-100">Choose your role to access the system</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`
                relative group cursor-pointer transform transition-all duration-300 hover:scale-105
                ${selectedRole === role.id ? "scale-105" : ""}
              `}
            >
              {/* Card */}
              <div
                className={`
                relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20
                transition-all duration-300 group-hover:shadow-3xl group-hover:-translate-y-2
                ${selectedRole === role.id ? "ring-4 ring-white/50 shadow-3xl -translate-y-2" : ""}
              `}
              >
                {/* Icon */}
                <div
                  className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6
                  bg-gradient-to-r ${role.color} text-white text-2xl font-bold
                  group-hover:scale-110 transition-transform duration-300
                `}
                >
                  {role.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {role.name}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">{role.description}</p>

                {/* Action Button */}
                <div
                  className={`
                  inline-flex items-center justify-center w-full py-3 px-6 rounded-xl
                  bg-gradient-to-r ${role.color} ${role.hoverColor}
                  text-white font-semibold text-sm uppercase tracking-wide
                  transform transition-all duration-300 group-hover:scale-105
                  shadow-lg group-hover:shadow-xl
                `}
                >
                  {selectedRole === role.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {role.id === "admin" ? "Verifying..." : "Entering..."}
                    </>
                  ) : (
                    <>
                      Select Role
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </div>

                {/* Hover Effect Border */}
                <div
                  className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  bg-gradient-to-r ${role.color} p-[2px]
                `}
                >
                  <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-2xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-200 text-sm">Secure access to your organization's data management system</p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>

      {/* Password Modal for Admin */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-600 mb-6">Enter the admin password to continue</p>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{passwordError}</p>
              </div>
            )}

            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all mb-6"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedRole(null);
                  setAdminPassword("");
                  setPasswordError("");
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
