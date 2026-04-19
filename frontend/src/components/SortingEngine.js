import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/roomAssignment.css';

const SortingEngine = ({ user, onNavigate }) => {
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mapView, setMapView] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('taskbridge_language') || 'en';
  });

  const t = {
    en: {
      title: 'Sorting Engine',
      subtitle: 'Automatically match groups to the best available rooms and workers',
      back: 'X',
      autoSort: '✨ Sort Into Rooms',
      viewMap: '🗺️ View Map',
      pendingGroups: '📋 Pending Groups',
      suggestedAssignments: '💡 Suggested Assignments',
      groupName: 'Group',
      people: 'People',
      requiredSkill: 'Required Skill',
      priority: 'Priority',
      time: 'Time',
      matchScore: 'Match Score',
      suggestedRoom: 'Suggested Room',
      suggestedWorker: 'Suggested Worker',
      confirm: '✓ Confirm',
      noMatches: 'No suitable match found',
      warnings: 'Warnings',
      loading: 'Loading...',
      sortingInProgress: 'Sorting in progress...',
      sortSuccess: 'Sorted {assigned} of {total} groups',
      noPendingGroups: 'No pending groups. Create some groups first!',
      mapTitle: 'Room Assignment Map',
      print: '🖨️ Print',
      close: '✕ Close',
      date: 'Date',
      legend: 'Legend',
      good: '🟢 Good - Perfect match',
      capacityWarning: '🟡 Capacity Warning',
      skillWarning: '🟠 Skill Warning',
      critical: '🔴 Critical - Multiple issues',
      assignedTo: 'Assigned To',
      noAssignment: 'No assignment yet',
      capacity: 'Capacity',
      roomType: 'Type'
    },
    sv: {
      title: 'Sorteringsmotor',
      subtitle: 'Matcha automatiskt grupper till de bästa tillgängliga rummen och arbetarna',
      back: 'X',
      autoSort: '✨ Sortera in i rum',
      viewMap: '🗺️ Visa karta',
      pendingGroups: '📋 Väntande grupper',
      suggestedAssignments: '💡 Föreslagna tilldelningar',
      groupName: 'Grupp',
      people: 'Personer',
      requiredSkill: 'Erforderlig kompetens',
      priority: 'Prioritet',
      time: 'Tid',
      matchScore: 'Matchpoäng',
      suggestedRoom: 'Föreslaget rum',
      suggestedWorker: 'Föreslagen arbetare',
      confirm: '✓ Bekräfta',
      noMatches: 'Ingen lämplig matchning hittades',
      warnings: 'Varningar',
      loading: 'Laddar...',
      sortingInProgress: 'Sortering pågår...',
      sortSuccess: 'Sorterade {assigned} av {total} grupper',
      noPendingGroups: 'Inga väntande grupper. Skapa några grupper först!',
      mapTitle: 'Rumstilldelningskarta',
      print: '🖨️ Skriv ut',
      close: '✕ Stäng',
      date: 'Datum',
      legend: 'Teckenförklaring',
      good: '🟢 Bra - Perfekt matchning',
      capacityWarning: '🟡 Kapacitetsvarning',
      skillWarning: '🟠 Kompetensvarning',
      critical: '🔴 Kritisk - Flera problem',
      assignedTo: 'Tilldelad till',
      noAssignment: 'Ingen tilldelning ännu',
      capacity: 'Kapacitet',
      roomType: 'Typ'
    }
  };

  const lang = t[language];

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const groupsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGroups(groupsRes.data.data.filter(g => g.status === 'pending'));
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
      alert(lang.sortSuccess.replace('{assigned}', res.data.assignments.filter(a => a.room).length).replace('{total}', res.data.summary.totalGroups));
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
      // Remove from assignments list
      setAssignments(assignments.filter(a => a.assignmentId !== assignmentId));
    } catch (error) {
      console.error('Error confirming assignment:', error);
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
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
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
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
            .badge-success { background: #d4edda; color: #155724; }
            .badge-warning { background: #fff3cd; color: #856404; }
            .badge-danger { background: #f8d7da; color: #721c24; }
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
              <div>${lang.capacity}: ${item.room.capacity} people | ${lang.roomType}: ${item.room.type}</div>
              ${item.assignment ? `
                <div class="assignment">
                  <strong>📋 ${lang.assignedTo}:</strong> ${item.assignment.groupName} (${item.assignment.peopleCount} people)<br/>
                  <strong>👤 Worker:</strong> ${item.assignment.workerName}<br/>
                  <strong>🎯 Required Skill:</strong> ${item.assignment.requiredSkill}<br/>
                  <strong>⭐ Match Score:</strong> ${item.assignment.matchScore}%
                </div>
              ` : `<div class="assignment"><em>${lang.noAssignment}</em></div>`}
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

  if (loading) {
    return (
      <div className="room-assignment-container">
        <div className="loading-spinner">{lang.loading}</div>
      </div>
    );
  }

  return (
    <div className="room-assignment-container">
      <div className="header">
        <div className="header-left">
          <button className="back-button" onClick={() => onNavigate('superadmin')}>
            ← {lang.back}
          </button>
          <div>
            <h1>⚙️ {lang.title}</h1>
            <p className="subtitle">{lang.subtitle}</p>
          </div>
        </div>
        <div className="action-buttons">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto', margin: 0 }}
          />
          <button className="btn-primary" onClick={handleAutoSort} disabled={sorting}>
            {sorting ? '🔄 ' + lang.sortingInProgress : lang.autoSort}
          </button>
          <button className="btn-secondary" onClick={handleViewMap}>
            {lang.viewMap}
          </button>
        </div>
      </div>

      {/* Pending Groups Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: 'white', fontSize: '18px', marginBottom: '16px' }}>{lang.pendingGroups}</h2>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>{lang.groupName}</th>
                <th>{lang.people}</th>
                <th>{lang.requiredSkill}</th>
                <th>{lang.priority}</th>
                <th>{lang.time}</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    {lang.noPendingGroups}
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group._id}>
                    <td>{group.name}</td>
                    <td>{group.peopleCount}</td>
                    <td><span className="skill-tag">{group.requiredSkill}</span></td>
                    <td>
                      <span className={`badge ${
                        group.priority === 'urgent' ? 'badge-danger' :
                        group.priority === 'high' ? 'badge-warning' :
                        group.priority === 'medium' ? 'badge-info' : 'badge-secondary'
                      }`}>
                        {group.priority}
                      </span>
                    </td>
                    <td>{group.startTime} - {group.endTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Assignments */}
      {assignments.length > 0 && (
        <div>
          <h2 style={{ color: 'white', fontSize: '18px', marginBottom: '16px' }}>{lang.suggestedAssignments}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assignments.map((assignment, idx) => (
              <div key={idx} style={{ background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ color: 'white', margin: 0 }}>{assignment.group.name}</h3>
                      <span style={{ background: getScoreColor(assignment.matchScore), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                        {lang.matchScore}: {assignment.matchScore}%
                      </span>
                    </div>
                    
                    {assignment.room ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '12px' }}>
                        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ color: '#00d1ff', fontSize: '12px', marginBottom: '4px' }}>{lang.suggestedRoom}</div>
                          <div style={{ color: 'white', fontWeight: 'bold' }}>Room {assignment.room.roomNumber}</div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{lang.capacity}: {assignment.room.capacity} | {lang.roomType}: {assignment.room.type}</div>
                        </div>
                        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ color: '#10b981', fontSize: '12px', marginBottom: '4px' }}>{lang.suggestedWorker}</div>
                          <div style={{ color: 'white', fontWeight: 'bold' }}>{assignment.worker.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{lang.specializations}: {assignment.worker.specializations?.join(', ')}</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', marginTop: '12px' }}>
                        <div style={{ color: '#ef4444' }}>⚠️ {lang.noMatches}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>{assignment.warnings?.join(', ')}</div>
                      </div>
                    )}
                    
                    {assignment.warnings && assignment.warnings.length > 0 && assignment.room && (
                      <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', borderLeft: `3px solid #f59e0b` }}>
                        <div style={{ color: '#f59e0b', fontSize: '12px' }}>⚠️ {lang.warnings}:</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{assignment.warnings.join(', ')}</div>
                      </div>
                    )}
                  </div>
                  
                  {assignment.room && (
                    <button className="btn-success" onClick={() => handleConfirmAssignment(assignment.assignmentId)}>
                      {lang.confirm}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {showMap && mapView && (
        <div className="modal-overlay" onClick={() => setShowMap(false)}>
          <div className="modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>{lang.mapTitle}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={handlePrint}>{lang.print}</button>
                <button className="modal-close" onClick={() => setShowMap(false)}>×</button>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>{lang.date}: {new Date(mapView.date).toLocaleDateString()}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🟢</span><span style={{ color: 'white', fontSize: '12px' }}>{lang.good}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🟡</span><span style={{ color: 'white', fontSize: '12px' }}>{lang.capacityWarning}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🟠</span><span style={{ color: 'white', fontSize: '12px' }}>{lang.skillWarning}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>🔴</span><span style={{ color: 'white', fontSize: '12px' }}>{lang.critical}</span></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {mapView.data.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                  item.status === 'good' ? 'bg-green-900/20 border-green-500' :
                  item.status === 'capacity-warning' ? 'bg-yellow-900/20 border-yellow-500' :
                  item.status === 'skill-warning' ? 'bg-orange-900/20 border-orange-500' :
                  'bg-red-900/20 border-red-500'
                }`} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${
                  item.status === 'good' ? '#10b981' :
                  item.status === 'capacity-warning' ? '#f59e0b' :
                  item.status === 'skill-warning' ? '#fd7e14' : '#ef4444'
                }` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{getStatusIcon(item.status)}</span>
                    <h3 style={{ color: 'white', margin: 0 }}>Room {item.room.roomNumber}</h3>
                    {item.room.name && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>({item.room.name})</span>}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{lang.capacity}: {item.room.capacity} people | {lang.roomType}: {item.room.type}</div>
                  {item.assignment ? (
                    <div style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid #00d1ff' }}>
                      <div style={{ color: 'white', fontSize: '13px' }}>📋 {item.assignment.groupName}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>👤 {item.assignment.workerName}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>🎯 {item.assignment.requiredSkill}</div>
                      <div style={{ color: getScoreColor(item.assignment.matchScore), fontSize: '12px', marginTop: '4px' }}>
                        ⭐ {lang.matchScore}: {item.assignment.matchScore}%
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic' }}>
                      {lang.noAssignment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortingEngine;