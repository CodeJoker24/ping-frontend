import React, { useState } from 'react';
import { Hash, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CreateChannelModal({ currentUser, onClose, onChannelCreated }) {
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/api/channels/create', {
        name: newChannelName.trim(),
        description: newChannelDesc.trim(),
        createdBy: currentUser.id
      });
      toast.success(`Channel #${res.data.name} created!`);
      onChannelCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Hash className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Channel</h3>
              <p className="text-xs text-slate-400">Public workspace channel</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateChannel} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Channel Name
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="design-talk"
                className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={newChannelDesc}
              onChange={(e) => setNewChannelDesc(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs font-medium rounded-xl border border-slate-700/30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newChannelName.trim()}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Channel
                  <Plus className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}