import React, { useState } from 'react';
import { 
  MessageSquare, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  ThumbsUp, 
  Filter,
  Send,
  Sparkles
} from 'lucide-react';

interface CitizenFeedbackItem {
  id: string;
  category: 'Signal Malfunction' | 'Traffic Congestion' | 'Road Hazard' | 'Reckless Driving' | 'Suggestion';
  location: string;
  citizenName: string;
  citizenPhone: string;
  description: string;
  severity: 'Urgent' | 'Medium' | 'Low';
  status: 'New' | 'Under Investigation' | 'Action Taken' | 'Resolved';
  timestamp: string;
  upvotes: number;
  officerNote?: string;
}

const initialFeedback: CitizenFeedbackItem[] = [
  {
    id: 'FB-2026-8812',
    category: 'Signal Malfunction',
    location: 'Outer Ring Road - Hebbal Junction, Pole #C-04',
    citizenName: 'Rahul Verma',
    citizenPhone: '+91 98451 23410',
    description: 'Traffic signal stuck on green for north corridor creating dangerous deadlock with intersecting traffic.',
    severity: 'Urgent',
    status: 'Under Investigation',
    timestamp: '10 mins ago',
    upvotes: 24,
    officerNote: 'Traffic Patrol Unit 4 dispatched for manual junction control and signal reset.'
  },
  {
    id: 'FB-2026-8809',
    category: 'Road Hazard',
    location: 'NH-44 Flyover Entry, KM 28.4',
    citizenName: 'Ananya Deshmukh',
    citizenPhone: '+91 97120 44589',
    description: 'Large oil spill and gravel debris scattered across lane 2 after heavy truck breakdown. Two-wheelers skidding.',
    severity: 'Urgent',
    status: 'Action Taken',
    timestamp: '45 mins ago',
    upvotes: 42,
    officerNote: 'Highway maintenance vehicle deployed with absorbent sand and warning cones.'
  },
  {
    id: 'FB-2026-8795',
    category: 'Traffic Congestion',
    location: 'Tech Park Gate 3 - Central Avenue',
    citizenName: 'Vikram Sundaram',
    citizenPhone: '+91 94432 99011',
    description: 'Illegal roadside parking of private cabs blocking entire left lane during evening peak hours.',
    severity: 'Medium',
    status: 'New',
    timestamp: '2 hours ago',
    upvotes: 15
  },
  {
    id: 'FB-2026-8780',
    category: 'Suggestion',
    location: 'Silk Board Interchange Corridor',
    citizenName: 'Pooja Hegde',
    citizenPhone: '+91 98860 12388',
    description: 'Recommend extending right-turn green signal timing by 15 seconds during 8:30 AM to 10:30 AM morning rush.',
    severity: 'Low',
    status: 'Resolved',
    timestamp: 'Yesterday',
    upvotes: 68,
    officerNote: 'Signal timing optimization algorithm adjusted. Peak throughput improved by 18%.'
  }
];

export const CitizenFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<CitizenFeedbackItem[]>(initialFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);

  // New Feedback Form State
  const [newCategory, setNewCategory] = useState<CitizenFeedbackItem['category']>('Traffic Congestion');
  const [newLocation, setNewLocation] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Urgent' | 'Medium' | 'Low'>('Medium');

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim() || !newDesc.trim() || !newName.trim()) return;

    const newItem: CitizenFeedbackItem = {
      id: `FB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCategory,
      location: newLocation,
      citizenName: newName,
      citizenPhone: newPhone || '+91 9XXXXXXXXX',
      description: newDesc,
      severity: newSeverity,
      status: 'New',
      timestamp: 'Just now',
      upvotes: 1
    };

    setFeedbacks(prev => [newItem, ...prev]);
    setShowModal(false);
    // Reset form
    setNewLocation('');
    setNewName('');
    setNewPhone('');
    setNewDesc('');
  };

  const handleUpdateStatus = (id: string, newStatus: CitizenFeedbackItem['status']) => {
    setFeedbacks(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleUpvote = (id: string) => {
    setFeedbacks(prev =>
      prev.map(item => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
  };

  const filteredItems = feedbacks.filter(item => {
    const matchesSearch = 
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = feedbacks.length;
  const urgentCount = feedbacks.filter(f => f.severity === 'Urgent' && f.status !== 'Resolved').length;
  const resolvedCount = feedbacks.filter(f => f.status === 'Resolved').length;
  const inProgressCount = feedbacks.filter(f => f.status === 'Under Investigation' || f.status === 'Action Taken').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 gov-card-interactive">
        <div>
          <div className="flex items-center gap-2 text-[#0A2540] font-black text-xs uppercase tracking-wider mb-1">
            <MessageSquare size={16} />
            <span>Public Redressal &amp; Incident Desk — Integrated with CPGRAMS</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800 tracking-tight flex items-center gap-2.5">
            <span>Citizen Grievance &amp; Feedback Portal</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
              CPGRAMS Synced
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time citizen crowd-sourced alerts, hazard reporting, and road condition feedback directly mapped to MoRTH Citizen Redressal Cell &amp; NHAI Field Units.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#0A2540] hover:bg-[#163E66] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <PlusCircle size={16} />
          <span>+ Submit Citizen Report</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Reports Logged</span>
          <span className="text-4xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-slate-800">{totalCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-red-500 block">Urgent Active Hazards</span>
          <span className="text-4xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-red-600">{urgentCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-orange-500 block">Under Action / Patrol</span>
          <span className="text-4xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-orange-600">{inProgressCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-green-600 block">Successfully Resolved</span>
          <span className="text-4xl font-black tracking-tight group-hover:scale-105 transition-transform origin-left text-green-700">{resolvedCount}</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket ID, citizen name, location, or issue description..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
          >
            <option value="All">All Categories</option>
            <option value="Signal Malfunction">Signal Malfunction</option>
            <option value="Road Hazard">Road Hazard</option>
            <option value="Traffic Congestion">Traffic Congestion</option>
            <option value="Suggestion">Suggestion</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0A2540]"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Action Taken">Action Taken</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3 hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0A2540] bg-slate-100 px-2 py-0.5 rounded">
                  {item.id}
                </span>
                <span className="text-xs font-extrabold text-slate-800">
                  {item.category}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  item.severity === 'Urgent' ? 'bg-red-100 text-red-700' :
                  item.severity === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.severity} Priority
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">{item.timestamp}</span>
                {/* Status Dropdown */}
                <select
                  value={item.status}
                  onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                    item.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                    item.status === 'Action Taken' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    item.status === 'Under Investigation' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="New">New</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Action Taken">Action Taken</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Location & Details */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin size={14} className="text-red-500 flex-shrink-0" />
              <span>{item.location}</span>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {item.description}
            </p>

            {/* Officer Note if present */}
            {item.officerNote && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 block">
                    Traffic Control Center Dispatch Note:
                  </span>
                  <p className="font-medium mt-0.5">{item.officerNote}</p>
                </div>
              </div>
            )}

            {/* Citizen info + Upvote Bar */}
            <div className="flex flex-wrap justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User size={13} className="text-slate-400" />
                  {item.citizenName}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Phone size={13} />
                  {item.citizenPhone}
                </span>
              </div>

              <button
                onClick={() => handleUpvote(item.id)}
                className="flex items-center gap-1 text-xs font-bold text-[#0A2540] hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                <ThumbsUp size={13} />
                <span>Verify / Upvote ({item.upvotes})</span>
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-300">
            No citizen feedback tickets found for the selected search or filters.
          </div>
        )}
      </div>

      {/* Modal: Submit New Citizen Feedback */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#0A2540]">
                <PlusCircle size={18} />
                <h3 className="text-base font-black text-slate-900">
                  Submit Citizen Feedback / Hazard
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Issue Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#0A2540]"
                >
                  <option value="Traffic Congestion">Traffic Congestion</option>
                  <option value="Signal Malfunction">Signal Malfunction</option>
                  <option value="Road Hazard">Road Hazard / Debris</option>
                  <option value="Reckless Driving">Reckless Driving Incident</option>
                  <option value="Suggestion">General Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Location / Junction Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road Junction 4, Near Bridge 2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#0A2540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Citizen Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#0A2540]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#0A2540]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Priority / Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'Urgent'] as const).map((sev) => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setNewSeverity(sev)}
                      className={`py-1.5 rounded-lg border text-center font-bold ${
                        newSeverity === sev 
                          ? 'bg-[#0A2540] text-white border-[#0A2540]' 
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the condition, vehicle plates, or road obstacle in detail..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-[#0A2540]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-[#0A2540] transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A2540] hover:bg-[#16385C] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Send size={14} />
                  <span>Register Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
