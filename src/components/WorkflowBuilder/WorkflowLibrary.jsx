import React from 'react';
import { X, FileText, BarChart, Search, Sparkles } from 'lucide-react';
import { useAgent } from '../../context/AgentContext';

/**
 * WorkflowLibrary - Modal showing pre-built workflow templates
 */
function WorkflowLibrary({ onLoad, onClose }) {
  const { workflows } = useAgent();

  const templates = [
    {
      id: 'blog-post-creator',
      name: 'Blog Post Creator',
      description: 'Research topic → Create outline → Write content → Generate cover image',
      icon: FileText,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
    {
      id: 'data-analyzer',
      name: 'Data Analyzer',
      description: 'Analyze data → Extract insights → Generate charts',
      icon: BarChart,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      id: 'research-assistant',
      name: 'Research Assistant',
      description: 'Web search → Extract key points → Create summary',
      icon: Search,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      id: 'image-variation-generator',
      name: 'Image Variation Generator',
      description: 'Analyze image → Generate prompts → Create variations',
      icon: Sparkles,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
  ];

  const handleLoadTemplate = (templateId) => {
    const template = workflows.find((w) => w.id === templateId);
    if (template) {
      onLoad(template);
    } else {
      alert(`Template "${templateId}" not found. It may not be registered yet.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Workflow Templates
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Choose a pre-built workflow to get started
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleLoadTemplate(template.id)}
                  className="p-4 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 ${template.bg} dark:opacity-30 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${template.color} dark:opacity-100`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                No templates available yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkflowLibrary;
