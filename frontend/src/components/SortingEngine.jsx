import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SortingEngine = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mapView, setMapView] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [groupsRes, roomsRes, workersRes, assignmentsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/groups`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/rooms`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/workers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/sorting/assignments?date=${selectedDate}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setGroups(groupsRes.data.data.filter(g => g.status === 'pending'));
      setRooms(roomsRes.data.data);
      setWorkers(workersRes.data.data);
      setAssignments(assignmentsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSort = async () => {
    setSorting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/sorting/auto-assign`, 
        { date: selectedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAssignments(res.data.assignments);
      alert(`✅ Sorted ${res.data.assignments.filter(a => a.room).length} of ${res.data.summary.totalGroups} groups`);
    } catch (error) {
      console.error('Error auto-sorting:', error);
      alert('Error during sorting');
    } finally {
      setSorting(false);
    }
  };

  const handleConfirmAssignment = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/sorting/confirm/${assignmentId}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error confirming assignment:', error);
    }
  };

  const handleOverride = async (assignmentId, newRoomId, newWorkerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/sorting/override/${assignmentId}`,
        { newRoomId, newWorkerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error overriding assignment:', error);
    }
  };

  const handleViewMap = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sorting/map?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMapView(res.data);
      setShowMap(true);
    } catch (error) {
      console.error('Error loading map:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'good': return '🟢';
      case 'capacity-warning': return '🟡';
      case 'skill-warning': return '🟠';
      case 'warning': return '🔴';
      default: return '⚪';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Room Assignment Map - ${new Date(selectedDate).toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #00d1ff; }
            .room { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
            .good { background: #d4edda; border-left: 4px solid #28a745; }
            .capacity-warning { background: #fff3cd; border-left: 4px solid #ffc107; }
            .skill-warning { background: #ffe5d9; border-left: 4px solid #fd7e14; }
            .warning { background: #f8d7da; border-left: 4px solid #dc3545; }
            .room-number { font-size: 18px; font-weight: bold; }
            .assignment { margin-top: 10px; padding-left: 15px; }
          </style>
        </head>
        <body>
          <h1>📋 Room Assignment Map</h1>
          <p><strong>Date:</strong> ${new Date(selectedDate).toLocaleDateString()}</p>
          <p><strong>Organization:</strong> ${user?.organization?.name || 'TaskBridge'}</p>
          <hr/>
          ${mapView?.data.map(item => `
            <div class="room ${item.status}">
              <div class="room-number">${getStatusIcon(item.status)} Room ${item.room.roomNumber}${item.room.name ? ` - ${item.room.name}` : ''}</div>
              <div>Capacity: ${item.room.capacity} people</div>
              ${item.assignment ? `
                <div class="assignment">
                  <strong>📋 Group:</strong> ${item.assignment.groupName} (${item.assignment.peopleCount} people)<br/>
                  <strong>👤 Worker:</strong> ${item.assignment.workerName}<br/>
                  <strong>🎯 Required Skill:</strong> ${item.assignment.requiredSkill}<br/>
                  <strong>⭐ Match Score:</strong> ${item.assignment.matchScore}%
                </div>
              ` : '<div class="assignment"><em>No assignment yet</em></div>'}
            </div>
          `).join('')}
          <hr/>
          <p style="color: #666; font-size: 12px;">Generated by TaskBridge - Smart Workforce Management</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-[#0f172a] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">⚙️ Sorting Engine</h1>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-[#1e293b] text-white rounded border border-gray-600"
            />
            <button
              onClick={handleAutoSort}
              disabled={sorting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sorting ? '🔄 Sorting...' : '✨ SORT INTO ROOMS'}
            </button>
            <button
              onClick={handleViewMap}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🗺️ View Map
            </button>
          </div>
        </div>

        {/* Pending Groups Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">📋 Pending Groups ({groups.length})</h2>
          <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f172a]">
                  <tr>
                    <th className="p-3 text-left text-white">Group</th>
                    <th className="p-3 text-left text-white">People</th>
                    <th className="p-3 text-left text-white">Required Skill</th>
                    <th className="p-3 text-left text-white">Priority</th>
                    <th className="p-3 text-left text-white">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group._id} className="border-t border-gray-700">
                      <td className="p-3 text-white">{group.name}</td>
                      <td className="p-3 text-white">{group.peopleCount}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">{group.requiredSkill}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          group.priority === 'urgent' ? 'bg-red-600' : 
                          group.priority === 'high' ? 'bg-orange-600' : 
                          group.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                        } text-white`}>
                          {group.priority}
                        </span>
                      </td>
                      <td className="p-3 text-white">{group.startTime} - {group.endTime}</td>
                    </tr>
                  ))}
                  {groups.length === 0 && (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">No pending groups. Create some groups first!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Suggested Assignments */}
        {assignments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">💡 Suggested Assignments</h2>
            <div className="space-y-3">
              {assignments.map((assignment, idx) => (
                <div key={idx} className="bg-[#1e293b] rounded-xl p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{assignment.group.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getScoreColor(assignment.matchScore)} bg-gray-800`}>
                          Match: {assignment.matchScore}%
                        </span>
                      </div>
                      
                      {assignment.room ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="bg-[#0f172a] p-3 rounded">
                            <div className="text-blue-400 text-sm">🏠 Suggested Room</div>
                            <div className="text-white font-medium">Room {assignment.room.roomNumber}</div>
                            <div className="text-gray-400 text-sm">Capacity: {assignment.room.capacity} | Type: {assignment.room.type}</div>
                          </div>
                          <div className="bg-[#0f172a] p-3 rounded">
                            <div className="text-green-400 text-sm">👤 Suggested Worker</div>
                            <div className="text-white font-medium">{assignment.worker.name}</div>
                            <div className="text-gray-400 text-sm">Skills: {assignment.worker.specializations.join(', ')}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-900/30 p-3 rounded border border-red-600">
                          <div className="text-red-400">⚠️ No suitable match found</div>
                          <div className="text-gray-400 text-sm">{assignment.warnings?.join(', ')}</div>
                        </div>
                      )}
                      
                      {assignment.warnings && assignment.warnings.length > 0 && assignment.room && (
                        <div className="mt-3 text-yellow-400 text-sm">
                          ⚠️ {assignment.warnings.join(', ')}
                        </div>
                      )}
                    </div>
                    
                    {assignment.room && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleConfirmAssignment(assignment.assignmentId)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          ✓ Confirm
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map View Modal */}
        {showMap && mapView && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1e293b] p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">🗺️ Room Assignment Map</h2>
                <div className="flex gap-2">
                  <button onClick={handlePrint} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">🖨️ Print</button>
                  <button onClick={() => setShowMap(false)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">✕ Close</button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 mb-4">📅 {new Date(mapView.date).toLocaleDateString()}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mapView.data.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                      item.status === 'good' ? 'bg-green-900/20 border-green-500' :
                      item.status === 'capacity-warning' ? 'bg-yellow-900/20 border-yellow-500' :
                      item.status === 'skill-warning' ? 'bg-orange-900/20 border-orange-500' :
                      item.status === 'warning' ? 'bg-red-900/20 border-red-500' :
                      'bg-gray-800/50 border-gray-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getStatusIcon(item.status)}</span>
                        <h3 className="text-white font-semibold">Room {item.room.roomNumber}</h3>
                        {item.room.name && <span className="text-gray-400 text-sm">({item.room.name})</span>}
                      </div>
                      <div className="text-gray-400 text-sm">Capacity: {item.room.capacity} people</div>
                      {item.assignment ? (
                        <div className="mt-3 pl-3 border-l-2 border-blue-500">
                          <div className="text-white text-sm">📋 {item.assignment.groupName}</div>
                          <div className="text-gray-400 text-sm">👤 {item.assignment.workerName}</div>
                          <div className="text-gray-400 text-sm">🎯 {item.assignment.requiredSkill}</div>
                          <div className={`text-sm mt-1 ${getScoreColor(item.assignment.matchScore)}`}>
                            Match Score: {item.assignment.matchScore}%
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-gray-500 text-sm italic">No assignment yet</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortingEngine;