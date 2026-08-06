import React from 'react';
import { Hash, Users, MessageCircle, Settings, Menu } from 'lucide-react';

export default function ChatHeader({
  activeRoomName,
  activeRoomType,
  activeGroupData,
  currentUser,
  onOpenMobileMenu,
  onOpenGroupSettings
}) {
  const getRoomIcon = () => {
    switch (activeRoomType) {
      case 'channel':
        return <Hash className="w-5 h-5 text-indigo-400" />;
      case 'group':
        return <Users className="w-5 h-5 text-indigo-400" />;
      case 'dm':
        return <MessageCircle className="w-5 h-5 text-indigo-400" />;
      default:
        return null;
    }
  };

  
  const memberCount = activeGroupData?.group_members?.length || 0;

  return (
    <header className="h-14 px-4 md:px-6 border-b border-slate-800/40 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            {getRoomIcon()}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-100 text-sm truncate leading-tight">
              {activeRoomType === 'channel' ? `#${activeRoomName}` : activeRoomName}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              {activeRoomType === 'channel' && 'Public channel'}
              {activeRoomType === 'group' && `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
              {activeRoomType === 'dm' && 'Direct message'}
            </p>
          </div>
        </div>
      </div>

      {activeRoomType === 'group' && activeGroupData && (
        <button
          onClick={onOpenGroupSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/30 transition-all cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Group Settings</span>
        </button>
      )}
    </header>
  );
}