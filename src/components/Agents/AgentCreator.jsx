import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Bot, FileText, Eye, Info, Edit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../context/SettingsContext';
import aiService from '../../services/ai/AIService';
import MarkdownEditorModal from './MarkdownEditorModal';

/**
 * AgentCreator - Create and configure AI agents
 * Features: Name, skills, LLM selection, knowledge base, strategies
 */
function AgentCreator({ onClose, onSave, initialAgent }) {
  const { settings } = useSettings();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Skills & Strategy, 3: Configuration
  const [agent, setAgent] = useState(initialAgent || {
    name: '',
    description: '',
    icon: '🤖',
    model: 'claude-sonnet-4-5@20250929',
    skills: [],
    strategies: [],
    knowledgeBase: null,
    systemPrompt: '',
    temperature: 0.7,
    skillsMarkdown: '',
    strategyMarkdown: '',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [markdownModal, setMarkdownModal] = useState(null); // 'skills' | 'strategy' | null
  const [skillInfoModal, setSkillInfoModal] = useState(null); // Selected skill for info modal
  const [editingStrategy, setEditingStrategy] = useState(null); // { index, value } for editing strategy

  // Available Claude models
  const models = [
    { id: 'claude-sonnet-4-5@20250929', name: 'Claude Sonnet 4.5', description: 'Most capable, balanced' },
    { id: 'claude-sonnet-4-0@20250514', name: 'Claude Sonnet 4', description: 'Previous generation' },
    { id: 'claude-opus-4-0@20250514', name: 'Claude Opus 4', description: 'Most powerful' },
    { id: 'claude-haiku-4-0@20250514', name: 'Claude Haiku 4', description: 'Fast and efficient' },
  ];

  // Available skills
  const availableSkills = [
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the internet',
      color: 'blue',
      details: 'Enables the agent to search the web using Google, Bing, or DuckDuckGo. The agent can find current information, news articles, research papers, and any publicly available content online. Best for tasks requiring up-to-date information or broad research.'
    },
    {
      id: 'data-analysis',
      name: 'Data Analysis',
      description: 'Analyze data and create insights',
      color: 'purple',
      details: 'Provides capabilities to analyze structured data like CSV files, JSON, or datasets. The agent can perform statistical analysis, identify trends, find patterns, and generate actionable insights from your data.'
    },
    {
      id: 'image-generation',
      name: 'Image Generation',
      description: 'Create images with DALL-E',
      color: 'pink',
      details: 'Uses DALL-E 3 to generate high-quality images from text descriptions. Perfect for creating illustrations, concept art, diagrams, or any visual content. Supports various styles and aspect ratios.'
    },
    {
      id: 'chart-generation',
      name: 'Chart Generation',
      description: 'Create charts and graphs',
      color: 'cyan',
      details: 'Creates data visualizations including bar charts, line graphs, pie charts, scatter plots, and more. Helps visualize data trends and patterns in an easy-to-understand format.'
    },
    {
      id: 'code-execution',
      name: 'Code Execution',
      description: 'Execute Python code',
      color: 'green',
      details: 'Allows the agent to write and execute Python code in a secure sandbox environment. Useful for complex calculations, data processing, API calls, or any task that requires programming.'
    },
    {
      id: 'file-operations',
      name: 'File Operations',
      description: 'Read and write files',
      color: 'amber',
      details: 'Enables reading from and writing to various file formats (PDF, TXT, CSV, JSON, etc.). The agent can process documents, extract information, and create new files based on your requirements.'
    },
  ];

  // Emoji picker
  const emojis = ['🤖', '🧠', '✨', '🚀', '💡', '🔍', '📊', '🎨', '⚡', '🌟', '🎯', '🔬'];

  const handleGenerateSkills = async () => {
    if (!aiPrompt && !agent.description) {
      return;
    }

    setIsGenerating(true);

    try {
      // Initialize Claude
      await aiService.initializeProvider('claude', {
        projectId: settings.gcp.projectId,
        location: settings.gcp.location,
      });

      const prompt = aiPrompt || agent.description;

      // Generate skills and strategies using AI
      const response = await aiService.sendMessage([
        {
          role: 'user',
          content: `I'm creating an AI agent. Based on this description, help me:

Description: "${prompt}"
Agent Name: "${agent.name || 'AI Agent'}"

Available Skills:
${availableSkills.map(s => `- ${s.id}: ${s.description}`).join('\n')}

Please provide a JSON response with:
1. "skills": array of skill IDs from the available skills that this agent should have
2. "strategies": array of 3-5 strategic approaches this agent should use (each as a brief string like "Chain of Thought: Break problems into steps")
3. "systemPrompt": a detailed system prompt (2-3 sentences) for this agent
4. "skillsMarkdown": a markdown document explaining each recommended skill and how to use it effectively
5. "strategyMarkdown": a markdown document explaining each strategy in detail with examples

Return ONLY valid JSON, no other text.`
        }
      ], { model: 'claude-sonnet-4-5@20250929' });

      // Parse AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiSuggestions = JSON.parse(jsonMatch[0]);

        setAgent(prev => ({
          ...prev,
          skills: aiSuggestions.skills || [],
          strategies: aiSuggestions.strategies || [],
          systemPrompt: aiSuggestions.systemPrompt || prev.systemPrompt,
          skillsMarkdown: aiSuggestions.skillsMarkdown || '',
          strategyMarkdown: aiSuggestions.strategyMarkdown || '',
        }));
      }
    } catch (error) {
      console.error('Failed to generate with AI:', error);
      // Fallback to simple generation
      const keywords = (aiPrompt || agent.description).toLowerCase();
      const suggestedSkills = availableSkills.filter(skill => {
        return keywords.includes(skill.name.toLowerCase()) ||
               keywords.includes(skill.description.toLowerCase());
      });

      setAgent(prev => ({
        ...prev,
        skills: suggestedSkills.map(s => s.id),
        strategies: [
          'Chain of Thought: Break complex problems into steps',
          'Reflection: Review and improve outputs',
          'Tool Use: Leverage available skills effectively'
        ],
        systemPrompt: `You are ${agent.name}, ${agent.description}. Use your skills strategically to help users effectively.`
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onSave(agent);
    onClose();
  };

  const handleSaveSkillsMarkdown = (markdown) => {
    setAgent(prev => ({ ...prev, skillsMarkdown: markdown }));
    setMarkdownModal(null);
  };

  const handleSaveStrategyMarkdown = (markdown) => {
    setAgent(prev => ({ ...prev, strategyMarkdown: markdown }));
    setMarkdownModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {initialAgent ? 'Edit AI Agent' : 'Create AI Agent'}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Step {step} of 3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all',
                  s <= step ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-neutral-200 dark:bg-neutral-800'
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Agent Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setAgent({ ...agent, icon: emoji })}
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all',
                        agent.icon === emoji
                          ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => setAgent({ ...agent, name: e.target.value })}
                  placeholder="e.g., Research Assistant, Content Creator"
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Description *
                </label>
                <textarea
                  value={agent.description}
                  onChange={(e) => setAgent({ ...agent, description: e.target.value })}
                  placeholder="Describe what this agent does and how it helps users..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  AI Model *
                </label>
                <div className="space-y-2">
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setAgent({ ...agent, model: model.id })}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 transition-all text-left',
                        agent.model === model.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {model.name}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {model.description}
                          </div>
                        </div>
                        {agent.model === model.id && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills & Strategy */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl">
              {/* AI-Powered Generation */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                      AI-Powered Skills & Strategy Generation
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      Describe what you want this agent to do, and AI will generate skills, strategies, and markdown documentation
                    </p>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Example: Create a research agent that can search the web, analyze data, summarize findings, and generate reports with charts..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-purple-300 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm mb-3"
                    />
                    <button
                      onClick={handleGenerateSkills}
                      disabled={(!agent.description && !aiPrompt) || isGenerating}
                      className={cn(
                        'px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all',
                        ((!agent.description && !aiPrompt) || isGenerating) && 'opacity-50 cursor-not-allowed',
                        !isGenerating && 'hover:shadow-lg hover:scale-105'
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual Skills Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Skills (Select all that apply)
                  </label>
                  {agent.skillsMarkdown && (
                    <button
                      onClick={() => setMarkdownModal('skills')}
                      className="px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Skills Guide
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {availableSkills.map(skill => {
                    const isSelected = agent.skills.includes(skill.id);
                    return (
                      <div key={skill.id} className="relative group">
                        <button
                          onClick={() => {
                            setAgent(prev => ({
                              ...prev,
                              skills: isSelected
                                ? prev.skills.filter(s => s !== skill.id)
                                : [...prev.skills, skill.id]
                            }));
                          }}
                          className={cn(
                            'w-full p-3 pr-10 rounded-lg border-2 transition-all text-left',
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                          )}
                        >
                          <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                            {skill.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {skill.description}
                          </div>
                        </button>
                        {/* Info Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSkillInfoModal(skill);
                          }}
                          className="absolute top-2 right-2 p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="View details"
                        >
                          <Info className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strategies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Agent Strategies
                  </label>
                  {agent.strategyMarkdown && (
                    <button
                      onClick={() => setMarkdownModal('strategy')}
                      className="px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Strategy Guide
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {agent.strategies.map((strategy, idx) => (
                    <div key={idx} className="group flex items-start gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2">
                          {strategy || 'Empty strategy'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingStrategy({ index: idx, value: strategy })}
                          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit strategy"
                        >
                          <Edit className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        </button>
                        <button
                          onClick={() => {
                            setAgent({
                              ...agent,
                              strategies: agent.strategies.filter((_, i) => i !== idx)
                            });
                          }}
                          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete strategy"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setAgent({ ...agent, strategies: [...agent.strategies, ''] })}
                    className="w-full px-3 py-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Strategy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={agent.systemPrompt}
                  onChange={(e) => setAgent({ ...agent, systemPrompt: e.target.value })}
                  placeholder="Instructions for how the agent should behave..."
                  rows={6}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Temperature: {agent.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={agent.temperature}
                  onChange={(e) => setAgent({ ...agent, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Knowledge Base (Optional)
                </label>
                <select
                  value={agent.knowledgeBase || ''}
                  onChange={(e) => setAgent({ ...agent, knowledgeBase: e.target.value || null })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">None</option>
                  <option value="kb-1">Product Documentation</option>
                  <option value="kb-2">Customer Support</option>
                </select>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Give your agent access to specific knowledge bases for RAG
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              step === 1
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!agent.name || !agent.description}
                className={cn(
                  'px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium transition-all',
                  (!agent.name || !agent.description)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg hover:scale-105'
                )}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                Create Agent
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Markdown Editor Modals */}
      {markdownModal === 'skills' && (
        <MarkdownEditorModal
          title="Skills Guide (skills.md)"
          content={agent.skillsMarkdown || ''}
          onClose={() => setMarkdownModal(null)}
          onSave={handleSaveSkillsMarkdown}
        />
      )}

      {markdownModal === 'strategy' && (
        <MarkdownEditorModal
          title="Strategy Guide (strategy.md)"
          content={agent.strategyMarkdown || ''}
          onClose={() => setMarkdownModal(null)}
          onSave={handleSaveStrategyMarkdown}
        />
      )}

      {/* Skill Info Modal */}
      {skillInfoModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {skillInfoModal.name}
              </h3>
              <button
                onClick={() => setSkillInfoModal(null)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Description
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {skillInfoModal.description}
                </p>
              </div>
              <div>
                <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Details
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {skillInfoModal.details}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <button
                onClick={() => setSkillInfoModal(null)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Edit Modal */}
      {editingStrategy && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Edit Strategy
              </h3>
              <button
                onClick={() => setEditingStrategy(null)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={editingStrategy.value}
                onChange={(e) => setEditingStrategy({ ...editingStrategy, value: e.target.value })}
                placeholder="Describe the strategy this agent should use..."
                rows={6}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                autoFocus
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Example: "Chain of Thought: Break complex problems into smaller, sequential steps"
              </p>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingStrategy(null)}
                className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStrategies = [...agent.strategies];
                  newStrategies[editingStrategy.index] = editingStrategy.value;
                  setAgent({ ...agent, strategies: newStrategies });
                  setEditingStrategy(null);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentCreator;
