import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupManagement = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    peopleCount: 1,
    requiredSkill: '',
    priority: 'medium',
    preferredRoomType: '',
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });
  const [bulkGroups, setBulkGroups] = useState([
    { name: '', peopleCount: 1, requiredSkill: '', priority: 'medium' }
  ]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups`, newGroup, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewGroup({ name: '', peopleCount: 1, requiredSkill: '', priority: 'medium', preferredRoomType: '', startTime: '09:00', endTime: '17:00', notes: '' });
      fetchGroups();
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleBulkAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups/bulk`, 
        { groups: bulkGroups.filter(g => g.name) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowBulkModal(false);
      setBulkGroups([{ name: '', peopleCount: 1, requiredSkill: '', priority: 'medium' }]);
      fetchGroups();
    } catch (error) {
      console.error('Error bulk adding groups:', error);
    }
  };

  const addBulkRow = () => {
    setBulkGroups([...bulkGroups, { name: '', peopleCount: 1, requiredSkill: '', priority: 'medium' }]);
  };

  const updateBulkRow = (index, field, value) => {
    const updated = [...bulkGroups];
    updated[index][field] = value;
    setBulkGroups(updated);
  };

  const removeBulkRow = (index) => {
    setBulkGroups(bulkGroups.filter((_, i) => i !== index));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;

  return (
    <div className="bg-[#0f172a] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📋 Group/Request Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + Bulk Add Groups
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Group
            </button>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f172a]">
                <tr>
                  <th className="p-3 text-left text-white">Group Name</th>
                  <th className="p-3 text-left text-white">People</th>
                  <th className="p-3 text-left text-white">Required Skill</th>
                  <th className="p-3 text-left text-white">Priority</th>
                  <th className="p-3 text-left text-white">Time</th>
                  <th className="p-3 text-left text-white">Status</th>
                  <th className="p-3 text-left text-white">Assigned To</th>
                  <th className="p-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group._id} className="border-t border-gray-700 hover:bg-[#2d3a5e]">
                    <td className="p-3 text-white">{group.name}</td>
                    <td className="p-3 text-white">{group.peopleCount}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">{group.requiredSkill}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(group.priority)} text-white`}>
                        {group.priority}
                      </span>
                    </td>
                    <td className="p-3 text-white">{group.startTime} - {group.endTime}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${group.status === 'assigned' ? 'bg-green-600' : group.status === 'completed' ? 'bg-blue-600' : 'bg-yellow-600'} text-white`}>
                        {group.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-3 text-white">
                      {group.assignedRoom ? `${group.assignedRoom.roomNumber} / ${group.assignedWorker?.name || '-'}` : '-'}
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(group._id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Single Group Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Add New Group</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Group Name (e.g., Math Class, Surgery Team)"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <input
                  type="number"
                  placeholder="Number of People"
                  value={newGroup.peopleCount}
                  onChange={(e) => setNewGroup({ ...newGroup, peopleCount: parseInt(e.target.value) })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Required Skill (e.g., Math, Cardiology)"
                  value={newGroup.requiredSkill}
                  onChange={(e) => setNewGroup({ ...newGroup, requiredSkill: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <select
                  value={newGroup.priority}
                  onChange={(e) => setNewGroup({ ...newGroup, priority: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input
                  type="text"
                  placeholder="Preferred Room Type (Optional)"
                  value={newGroup.preferredRoomType}
                  onChange={(e) => setNewGroup({ ...newGroup, preferredRoomType: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newGroup.startTime}
                    onChange={(e) => setNewGroup({ ...newGroup, startTime: e.target.value })}
                    className="flex-1 p-2 bg-[#0f172a] text-white rounded"
                  />
                  <input
                    type="time"
                    value={newGroup.endTime}
                    onChange={(e) => setNewGroup({ ...newGroup, endTime: e.target.value })}
                    className="flex-1 p-2 bg-[#0f172a] text-white rounded"
                  />
                </div>
                <textarea
                  placeholder="Notes (Optional)"
                  value={newGroup.notes}
                  onChange={(e) => setNewGroup({ ...newGroup, notes: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                  rows="2"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddGroup} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Add Group
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Add Groups Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Bulk Add Groups</h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {bulkGroups.map((group, idx) => (
                  <div key={idx} className="flex gap-2 p-2 border-b border-gray-700">
                    <input
                      type="text"
                      placeholder="Group Name"
                      value={group.name}
                      onChange={(e) => updateBulkRow(idx, 'name', e.target.value)}
                      className="flex-1 p-2 bg-[#0f172a] text-white rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="People"
                      value={group.peopleCount}
                      onChange={(e) => updateBulkRow(idx, 'peopleCount', parseInt(e.target.value))}
                      className="w-20 p-2 bg-[#0f172a] text-white rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Skill"
                      value={group.requiredSkill}
                      onChange={(e) => updateBulkRow(idx, 'requiredSkill', e.target.value)}
                      className="w-28 p-2 bg-[#0f172a] text-white rounded text-sm"
                    />
                    <select
                      value={group.priority}
                      onChange={(e) => updateBulkRow(idx, 'priority', e.target.value)}
                      className="w-24 p-2 bg-[#0f172a] text-white rounded text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <button onClick={() => removeBulkRow(idx)} className="px-2 text-red-400 hover:text-red-300">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={addBulkRow} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  + Add Row
                </button>
                <button onClick={handleBulkAdd} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Create {bulkGroups.filter(g => g.name).length} Groups
                </button>
                <button onClick={() => setShowBulkModal(false)} className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
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

export default GroupManagement;