import React, { useState, useEffect } from 'react';
import { useConversation } from '../../context/ConversationContext';

function UsageTracker() {
  const { conversations } = useConversation();
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    byProvider: {},
    byModel: {},
    estimatedTokens: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [conversations]);

  const calculateStats = () => {
    let totalMessages = 0;
    let estimatedTokens = 0;
    const byProvider = {};
    const byModel = {};

    conversations.forEach(conv => {
      const messageCount = conv.messages?.length || 0;
      totalMessages += messageCount;

      // Count by provider
      byProvider[conv.provider] = (byProvider[conv.provider] || 0) + 1;

      // Count by model
      const modelKey = `${conv.provider}:${conv.model}`;
      byModel[modelKey] = (byModel[modelKey] || 0) + messageCount;

      // Estimate tokens (rough: 4 chars = 1 token)
      conv.messages?.forEach(msg => {
        estimatedTokens += Math.ceil(msg.content.length / 4);
      });
    });

    setStats({
      totalConversations: conversations.length,
      totalMessages,
      byProvider,
      byModel,
      estimatedTokens,
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'gemini': return '✨';
      case 'claude': return '🧠';
      case 'openai': return '🤖';
      default: return '💬';
    }
  };

  const estimateCost = (provider, tokens) => {
    // Rough cost estimates (per 1M tokens)
    const costs = {
      'gemini': 0, // Free tier
      'claude': 3.0, // ~$3 per 1M tokens average
      'openai': 0.5, // ~$0.50 per 1M tokens for gpt-4o-mini
    };

    const costPerToken = (costs[provider] || 0) / 1000000;
    return (tokens * costPerToken).toFixed(2);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Usage Statistics</h3>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-2xl font-bold text-accent">{stats.totalConversations}</div>
          <div className="text-sm text-text-secondary mt-1">Total Conversations</div>
        </div>

        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-2xl font-bold text-accent">{stats.totalMessages}</div>
          <div className="text-sm text-text-secondary mt-1">Total Messages</div>
        </div>

        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-2xl font-bold text-accent">{formatNumber(stats.estimatedTokens)}</div>
          <div className="text-sm text-text-secondary mt-1">Estimated Tokens</div>
        </div>

        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-2xl font-bold text-accent">
            {stats.totalConversations > 0
              ? (stats.totalMessages / stats.totalConversations).toFixed(1)
              : '0'}
          </div>
          <div className="text-sm text-text-secondary mt-1">Avg Messages/Chat</div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-text-secondary mb-2">By Provider</h4>
        <div className="space-y-2">
          {Object.entries(stats.byProvider).map(([provider, count]) => {
            const percentage = ((count / stats.totalConversations) * 100).toFixed(0);
            const providerTokens = Object.entries(stats.byModel)
              .filter(([key]) => key.startsWith(provider))
              .reduce((sum, [_, msgs]) => sum + (msgs * 100), 0); // Rough estimate

            return (
              <div key={provider} className="p-3 bg-surface rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getProviderIcon(provider)}</span>
                    <span className="font-medium text-text-primary capitalize">{provider}</span>
                  </div>
                  <div className="text-sm text-text-secondary">{count} chats ({percentage}%)</div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-elevated rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Cost estimate */}
                {provider !== 'gemini' && (
                  <div className="mt-2 text-xs text-text-secondary">
                    Est. cost: ${estimateCost(provider, providerTokens)}
                  </div>
                )}
                {provider === 'gemini' && (
                  <div className="mt-2 text-xs text-success">
                    ✓ Free with GCP credits
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 bg-accent bg-opacity-10 border border-accent rounded-lg">
        <div className="text-sm font-medium text-accent mb-1">💡 Pro Tips</div>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Use Gemini for free conversations with GCP credits</li>
          <li>• Export important chats to save costs</li>
          <li>• Delete old conversations to keep data lean</li>
          <li>• Token estimates are approximate (1 token ≈ 4 characters)</li>
        </ul>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-text-secondary">
        <p>Note: Cost estimates are approximate and based on average pricing. Actual costs may vary.</p>
        <p className="mt-1">Tokens are estimated at 1 token per 4 characters (rough approximation).</p>
      </div>
    </div>
  );
}

export default UsageTracker;
