import React, { useState } from 'react';
import { Smile, Trash2, Edit2, FileText, MoreVertical, X } from 'lucide-react';

export default function MessageList({
  messages,
  loadingHistory,
  activeRoomName,
  currentUser,
  typingUsers,
  editingMessageId,
  editingContent,
  setEditingMessageId,
  setEditingContent,
  handleSaveEdit,
  handleDeleteMessage,
  handleToggleReaction
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '😂', '🎉'];

  const toggleMenu = (messageId) => {
    setOpenMenuId(openMenuId === messageId ? null : messageId);
    setShowReactionPicker(null);
  };

  const toggleReactionPicker = (messageId, e) => {
    e.stopPropagation();
    setShowReactionPicker(showReactionPicker === messageId ? null : messageId);
    setOpenMenuId(null);
  };

  if (loadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Loading conversation...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
          <p className="text-base font-medium">Welcome to #{activeRoomName}</p>
          <p className="text-xs">This is the start of your conversation.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id || msg.sender?.id === currentUser.id;
          const isTemp = msg.id.toString().startsWith('temp-');
          const senderName = isMe ? 'You' : (msg.sender?.username || 'User');
          const isMenuOpen = openMenuId === msg.id;
          const isReactionPickerOpen = showReactionPicker === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 group relative ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isMe ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {(senderName === 'You' ? currentUser.username : senderName)[0].toUpperCase()}
              </div>

              <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-xs font-semibold text-slate-300">
                    {senderName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {editingMessageId === msg.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="bg-slate-800 border border-indigo-500 rounded-lg px-3 py-1 text-sm text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(msg.id)}
                      className="px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-lg font-medium cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMessageId(null)}
                      className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed inline-block relative ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}>
                      {msg.content}

                      {msg.attachmentUrl && msg.attachmentType?.startsWith('image/') && (
                        <div className="mt-2">
                          <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            className="max-w-xs rounded-lg border border-slate-700 object-cover"
                          />
                        </div>
                      )}

                      {msg.attachmentUrl && !msg.attachmentType?.startsWith('image/') && (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 flex items-center gap-2 p-2 bg-slate-900/60 rounded-lg border border-slate-700 text-xs text-indigo-300 hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{msg.attachmentName || 'Download File'}</span>
                        </a>
                      )}
                    </div>

                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {msg.reactions.map((r, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded-md text-[11px]">
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {!isTemp && !editingMessageId && (
                <>
                  {/* Desktop hover actions */}
                  <div className={`hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1 self-center ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className="relative group/picker">
                      <button className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 cursor-pointer">
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      <div className="hidden group-hover/picker:flex absolute bottom-full mb-1 bg-slate-900 border border-slate-800 p-1 rounded-lg shadow-xl gap-1 z-20">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="hover:bg-slate-800 p-1 rounded text-xs cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isMe && (
                      <>
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditingContent(msg.content);
                          }}
                          className="p-1 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Mobile three-dot menu */}
                  <div className="md:hidden flex items-start self-start relative">
                    <button
                      onClick={() => toggleMenu(msg.id)}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800/50 transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className={`absolute z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 p-1 min-w-[140px] ${
                          isMe ? 'right-0 top-8' : 'left-0 top-8'
                        }`}>
                          <button
                            onClick={(e) => toggleReactionPicker(msg.id, e)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
                          >
                            <Smile className="w-3.5 h-3.5" />
                            React
                          </button>
                          
                          {isMe && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditingContent(msg.content);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteMessage(msg.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    {/* Mobile Reaction Picker */}
                    {isReactionPickerOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowReactionPicker(null)}
                        />
                        <div className={`absolute z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 p-2 ${
                          isMe ? 'right-0 top-8' : 'left-0 top-8'
                        }`}>
                          <div className="flex items-center gap-1">
                            {EMOJI_OPTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  handleToggleReaction(msg.id, emoji);
                                  setShowReactionPicker(null);
                                }}
                                className="hover:bg-slate-800 p-2 rounded-lg text-xl transition-all hover:scale-110"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setShowReactionPicker(null)}
                              className="hover:bg-slate-800 p-2 rounded-lg text-slate-400 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })
      )}

      {typingUsers.size > 0 && (
        <p className="text-xs text-slate-500 italic pl-2">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </p>
      )}
    </div>
  );
}