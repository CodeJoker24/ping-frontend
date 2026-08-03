import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import socket from '../lib/socket';
import api from '../lib/api';

import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import AddFriendModal from '../components/AddFriendModal';
import CreateChannelModal from '../components/CreateChannelModal';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupSettingsModal from '../components/GroupSettingsModal';

export default function ChatPage() {
  const navigate = useNavigate();
  const typingTimeoutRef = useRef(null);

  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { id: '', username: 'User', email: '' };
  });

  const [channels, setChannels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeRoom, setActiveRoom] = useState('');
  const [activeRoomName, setActiveRoomName] = useState('');
  const [activeRoomType, setActiveRoomType] = useState('channel');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);

  const activeGroupData = groups.find((g) => g.id === activeRoom);

  const fetchWorkspaceData = async () => {
    try {
      const [chRes, groupRes, friendRes] = await Promise.all([
        api.get('/api/channels'),
        api.get(`/api/groups/${currentUser.id}`),
        api.get(`/api/friends/${currentUser.id}`)
      ]);

      const channelList = chRes.data || [];
      setChannels(channelList);
      setGroups(groupRes.data || []);
      setFriends(friendRes.data || []);

      if (channelList.length > 0 && !activeRoom) {
        setActiveRoom(channelList[0].name);
        setActiveRoomName(channelList[0].name);
        setActiveRoomType('channel');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit('setup', currentUser);
    }

    fetchWorkspaceData();

    const handleOnlineUsers = (users) => setOnlineUsers(users);
    const handleChannelCreated = (newCh) => setChannels((p) => [...p, newCh]);

    const handleAddedToGroup = (newGrp) => {
      setGroups((prev) => {
        if (prev.some((g) => g.id === newGrp.id)) return prev;
        return [...prev, newGrp];
      });
      toast.success(`You were added to group "${newGrp.name}"`);
    };

    const handleGroupUpdated = (updatedGrp) => {
      setGroups((prev) => prev.map((g) => (g.id === updatedGrp.id ? updatedGrp : g)));
    };

    const handleRemovedFromGroup = ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast.error('You were removed from a group.');
    };

    const handleGroupDeleted = ({ groupId }) => {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast.error('Group was deleted by admin.');
    };

    const handleMessageEdited = (upd) => setMessages((prev) => prev.map((m) => (m.id === upd.id ? upd : m)));
    const handleMessageDeleted = ({ messageId }) => setMessages((prev) => prev.filter((m) => m.id !== messageId));
    const handleReactionUpdated = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)));
    };

    const handleUserTyping = ({ username }) => setTypingUsers((prev) => new Set(prev).add(username));
    const handleUserStopTyping = ({ username }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('channel_created', handleChannelCreated);
    socket.on('added_to_group', handleAddedToGroup);
    socket.on('group_updated', handleGroupUpdated);
    socket.on('removed_from_group', handleRemovedFromGroup);
    socket.on('group_deleted', handleGroupDeleted);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('reaction_updated', handleReactionUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('channel_created', handleChannelCreated);
      socket.off('added_to_group', handleAddedToGroup);
      socket.off('group_updated', handleGroupUpdated);
      socket.off('removed_from_group', handleRemovedFromGroup);
      socket.off('group_deleted', handleGroupDeleted);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('reaction_updated', handleReactionUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (newMsg) => {
      if (newMsg.room_id === activeRoom || newMsg.roomId === activeRoom) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;

          const filtered = prev.filter(
            (m) => !(m.id.toString().startsWith('temp-') && m.sender_id === newMsg.sender_id && m.content === newMsg.content)
          );

          return [...filtered, newMsg];
        });
      } else {
        const roomId = newMsg.room_id || newMsg.roomId;
        setUnreadCounts((prev) => ({ ...prev, [roomId]: (prev[roomId] || 0) + 1 }));
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [activeRoom]);

  useEffect(() => {
    if (!activeRoom) return;

    socket.emit('join_room', activeRoom);
    setTypingUsers(new Set());
    setUnreadCounts((prev) => {
      const copy = { ...prev };
      delete copy[activeRoom];
      return copy;
    });

    setLoadingHistory(true);
    api.get(`/api/messages/${activeRoom}`)
      .then((res) => setMessages(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingHistory(false));
  }, [activeRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const content = messageInput.trim();
    setMessageInput('');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stop_typing', { roomId: activeRoom, username: currentUser.username });

    const tempMessage = {
      id: 'temp-' + Date.now(),
      room_id: activeRoom,
      sender_id: currentUser.id,
      content,
      created_at: new Date().toISOString(),
      sender: { username: currentUser.username },
      reactions: []
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit('send_message', {
      roomId: activeRoom,
      senderId: currentUser.id,
      content,
    });
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    socket.emit('typing', { roomId: activeRoom, username: currentUser.username });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId: activeRoom, username: currentUser.username });
    }, 2000);
  };

  const handleSaveEdit = (messageId) => {
    if (!editingContent.trim() || messageId.toString().startsWith('temp-')) return;
    socket.emit('edit_message', { messageId, content: editingContent.trim(), roomId: activeRoom });
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = (messageId) => {
    if (messageId.toString().startsWith('temp-')) return;
    socket.emit('delete_message', { messageId, roomId: activeRoom });
  };

  const handleToggleReaction = (messageId, emoji) => {
    if (messageId.toString().startsWith('temp-')) return;
    socket.emit('toggle_reaction', { messageId, userId: currentUser.id, emoji, roomId: activeRoom });
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white relative">
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <Sidebar
        currentUser={currentUser}
        channels={channels}
        groups={groups}
        friends={friends}
        activeRoom={activeRoom}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        selectChannel={(ch) => {
          setActiveRoom(ch.name);
          setActiveRoomName(ch.name);
          setActiveRoomType('channel');
          setMobileMenuOpen(false);
        }}
        selectGroup={(grp) => {
          setActiveRoom(grp.id);
          setActiveRoomName(grp.name);
          setActiveRoomType('group');
          setMobileMenuOpen(false);
        }}
        startDirectMessage={(f) => {
          const roomId = [currentUser.id, f.id].sort().join('_');
          setActiveRoom(roomId);
          setActiveRoomName(`@${f.username}`);
          setActiveRoomType('dm');
          setMobileMenuOpen(false);
        }}
        unreadCounts={unreadCounts}
        onlineUsers={onlineUsers}
        setShowChannelModal={setShowChannelModal}
        setShowGroupModal={setShowGroupModal}
        setShowAddModal={setShowAddModal}
        handleLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col bg-slate-950 relative w-full overflow-hidden">
        <ChatHeader 
          activeRoomName={activeRoomName} 
          activeRoomType={activeRoomType}
          activeGroupData={activeGroupData}
          currentUser={currentUser}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenGroupSettings={() => setShowGroupSettingsModal(true)}
        />
        
        <MessageList
          messages={messages}
          loadingHistory={loadingHistory}
          activeRoomName={activeRoomName}
          currentUser={currentUser}
          typingUsers={typingUsers}
          editingMessageId={editingMessageId}
          editingContent={editingContent}
          setEditingMessageId={setEditingMessageId}
          setEditingContent={setEditingContent}
          handleSaveEdit={handleSaveEdit}
          handleDeleteMessage={handleDeleteMessage}
          handleToggleReaction={handleToggleReaction}
        />

        <MessageInput
          messageInput={messageInput}
          handleInputChange={handleInputChange}
          handleSendMessage={handleSendMessage}
          activeRoomName={activeRoomName}
        />
      </main>

      {showChannelModal && (
        <CreateChannelModal
          currentUser={currentUser}
          onClose={() => setShowChannelModal(false)}
          onChannelCreated={(ch) => {
            setChannels((p) => [...p, ch]);
            setActiveRoom(ch.name);
            setActiveRoomName(ch.name);
            setActiveRoomType('channel');
          }}
        />
      )}

      {showGroupModal && (
        <CreateGroupModal
          currentUser={currentUser}
          friends={friends}
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={async () => {
            const res = await api.get(`/api/groups/${currentUser.id}`);
            setGroups(res.data || []);
          }}
        />
      )}

      {showGroupSettingsModal && activeGroupData && (
        <GroupSettingsModal
          currentUser={currentUser}
          group={activeGroupData}
          friends={friends}
          onClose={() => setShowGroupSettingsModal(false)}
          onGroupUpdated={async () => {
            const res = await api.get(`/api/groups/${currentUser.id}`);
            setGroups(res.data || []);
          }}
        />
      )}

      {showAddModal && (
        <AddFriendModal
          currentUser={currentUser}
          onClose={() => setShowAddModal(false)}
          onFriendAdded={() => api.get(`/api/friends/${currentUser.id}`).then((res) => setFriends(res.data || []))}
        />
      )}
    </div>
  );
}