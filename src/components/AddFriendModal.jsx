import React, { useState } from 'react';
import { UserPlus, Search, X, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function AddFriendModal({ currentUser, onClose, onFriendAdded }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/api/users/search?username=${query}&currentUserId=${currentUser.id}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendId, username) => {
    try {
      await api.post('/api/friends/add', { userId: currentUser.id, friendId });
      toast.success(`${username} added to contacts!`);
      onFriendAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contact.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Contact</h3>
              <p className="text-xs text-slate-400">Search by username</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchUsers(e.target.value)}
            placeholder="Search for a username..."
            className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all"
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {searching ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-xs text-slate-500 mt-2">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              {searchQuery ? (
                <>
                  <User className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">No users found</p>
                  <p className="text-xs text-slate-500 mt-1">Try a different username</p>
                </>
              ) : (
                <>
                  <UserPlus className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">Search for users</p>
                  <p className="text-xs text-slate-500 mt-1">Type a username to find contacts</p>
                </>
              )}
            </div>
          ) : (
            searchResults.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">
                    {user.username[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{user.username}</p>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFriend(user.id, user.username)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 shrink-0"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>

        {searchResults.length > 0 && (
          <p className="text-[10px] text-slate-500 mt-3 text-center">
            {searchResults.length} result{searchResults.length > 1 ? 's' : ''} found
          </p>
        )}
      </div>
    </div>
  );
}