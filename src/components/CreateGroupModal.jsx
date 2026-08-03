import React, { useState } from 'react';
import { Users, X, UserPlus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CreateGroupModal({ currentUser, friends, onClose, onGroupCreated }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setLoading(true);
    try {
      await api.post('/api/groups/create', {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        createdBy: currentUser.id,
        memberIds: selectedGroupMembers
      });
      
      toast.success(`Group "${newGroupName}" created!`);
      onGroupCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (friendId) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(friendId) 
        ? prev.filter((id) => id !== friendId) 
        : [...prev, friendId]
    );
  };

  const selectAll = () => {
    if (selectedGroupMembers.length === friends.length) {
      setSelectedGroupMembers([]);
    } else {
      setSelectedGroupMembers(friends.map(f => f.id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Group</h3>
              <p className="text-xs text-slate-400">Private group chat</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Project Builders"
              className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="What is this group about?"
              className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-400">
                Add Members
              </label>
              {friends.length > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  {selectedGroupMembers.length === friends.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-800/30 p-2 rounded-xl border border-slate-700/30 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <UserPlus className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500">No contacts available</p>
                  <p className="text-[10px] text-slate-600">Add friends first to create a group</p>
                </div>
              ) : (
                friends.map((friend) => {
                  const isSelected = selectedGroupMembers.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => toggleMember(friend.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-500/10 border border-indigo-500/30' 
                          : 'hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {friend.username[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{friend.username}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {selectedGroupMembers.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-1">
                {selectedGroupMembers.length} member{selectedGroupMembers.length > 1 ? 's' : ''} selected
              </p>
            )}
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
              disabled={loading || !newGroupName.trim()}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}