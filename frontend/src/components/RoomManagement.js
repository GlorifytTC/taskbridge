import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomManagement = ({ user }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    startNumber: 1,
    endNumber: 10,
    prefix: '',
    capacity: 30,
    roomType: 'Classroom'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/bulk`, bulkData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowBulkModal(false);
      fetchRooms();
    } catch (error) {
      console.error('Error bulk creating rooms:', error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/rooms/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room? This will remove all assignments.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleBulkCapacity = async () => {
    const newCapacity = prompt('Enter new capacity for all selected rooms:');
    if (!newCapacity) return;
    
    const selectedRooms = rooms.filter(r => r.selected).map(r => r._id);
    if (selectedRooms.length === 0) {
      alert('Select at least one room first');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/rooms/bulk/capacity`, 
        { capacity: parseInt(newCapacity), roomIds: selectedRooms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch (error) {
      console.error('Error updating capacities:', error);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = rooms.every(r => r.selected);
    setRooms(rooms.map(r => ({ ...r, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setRooms(rooms.map(r => r._id === id ? { ...r, selected: !r.selected } : r));
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;

  return (
    <div className="bg-[#0f172a] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">🏠 Room Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Bulk Create Rooms
            </button>
            <button
              onClick={handleBulkCapacity}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Set Capacity for Selected
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
                  <th className="p-3 text-left text-white">Room #</th>
                  <th className="p-3 text-left text-white">Name</th>
                  <th className="p-3 text-left text-white">Capacity</th>
                  <th className="p-3 text-left text-white">Type</th>
                  <th className="p-3 text-left text-white">Status</th>
                  <th className="p-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id} className="border-t border-gray-700 hover:bg-[#2d3a5e]">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={room.selected || false}
                        onChange={() => toggleSelect(room._id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3 text-white">
                      {editingId === room._id ? (
                        <input
                          type="text"
                          value={editData.roomNumber || room.roomNumber}
                          onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })}
                          className="bg-[#0f172a] text-white px-2 py-1 rounded"
                        />
                      ) : (
                        room.roomNumber
                      )}
                    </td>
                    <td className="p-3 text-white">
                      {editingId === room._id ? (
                        <input
                          type="text"
                          value={editData.name || room.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="bg-[#0f172a] text-white px-2 py-1 rounded"
                        />
                      ) : (
                        room.name || '-'
                      )}
                    </td>
                    <td className="p-3 text-white">
                      {editingId === room._id ? (
                        <input
                          type="number"
                          value={editData.capacity || room.capacity}
                          onChange={(e) => setEditData({ ...editData, capacity: parseInt(e.target.value) })}
                          className="bg-[#0f172a] text-white px-2 py-1 rounded w-20"
                        />
                      ) : (
                        room.capacity
                      )}
                    </td>
                    <td className="p-3 text-white">
                      {editingId === room._id ? (
                        <select
                          value={editData.type || room.type}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                          className="bg-[#0f172a] text-white px-2 py-1 rounded"
                        >
                          <option>Classroom</option>
                          <option>Laboratory</option>
                          <option>Medical</option>
                          <option>Office</option>
                          <option>Factory</option>
                          <option>Conference</option>
                        </select>
                      ) : (
                        room.type
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${room.isAvailable ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-3">
                      {editingId === room._id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdate(room._id)} className="text-green-400 hover:text-green-300">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(room._id); setEditData({}); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                          <button onClick={() => handleDelete(room._id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Create Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] rounded-xl p-6 w-96">
              <h2 className="text-xl font-bold text-white mb-4">Bulk Create Rooms</h2>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Start Number"
                  value={bulkData.startNumber}
                  onChange={(e) => setBulkData({ ...bulkData, startNumber: parseInt(e.target.value) })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <input
                  type="number"
                  placeholder="End Number"
                  value={bulkData.endNumber}
                  onChange={(e) => setBulkData({ ...bulkData, endNumber: parseInt(e.target.value) })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <input
                  type="text"
                  placeholder="Prefix (e.g., 'A' or 'Room ')"
                  value={bulkData.prefix}
                  onChange={(e) => setBulkData({ ...bulkData, prefix: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={bulkData.capacity}
                  onChange={(e) => setBulkData({ ...bulkData, capacity: parseInt(e.target.value) })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                />
                <select
                  value={bulkData.roomType}
                  onChange={(e) => setBulkData({ ...bulkData, roomType: e.target.value })}
                  className="w-full p-2 bg-[#0f172a] text-white rounded"
                >
                  <option>Classroom</option>
                  <option>Laboratory</option>
                  <option>Medical</option>
                  <option>Office</option>
                  <option>Factory</option>
                  <option>Conference</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleBulkCreate} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Create {bulkData.endNumber - bulkData.startNumber + 1} Rooms
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

export default RoomManagement;