import React, { useState } from 'react';
import { Settings, Users, UserPlus, Shield, UserX, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function GroupSettingsModal({ currentUser, group, friends, onClose, onGroupUpdated }) {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentMember = group?.group_members?.find((m) => m.user_id === currentUser.id);
  const isAdmin = currentMember?.role === 'admin';

  const groupMemberIds = group?.group_members?.map((m) => m.user_id) || [];
  const availableFriends = friends.filter((f) => !groupMemberIds.includes(f.id));

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) return;
    setLoading(true);
    try {
      await api.post(`/api/groups/${group.id}/add-members`, {
        adminId: currentUser.id,
        memberIds: selectedFriends
      });
      toast.success('Members added successfully!');
      setSelectedFriends([]);
      onGroupUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add members.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    setLoading(true);
    try {
      await api.post(`/api/groups/${group.id}/remove-member`, {
        adminId: currentUser.id,
        targetUserId
      });
      toast.success('Member removed.');
      onGroupUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (targetUserId) => {
    setLoading(true);
    try {
      await api.post(`/api/groups/${group.id}/make-admin`, {
        adminId: currentUser.id,
        targetUserId
      });
      toast.success('Member promoted to admin.');
      onGroupUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote member.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/api/groups/${group.id}`, {
        data: { adminId: currentUser.id }
      });
      toast.success('Group deleted.');
      onGroupUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white">{group.name} Settings</h3>
              <p className="text-xs text-slate-400">{group.group_members?.length || 0} members</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-800 my-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Members List
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'add'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Add Members
            </button>
          )}
        </div>

        {activeTab === 'members' && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {group.group_members?.map((member) => {
              const user = member.user;
              const isTargetAdmin = member.role === 'admin';
              const isSelf = member.user_id === currentUser.id;

              return (
                <div key={member.id || member.user_id} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                      {(user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        {user?.username || 'Unknown'}
                        {isSelf && <span className="text-[10px] text-indigo-400 font-normal">(You)</span>}
                      </p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        isTargetAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-1">
                      {!isTargetAdmin && (
                        <button
                          onClick={() => handleMakeAdmin(member.user_id)}
                          disabled={loading}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Promote to Admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove from Group"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'add' && isAdmin && (
          <div className="space-y-4">
            <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-800/40 p-2 rounded-xl border border-slate-800">
              {availableFriends.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">All your contacts are already in this group.</p>
              ) : (
                availableFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <div
                      key={friend.id}
                      onClick={() => {
                        setSelectedFriends((prev) =>
                          isSelected ? prev.filter((id) => id !== friend.id) : [...prev, friend.id]
                        );
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-600/30 border border-indigo-500/40' : 'hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-200">{friend.username}</span>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={handleAddMembers}
              disabled={loading || selectedFriends.length === 0}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Selected Members
            </button>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
          {isAdmin ? (
            <button
              onClick={handleDeleteGroup}
              disabled={loading}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Group
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}