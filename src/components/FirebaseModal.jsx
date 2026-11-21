import React, { useState } from 'react';
import { X, Database, Check, AlertCircle, Trash2, Key } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig } from '../services/firebase';

export default function FirebaseModal({ isOpen, onClose }) {
  const current = getSavedFirebaseConfig();
  const [apiKey, setApiKey] = useState(current?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(current?.authDomain || '');
  const [projectId, setProjectId] = useState(current?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(current?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(current?.messagingSenderId || '');
  const [appId, setAppId] = useState(current?.appId || '');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJsonPaste = (e) => {
    const val = e.target.value;
    setJsonInput(val);
    try {
      const clean = val.replace(/const\s+firebaseConfig\s*=\s*/, '').replace(/;\s*$/, '');
      const parsed = JSON.parse(clean);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setError('');
    } catch (err) {
      // not valid json yet
    }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setError('Please provide at least API Key and Project ID.');
      return;
    }
    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };
    saveFirebaseConfig(config);
  };

  const handleClear = () => {
    if (window.confirm('Do you want to disconnect Firestore and revert to Offline Local Storage mode?')) {
      clearFirebaseConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-500">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Cloud Firestore Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Google Cloud Firestore Integration for Live Synchronization</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 mb-4 leading-relaxed">
          The app works seamlessly in <strong>Offline Local Storage mode</strong>. To sync data across multiple plant devices in real time, paste your Firebase Web project configuration below:
        </p>

        {/* Quick Paste Box */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Quick Paste (firebaseConfig JSON)
          </label>
          <textarea
            value={jsonInput}
            onChange={handleJsonPaste}
            placeholder='{ "apiKey": "AIzaSy...", "projectId": "sandhya-marines-..." }'
            rows={2}
            className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">API Key *</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full mt-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Project ID *</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="sandhya-marines"
                className="w-full mt-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="sandhya-marines.firebaseapp.com"
                className="w-full mt-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="sandhya-marines.appspot.com"
                className="w-full mt-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:123456789:web:abcdef"
                className="w-full mt-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {current ? (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-500 hover:text-rose-600 font-medium text-xs rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <Trash2 className="w-4 h-4" /> Disconnect Cloud
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0d5575] hover:bg-[#093c52] text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" /> Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
