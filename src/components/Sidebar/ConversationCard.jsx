import React, { memo } from 'react';
import { HiChatBubbleLeftRight, HiStar, HiTrash } from 'react-icons/hi2';
import { cn } from '../../lib/utils';

/**
 * ConversationCard - Preview card for sidebar
 * Features:
 * - Conversation title
 * - Last message preview (truncated)
 * - Relative timestamp
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
    <div
      onClick={onClick}
      className={cn(
        "w-full p-2.5 rounded-md transition-colors text-left group relative cursor-pointer",
        isActive
          ? "bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <HiChatBubbleLeftRight className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate pr-12">
              {conversation.title}
            </h3>
            <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
              <button
                onClick={handlePin}
                className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                title={conversation.pinned ? 'Unpin' : 'Pin'}
              >
                <HiStar className={cn(
                  'w-3 h-3 transition-all',
                  conversation.pinned
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                )} />
              </button>
              <button
                onClick={handleDelete}
                className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete conversation"
              >
                <HiTrash className="w-3 h-3 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-1">
            {getLastMessagePreview()}
          </p>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <span>{formatTimestamp(conversation.updatedAt)}</span>
            {messageCount > 0 && (
              <>
                <span>•</span>
                <span>{messageCount} {messageCount === 1 ? 'msg' : 'msgs'}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ConversationCard.displayName = 'ConversationCard';

export default ConversationCard;
