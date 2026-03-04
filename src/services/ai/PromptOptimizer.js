/**
 * PromptOptimizer - Enhance user prompts with prompt engineering techniques
 *
 * Features:
 * - Auto-enhancement (add context, structure, clarity)
 * - Smart templates for common tasks
 * - Tone adjustment
 * - Length optimization
 */

class PromptOptimizer {
  constructor() {
    this.templates = {
      code: {
        name: 'Code Generation',
        prefix: 'Generate clean, well-documented code for the following:\n\n',
        suffix: '\n\nRequirements:\n- Include helpful comments\n- Follow best practices\n- Handle edge cases\n- Provide example usage',
      },
      explain: {
        name: 'Explanation',
        prefix: 'Explain the following in clear, simple terms:\n\n',
        suffix: '\n\nPlease provide:\n- A concise summary\n- Key concepts broken down\n- Relevant examples',
      },
      debug: {
        name: 'Debug',
        prefix: 'Help me debug this issue:\n\n',
        suffix: '\n\nPlease:\n- Identify the root cause\n- Suggest fixes\n- Explain why it happens',
      },
      improve: {
        name: 'Improve Code',
        prefix: 'Review and improve this code:\n\n',
        suffix: '\n\nSuggestions should include:\n- Performance optimizations\n- Code quality improvements\n- Best practice recommendations',
      },
      summarize: {
        name: 'Summarize',
        prefix: 'Provide a concise summary of:\n\n',
        suffix: '\n\nInclude:\n- Main points\n- Key takeaways\n- Action items (if applicable)',
      },
    };

    this.enhancementRules = [
      {
        name: 'Add Context',
        pattern: /^(what|how|why|when|where)/i,
        enhance: (prompt) => {
          if (prompt.length < 50 && !prompt.includes('?')) {
            return prompt + '? Please provide a detailed explanation.';
          }
          return prompt;
        },
      },
      {
        name: 'Clarify Vague Requests',
        pattern: /^(it|this|that|the thing)/i,
        enhance: (prompt) => {
          return 'Regarding the topic: ' + prompt + '\n\nPlease be specific in your response.';
        },
      },
      {
        name: 'Add Structure for Lists',
        pattern: /\b(list|steps|ways|methods|tips)\b/i,
        enhance: (prompt) => {
          if (!prompt.includes('format')) {
            return prompt + '\n\nPlease format the response as a numbered list.';
          }
          return prompt;
        },
      },
    ];
  }

  /**
   * Detect the type of prompt (code, explain, debug, etc.)
   */
  detectPromptType(prompt) {
    const lower = prompt.toLowerCase();

    if (lower.match(/\b(write|create|generate|build|make)\b.*\b(code|function|class|component|script|program)/i)) {
      return 'code';
    }
    if (lower.match(/\b(explain|what is|tell me about|describe|define)/i)) {
      return 'explain';
    }
    if (lower.match(/\b(debug|fix|error|bug|not working|broken|issue|problem)/i)) {
      return 'debug';
    }
    if (lower.match(/\b(improve|optimize|refactor|enhance|better)/i)) {
      return 'improve';
    }
    if (lower.match(/\b(summarize|summary|tldr|brief|overview)/i)) {
      return 'summarize';
    }

    return null;
  }

  /**
   * Apply smart template based on detected type
   */
  applyTemplate(prompt, templateType) {
    const template = this.templates[templateType];
    if (!template) return prompt;

    return template.prefix + prompt + template.suffix;
  }

  /**
   * Apply enhancement rules
   */
  applyEnhancements(prompt) {
    let enhanced = prompt;

    for (const rule of this.enhancementRules) {
      if (rule.pattern.test(prompt)) {
        enhanced = rule.enhance(enhanced);
      }
    }

    return enhanced;
  }

  /**
   * Add clarity and structure
   */
  addClarity(prompt) {
    // Add "Please" if it's a command
    if (prompt.match(/^(show|give|tell|provide|write|create)/i) && !prompt.match(/please/i)) {
      prompt = 'Please ' + prompt.charAt(0).toLowerCase() + prompt.slice(1);
    }

    // Ensure proper punctuation
    if (!prompt.match(/[.!?]$/)) {
      if (prompt.match(/[?]/)) {
        // Already has question mark somewhere
      } else if (prompt.match(/^(what|how|why|when|where|who|which)/i)) {
        prompt += '?';
      } else {
        prompt += '.';
      }
    }

    return prompt;
  }

  /**
   * Optimize prompt based on settings
   */
  optimize(prompt, options = {}) {
    const {
      autoEnhance = true,
      useTemplates = true,
      addClarity = true,
      customInstructions = '',
    } = options;

    let optimized = prompt;

    // 1. Add clarity and structure
    if (addClarity) {
      optimized = this.addClarity(optimized);
    }

    // 2. Apply enhancement rules
    if (autoEnhance) {
      optimized = this.applyEnhancements(optimized);
    }

    // 3. Apply smart templates
    if (useTemplates) {
      const type = this.detectPromptType(optimized);
      if (type) {
        optimized = this.applyTemplate(optimized, type);
      }
    }

    // 4. Add custom instructions if provided
    if (customInstructions) {
      optimized = optimized + '\n\nAdditional context: ' + customInstructions;
    }

    return optimized;
  }

  /**
   * Get suggestions for improving a prompt
   */
  getSuggestions(prompt) {
    const suggestions = [];
    const type = this.detectPromptType(prompt);

    if (type) {
      suggestions.push({
        type: 'template',
        label: `Use ${this.templates[type].name} template`,
        description: 'Apply a specialized template for better results',
        preview: this.applyTemplate(prompt, type),
      });
    }

    if (prompt.length < 20) {
      suggestions.push({
        type: 'length',
        label: 'Add more details',
        description: 'Short prompts may lack context. Consider adding more specifics.',
      });
    }

    if (!prompt.match(/[.!?]$/)) {
      suggestions.push({
        type: 'punctuation',
        label: 'Add punctuation',
        description: 'Proper punctuation improves clarity',
      });
    }

    if (prompt.match(/^(it|this|that|the thing)/i)) {
      suggestions.push({
        type: 'clarity',
        label: 'Be more specific',
        description: 'Vague references may confuse the AI. Clarify what you\'re referring to.',
      });
    }

    return suggestions;
  }
}

export default new PromptOptimizer();
