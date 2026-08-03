import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

export default function MessageInput({ 
  messageInput, 
  handleInputChange, 
  handleSendMessage, 
  activeRoomName 
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const formRef = useRef(null);

  const EMOJI_LIST = [
    '😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
    '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
    '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬',
    '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹',
    '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻',
    '😼', '😽', '🙀', '😿', '😾', '🙌', '👏', '👋', '🤙', '✌️', '🤘', '👊',
    '👍', '👎', '👌', '✋', '🤚', '🖐️', '🖖', '👐', '🤲', '🙏', '💪', '🤝',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
    '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '🔥', '⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️',
    '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '☂️',
    '☔', '⚡', '💧', '🌊', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎃', '🎄',
    '🎅', '🤶', '🦌', '🧝', '🧚', '🧞', '🧟', '🦄', '🐉', '🐲', '🐦',
    '🐧', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🐺', '🐗', '🐴', '🦄', '🐝',
    '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🐢', '🐍', '🦎', '🦖',
    '🦕', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈',
    '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🐃',
    '🐂', '🐄', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈',
    '🐈‍⬛', '🪶', '🐓', '🦃', '🐔', '🦉', '🦇', '🐺', '🐗', '🐴'
  ];

  useEffect(() => {
    const handleFocus = () => {
      if (window.innerWidth < 768) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      return () => input.removeEventListener('focus', handleFocus);
    }
  }, []);

  const handleEmojiClick = (emoji) => {
    handleInputChange({ target: { value: messageInput + emoji } });
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-3 md:p-4 bg-slate-900/30 border-t border-slate-800/50 backdrop-blur-sm relative safe-bottom">
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-4 bg-slate-900 border border-slate-700/50 rounded-2xl p-3 shadow-2xl shadow-black/50 z-30 max-w-[300px] max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-lg transition-all hover:scale-110 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form 
        ref={formRef}
        onSubmit={handleSendMessage} 
        className="relative flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            showEmojiPicker 
              ? 'bg-indigo-500/20 text-indigo-400' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeRoomName}...`}
            className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl py-2.5 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 transition-all"
            inputMode="text"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}