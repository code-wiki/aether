import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Pin, Clock } from 'lucide-react';
import { Badge } from '../../design-system/primitives';
import { hoverLift } from '../../design-system/motion';

/**
 * ConversationCard - Preview card for sidebar
 * Features:
 * - Conversation title
 * - Last message preview (truncated)
 * - Relative timestamp
 * - Model badge
 * - Message count
 * - Pin indicator
 * - Hover actions (pin, delete)
 * - Selected state
 * - React.memo for performance
 */
const ConversationCard = memo(({
  conversation,
  isActive,
  onClick,
  onDelete,
  onPin,
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      onDelete(conversation.id);
    }
  };

  const handlePin = (e) => {
    e.stopPropagation();
    onPin?.(conversation.id);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getLastMessagePreview = () => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet';
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const preview = lastMessage.content.substring(0, 60);
    return preview.length < lastMessage.content.length ? `${preview}...` : preview;
  };

  const messageCount = conversation.messages?.length || 0;

  return (
    <motion.div
      {...hoverLift}
      onClick={onClick}
      className={`
        relative p-3 rounded-xl cursor-pointer transition-all group
        ${isActive
          ? 'bg-accent-500 text-white shadow-glow-accent-md'
          : 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-0 hover:shadow-sm'
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Conversation: ${conversation.title}`}
    >
      {/* Pin indicator */}
      {conversation.pinned && (
        <div className="absolute top-2 right-2">
          <Pin className={`w-3 h-3 ${isActive ? 'text-white' : 'text-accent-500'}`} fill="currentColor" />
        </div>
      )}

      {/* Title - Reserve space for action buttons */}
      <div className="flex items-start gap-2 mb-2 pr-20">
        <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-neutral-900 dark:text-neutral-0'}`}>
            {conversation.title}
          </h3>
        </div>
      </div>

      {/* Last message preview */}
      <p className={`text-xs line-clamp-2 mb-2 ml-6 ${isActive ? 'text-white/80' : 'text-neutral-600 dark:text-neutral-400'}`}>
        {getLastMessagePreview()}
      </p>

      {/* Metadata */}
      <div className="flex items-center justify-between ml-6">
        <div className="flex items-center gap-2">
          {/* Timestamp */}
          <div className={`flex items-center gap-1 text-xs ${isActive ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}`}>
            <Clock className="w-3 h-3" />
            {formatTimestamp(conversation.updatedAt)}
          </div>

          {/* Message count */}
          {messageCount > 0 && (
            <span className={`text-xs ${isActive ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'}`}>
              • {messageCount} {messageCount === 1 ? 'msg' : 'msgs'}
            </span>
          )}
        </div>

        {/* Model badge */}
        {conversation.model && (
          <Badge
            variant={isActive ? 'default' : 'primary'}
            size="sm"
            className={isActive ? 'bg-white/20 text-white border-white/30' : ''}
          >
            {conversation.model.split('-')[0]}
          </Badge>
        )}
      </div>

      {/* Hover actions */}
      <div
        className={`
          absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
          ${isActive ? 'opacity-100' : ''}
        `}
      >
        {onPin && (
          <button
            onClick={handlePin}
            className={`p-2.5 sm:p-3 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg hover:bg-white/20 hover:scale-110 transition-all flex items-center justify-center ${isActive ? 'text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
            aria-label={conversation.pinned ? 'Unpin conversation' : 'Pin conversation'}
          >
            <Pin className="w-3.5 h-3.5" fill={conversation.pinned ? 'currentColor' : 'none'} />
          </button>
        )}

        <button
          onClick={handleDelete}
          className={`p-2.5 sm:p-3 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg hover:bg-red-500/20 hover:scale-110 transition-all flex items-center justify-center ${isActive ? 'text-white hover:bg-red-500/30' : 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'}`}
          aria-label="Delete conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
});

ConversationCard.displayName = 'ConversationCard';

export default ConversationCard;
