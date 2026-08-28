import React from 'react';
import { BarChart3, History, ShieldAlert, Clock, FileSpreadsheet } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Traffic Analytics</h3>
        <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">
          Real-time AI telemetry analysis and predictions.
        </span>
      </div>

      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <BarChart3 size={32} />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Predictive Traffic Modeling</h4>
          <p className="text-xs text-slate-500 font-medium">
            AI telemetry processing is analyzing current flow indicators on NH-216 to model congestion predictions. Live charts will sync momentarily.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-full animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
          Running AI Neural Forecast Model v4.12
        </div>
      </div>
    </div>
  );
};

export const AuditLogPage: React.FC = () => {
  const auditLogs = [
    { time: '10:19 AM', operator: 'Ravi Kumar', action: 'Polled live stream sector 3 CAM-1024', status: 'Success' },
    { time: '10:14 AM', operator: 'System', action: 'Automatic watch list sync with RTO database', status: 'Completed' },
    { time: '10:05 AM', operator: 'Sunita Devi', action: 'Flagged vehicle AP09 AB 1234 as Resolved', status: 'Success' },
    { time: '09:50 AM', operator: 'Ravi Kumar', action: 'Modified general time format to 24 Hour', status: 'Success' },
    { time: '09:42 AM', operator: 'System', action: 'Scheduled database back-up sector A', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#F4EFE6] rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">System Audit Log</h3>
        <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">
          Verifiable cryptographic log of all operator and daemon operations.
        </span>
      </div>

      <div className="bg-white border border-[#F4EFE6] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recent Logs</span>
          <button className="text-xs text-[#0C2540] font-bold hover:underline flex items-center gap-1">
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-100 text-slate-500 rounded">
                  <History size={14} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{log.action}</div>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Performed by: {log.operator}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                  {log.status}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
