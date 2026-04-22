"use client";

import { useState } from "react";

export default function DataOwner() {
  const [activeTab, setActiveTab] = useState("overview");

  const bigDataStats = [
    { label: "Total Data Volume", value: "2.5 TB", change: "+12%", trend: "up" },
    { label: "Active Data Sources", value: "47", change: "+5", trend: "up" },
    { label: "Data Quality Score", value: "94%", change: "+2%", trend: "up" },
    { label: "Processing Speed", value: "1.2 GB/s", change: "-0.1 GB/s", trend: "down" },
  ];

  const dataSources = [
    { name: "Customer Database", type: "SQL", volume: "500 GB", status: "Active" },
    { name: "IoT Sensors", type: "Time Series", volume: "1.2 TB", status: "Active" },
    { name: "Social Media Feed", type: "JSON", volume: "300 GB", status: "Processing" },
    { name: "Transaction Logs", type: "CSV", volume: "800 GB", status: "Active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Big Data Management</h1>
          <p className="text-lg text-gray-600">Data Owner Dashboard - Monitor and manage your big data ecosystem</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {[
              { id: "overview", label: "Overview" },
              { id: "sources", label: "Data Sources" },
              { id: "analytics", label: "Analytics" },
              { id: "compliance", label: "Compliance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bigDataStats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`text-sm font-semibold ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Flow Visualization */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Flow Architecture</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-sm font-medium">Data Sources</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <p className="text-sm font-medium">Processing</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">💾</span>
                  </div>
                  <p className="text-sm font-medium">Data Lake</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className="text-sm font-medium">Analytics</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sources" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Data Sources Management</h3>
              <p className="text-gray-600 mt-1">Monitor and configure your data ingestion sources</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataSources.map((source, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{source.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source.volume}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          source.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {source.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Configure</button>
                        <button className="text-red-600 hover:text-red-900">Pause</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1.2M</div>
                  <p className="text-sm text-gray-600">Daily Records Processed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">99.7%</div>
                  <p className="text-sm text-gray-600">Data Accuracy Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">45min</div>
                  <p className="text-sm text-gray-600">Avg Processing Time</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Trends</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">📊 Interactive Charts Would Be Displayed Here</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Compliance Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">GDPR Compliance</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Retention Policy</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Compliance Checks</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-3">✓</span>
                    <span className="text-sm font-medium">Data Encryption Check</span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-3">✓</span>
                    <span className="text-sm font-medium">Access Control Audit</span>
                  </div>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-3">⚠</span>
                    <span className="text-sm font-medium">Data Backup Verification</span>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}