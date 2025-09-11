import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface MachineInfo {
  machine_id: string;
  system_info: {
    platform: string;
    machine: string;
    processor: string;
    node: string;
    python_version: string;
    timestamp: string;
  };
  created_at: string;
  updated_at: string;
  conversation_count: number;
  message_count: number;
}

interface MachineManagementProps {
  machineId?: string;
  onMachineIdChange?: (newMachineId: string) => void;
}

const MachineManagement: React.FC<MachineManagementProps> = ({
  machineId,
  onMachineIdChange,
}) => {
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    if (machineId) {
      fetchMachineInfo();
    }
  }, [machineId]);

  const fetchMachineInfo = async () => {
    if (!machineId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/machine/info/${machineId}`);
      if (response.ok) {
        const data = await response.json();
        setMachineInfo(data);
      }
    } catch (error) {
      console.error('Error fetching machine info:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewMachineId = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/machine/generate-id', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (onMachineIdChange) {
          onMachineIdChange(data.machine_id);
        }
        await fetchMachineInfo();
      }
    } catch (error) {
      console.error('Error generating machine ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetMachineId = async () => {
    if (!machineId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/machine/reset/${machineId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (onMachineIdChange) {
          onMachineIdChange(data.new_machine_id);
        }
        setShowResetConfirm(false);
        await fetchMachineInfo();
      }
    } catch (error) {
      console.error('Error resetting machine ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMachineData = async () => {
    if (!machineId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/machine/export-data/${machineId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();

        // สร้างไฟล์ download
        const blob = new Blob([JSON.stringify(data.export_data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting machine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const importMachineData = async () => {
    if (!importFile || !machineId) return;

    setLoading(true);
    try {
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);

      const response = await fetch('/api/machine/import-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machine_id: machineId,
          import_data: importData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Import successful:', data.message);
        setShowImportForm(false);
        setImportFile(null);
        await fetchMachineInfo();
      }
    } catch (error) {
      console.error('Error importing machine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    }
  };

  if (!machineId) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            ไม่มี Machine ID
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            ระบบจะสร้าง Machine ID อัตโนมัติเมื่อเริ่มใช้งาน
          </p>
          <div className="mt-6">
            <button
              onClick={generateNewMachineId}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้าง Machine ID'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Machine ID Display */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Machine ID</h3>
            <p className="text-sm text-gray-500 mt-1">
              รหัสประจำเครื่องสำหรับการแยกข้อมูล
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
              {machineId}
            </span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="รีเซ็ต Machine ID"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Machine Information */}
      {machineInfo && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ข้อมูลเครื่อง
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                ข้อมูลระบบ
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Platform:</dt>
                  <dd className="text-gray-900">
                    {machineInfo.system_info.platform}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Machine:</dt>
                  <dd className="text-gray-900">
                    {machineInfo.system_info.machine}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Processor:</dt>
                  <dd className="text-gray-900">
                    {machineInfo.system_info.processor}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Node:</dt>
                  <dd className="text-gray-900">
                    {machineInfo.system_info.node}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Python Version:</dt>
                  <dd className="text-gray-900">
                    {machineInfo.system_info.python_version}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                สถิติการใช้งาน
              </h4>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">การสนทนา:</dt>
                  <dd className="text-gray-900">
                    {machineInfo.conversation_count}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">ข้อความ:</dt>
                  <dd className="text-gray-900">{machineInfo.message_count}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">สร้างเมื่อ:</dt>
                  <dd className="text-gray-900">
                    {new Date(machineInfo.created_at).toLocaleString('th-TH')}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">อัปเดตล่าสุด:</dt>
                  <dd className="text-gray-900">
                    {new Date(machineInfo.updated_at).toLocaleString('th-TH')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">การดำเนินการ</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportMachineData}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            ส่งออกข้อมูล
          </button>

          <button
            onClick={() => setShowImportForm(true)}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            นำเข้าข้อมูล
          </button>

          <button
            onClick={generateNewMachineId}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            สร้าง ID ใหม่
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <InformationCircleIcon className="mx-auto h-12 w-12 text-yellow-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                ยืนยันการรีเซ็ต
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  การรีเซ็ต Machine ID จะทำให้ไม่สามารถเข้าถึงข้อมูลเก่าได้
                  และจะสร้าง Machine ID ใหม่ คุณแน่ใจหรือไม่?
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={resetMachineId}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'กำลังรีเซ็ต...' : 'รีเซ็ต'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Form Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                นำเข้าข้อมูลเครื่อง
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกไฟล์ JSON
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowImportForm(false);
                      setImportFile(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={importMachineData}
                    disabled={!importFile || loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'กำลังนำเข้า...' : 'นำเข้า'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineManagement;
