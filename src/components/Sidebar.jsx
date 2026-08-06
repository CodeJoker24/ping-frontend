import React, { useState, useEffect } from 'react';
import { MessageSquare, Hash, Plus, MessageCircle, LogOut, Users, X, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import socket from '../lib/socket'; // Make sure the path matches your socket instance location

export default function Sidebar({
  currentUser,
  channels = [],
  groups = [],
  friends: initialFriends = [],
  activeRoom,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectChannel,
  selectGroup,
  startDirectMessage,
  unreadCounts = {},
  onlineUsers = [],
  setShowChannelModal,
  setShowGroupModal,
  setShowAddModal,
  handleLogout
}) {
  const [collapsedSections, setCollapsedSections] = useState({
    channels: false,
    groups: false,
    dms: false
  });

  // Local state to manage friends dynamically in real-time
  const [friendsList, setFriendsList] = useState(initialFriends);

  // Sync state if initialProps change from parent
  useEffect(() => {
    setFriendsList(initialFriends);
  }, [initialFriends]);

  // Fetch updated friends list from the backend
  const fetchFriends = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.get(`/api/friends/${currentUser.id}`);
      setFriendsList(res.data || []);
    } catch (err) {
      console.error("Failed to load friends list:", err);
    }
  };

  // Real-time Socket.io listener for instant friend updates
  useEffect(() => {
    if (!currentUser?.id) return;

    // Listen for the socket event sent by the server
    socket.on("friend_added", fetchFriends);

    return () => {
      socket.off("friend_added", fetchFriends);
    };
  }, [currentUser?.id]);

  const uniqueFriends = Array.from(new Map(friendsList.map((f) => [f.id, f])).values());
  const uniqueGroups = Array.from(new Map(groups.map((g) => [g.id, g])).values());

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ title, section, onAdd, count }) => {
    const isCollapsed = collapsedSections[section];
    
    return (
      <div className="flex items-center justify-between px-3 py-1.5 group">
        <button
          onClick={() => toggleSection(section)}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors flex-1"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-slate-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-slate-500" />
          )}
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {title} {count > 0 && `(${count})`}
          </p>
        </button>
        {onAdd && !isCollapsed && (
          <button
            onClick={onAdd}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 transition-all hover:bg-slate-700/50 opacity-100"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const RoomItem = ({ name, icon: Icon, isActive, unread, onClick, showOnline, isOnline }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
        isActive 
          ? 'bg-indigo-500/10 text-indigo-400' 
          : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
        <span className="truncate">{name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {unread > 0 && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full min-w-[20px] text-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        {showOnline && (
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'}`} />
        )}
      </div>
    </button>
  );

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800/60 flex flex-col transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:w-72 shrink-0 ${
        mobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">Ping</span>
              <p className="text-[10px] text-slate-400 -mt-0.5">Workspace</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-700">
          {/* Channels */}
          <div className="p-2">
            <SectionHeader 
              title="Channels" 
              section="channels"
              count={channels.length}
              onAdd={() => setShowChannelModal(true)} 
            />
            {!collapsedSections.channels && (
              <nav className="space-y-0.5 mt-1">
                {channels.map((room) => {
                  const isActive = activeRoom === room.name;
                  const unread = unreadCounts[room.name] || 0;
                  return (
                    <RoomItem
                      key={room.id}
                      id={room.id}
                      name={room.name}
                      icon={Hash}
                      isActive={isActive}
                      unread={unread}
                      onClick={() => selectChannel(room)}
                    />
                  );
                })}
              </nav>
            )}
          </div>

          {/* Groups */}
          <div className="p-2">
            <SectionHeader 
              title="Groups" 
              section="groups"
              count={uniqueGroups.length}
              onAdd={() => setShowGroupModal(true)} 
            />
            {!collapsedSections.groups && (
              <nav className="space-y-0.5 mt-1">
                {uniqueGroups.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-500 italic">No groups joined</p>
                ) : (
                  uniqueGroups.map((group) => {
                    const isActive = activeRoom === group.id;
                    const unread = unreadCounts[group.id] || 0;
                    return (
                      <RoomItem
                        key={group.id}
                        id={group.id}
                        name={group.name}
                        icon={Users}
                        isActive={isActive}
                        unread={unread}
                        onClick={() => selectGroup && selectGroup(group)}
                      />
                    );
                  })
                )}
              </nav>
            )}
          </div>

          {/* Direct Messages */}
          <div className="p-2 pb-4">
            <SectionHeader 
              title="Direct Messages" 
              section="dms"
              count={uniqueFriends.length}
              onAdd={() => setShowAddModal(true)} 
            />
            {!collapsedSections.dms && (
              <nav className="space-y-0.5 mt-1">
                {uniqueFriends.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-500 italic">No contacts yet</p>
                ) : (
                  uniqueFriends.map((friend) => {
                    const dmRoomId = [currentUser?.id, friend.id].sort().join('_');
                    const isActive = activeRoom === dmRoomId;
                    const isOnline = onlineUsers.includes(friend.id);
                    const unread = unreadCounts[dmRoomId] || 0;

                    return (
                      <RoomItem
                        key={friend.id}
                        id={friend.id}
                        name={friend.username}
                        icon={MessageCircle}
                        isActive={isActive}
                        unread={unread}
                        onClick={() => startDirectMessage(friend)}
                        showOnline={true}
                        isOnline={isOnline}
                      />
                    );
                  })
                )}
              </nav>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-slate-800/60 bg-slate-800/20 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-700/50 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                  {(currentUser?.username || 'U')[0].toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm shadow-emerald-500/30" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">{currentUser?.username || 'User'}</p>
                <p className="text-[10px] text-slate-400">
                  {onlineUsers.length} {onlineUsers.length === 1 ? 'member' : 'members'} online
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}