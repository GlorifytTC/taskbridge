import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkerManagement = ({ user }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    specializations: [],
    workerType: 'regular',
    isAvailable: true
  });
  const [skillInput, setSkillInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(res.data.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/workers`, newWorker, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewWorker({ name: '', email: '', specializations: [], workerType: 'regular', isAvailable: true });
      fetchWorkers();
    } catch (error) {
      console.error('Error adding worker:', error);
    }
  };

  const handleAddSkill = () => {
    if (skillInput && !newWorker.specializations.includes(skillInput)) {
      setNewWorker({
        ...newWorker,
        specializations: [...newWorker.specializations, skillInput]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setNewWorker({
      ...newWorker,
      specializations: newWorker.specializations.filter(s => s !== skill)
    });
  };

  const handleToggleAvailability = async (workerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/workers/${workerId}`, 
        { isAvailable: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this worker? This will remove all assignments.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/workers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
    }
  };

  const handleBulkAvailability = async () => {
    const selectedWorkers = workers.filter(w => w.selected).map(w => w._id);
    if (selectedWorkers.length === 0) {
      alert('Select at least one worker first');
      return;
    }
    
    const newStatus = confirm('Set selected workers as available? Click OK for Available, Cancel for Unavailable');
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/workers/bulk/availability`,
        { workerIds: selectedWorkers, isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWorkers();
    } catch (error) {
      console.error('Error updating availabilities:', error);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = workers.every(w => w.selected);
    setWorkers(workers.map(w => ({ ...w, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setWorkers(workers.map(w => w._id === id ? { ...w, selected: !w.selected } : w));
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;

  return (
    <div className="bg-[#0f172a] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">👥 Worker Management</h1>
          <div className="flex gap-3">
            <button
              onClick={handleBulkAvailability}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Bulk Update Availability
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Worker
            </button>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f172a]">
                <tr>
                  <th className="p-3 text-left">
                    <input type="checkbox" onChange={toggleSelectAll} className="w-4 h-4" />
                  </th>
                  <th className="p-3 text-left text-white">Name</th>
                  <th className="p-3 text-left text-white">Email</th>
                  <th className="p-3 text-left text-white">Specializations</th>
                  <th className="p-3 text-left text-white">Type</th>
                  <th className="p-3 text-left text-white">Status</th>
                  <th className="p-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker._id} className="border-t border-gray-700 hover:bg-[#2d3a5e]">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={worker.selected || false}
                        onChange={() => toggleSelect(worker._id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3 text-white">{worker.name}</td>
                    <td className="p-3 text-white">{worker.email}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {worker.specializations.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${worker.workerType === 'regular' ? 'bg-green-600' : 'bg-orange-600'} text-white`}>
                        {worker.workerType}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleAvailability(worker._id, worker.isAvailable)}
                        className={`px-2 py-1 rounded text-xs ${worker.isAvailable ? 'bg-green-600' : 'bg-red-600'} text-white`}
                      >
                        {worker.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(worker._id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Worker Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Add New Worker</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add Specialization (e.g., Math, Science)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 p-2 bg-[#0f172a] text-white rounded"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button onClick={handleAddSkill} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newWorker.specializations.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="text-white hover:text-red-300">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <select
                  value={newWorker.workerType}
                  onChange={(e) => setNewWorker({ ...newWorker, workerType: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                >
                  <option value="regular">Regular (Always Available)</option>
                  <option value="substitute">Substitute (On Call)</option>
                </select>
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={newWorker.isAvailable}
                    onChange={(e) => setNewWorker({ ...newWorker, isAvailable: e.target.checked })}
                  />
                  Available for assignments
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddWorker} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Add Worker
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerManagement;