import React, { useState, useEffect } from 'react';
import { CalendarCheck, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { applyLeave, getLeaveApplications } from '../../services/storage';
import { getTodayDateString } from '../../constants/feedData';

export default function SubTabLeave({ activeUser }) {
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState(getTodayDateString());
  const [toDate, setToDate] = useState(getTodayDateString());
  const [reason, setReason] = useState('');
  const [leavesList, setLeavesList] = useState([]);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    const all = getLeaveApplications();
    setLeavesList(all);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    await applyLeave({
      name: activeUser.name || 'Shift In-Charge',
      role: 'Shift In-Charge',
      unit: activeUser.unit || 'Unit-1',
      shift: activeUser.shift || 'Shift A',
      type: leaveType,
      fromDate,
      toDate,
      reason
    });

    setReason('');
    setSubmittedMessage(true);
    loadLeaves();
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Apply Leave Form */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <CalendarCheck className="w-5 h-5 text-sky-500" />
          Apply for Mill Staff Leave
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Submit leave request directly to Plant Manager for review and authorization.
        </p>

        {submittedMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Leave application submitted successfully. It is pending Plant Manager review.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Leave Category
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Sick Leave">Medical / Sick Leave (SL)</option>
                <option value="Emergency Leave">Emergency / Urgent Leave</option>
                <option value="Compensatory Off">Compensatory Off (Comp-Off)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                From Date
              </label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                To Date
              </label>
              <input
                type="date"
                required
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
              Reason for Leave *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for leave..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#0d5575] to-[#00b4d8] hover:from-[#09435c] hover:to-[#0096c7] text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Submit Leave Application
            </button>
          </div>
        </form>
      </div>

      {/* Leave Status History */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 mb-4">
          Leave Application Status & History
        </h5>

        {leavesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2 font-semibold">Ref ID</th>
                  <th className="pb-2 font-semibold">Leave Type</th>
                  <th className="pb-2 font-semibold">Date Range</th>
                  <th className="pb-2 font-semibold">Reason</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leavesList.map(item => (
                  <tr key={item.id} className="py-2.5">
                    <td className="py-2.5 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{item.type}</td>
                    <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">
                      {item.fromDate} to {item.toDate}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">{item.reason}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : item.status === 'Rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {item.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {item.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center text-xs text-slate-400">
            No leave applications recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
