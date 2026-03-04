import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { checkAuthStatus, testAuthConnection, getAuthInstructions } from '../../services/gcp/authStatus';
import Button from '../../design-system/primitives/Button';
import Card from '../../design-system/primitives/Card';
import Badge from '../../design-system/primitives/Badge';
import AetherLogo from '../UI/AetherLogo';
import { CheckCircle2, Terminal, Copy, Check, AlertCircle, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '../../design-system/motion';

/**
 * WelcomeScreen - Premium first-launch screen with GCP auth handling
 * States: checking, authenticated, needs-auth
 */
function WelcomeScreen({ onContinue }) {
  const { settings } = useSettings();
  const [authState, setAuthState] = useState('checking');
  const [authStatus, setAuthStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthState('checking');
    try {
      const status = await checkAuthStatus();
      setAuthStatus(status);

      if (status.valid) {
        setAuthState('authenticated');
      } else {
        setAuthState('needs-auth');
      }
    } catch (error) {
      console.error('[WelcomeScreen] Auth check error:', error);
      setAuthState('needs-auth');
    }
  };

  const handleSkip = () => {
    // Allow user to skip and enter app anyway
    localStorage.setItem('aether:welcomeCompleted', 'true');
    onContinue();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50
      dark:from-neutral-950 dark:via-purple-950/30 dark:to-purple-950/30
      flex items-center justify-center p-6 overflow-hidden">

      {/* Decorative Background Elements */}
      <DecorativeElements />

      <AnimatePresence mode="wait">
        {authState === 'checking' && <CheckingState key="checking" />}
        {authState === 'authenticated' && (
          <WelcomeState
            key="authenticated"
            onContinue={onContinue}
            projectId={settings.gcp?.projectId}
            location={settings.gcp?.location}
          />
        )}
        {authState === 'needs-auth' && (
          <AuthRequiredState
            key="needs-auth"
            onRetry={checkAuth}
            onSkip={handleSkip}
            authStatus={authStatus}
            testing={testing}
            setTesting={setTesting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Decorative background elements for visual appeal
function DecorativeElements() {
  return (
    <>
      {/* Animated gradient orbs - matching logo colors */}

      {/* Yellow to Orange orb - top left */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-yellow-400/25 to-orange-400/25
          dark:from-yellow-600/15 dark:to-orange-600/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pink to Purple orb - top right */}
      <motion.div
        className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-pink-400/25 to-purple-400/25
          dark:from-pink-600/15 dark:to-purple-600/15 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 1.3, 1.1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Blue to Purple orb - bottom right */}
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/25 to-purple-500/25
          dark:from-pink-600/15 dark:to-purple-600/15 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Red to Pink orb - bottom left */}
      <motion.div
        className="absolute bottom-32 left-32 w-72 h-72 bg-gradient-to-br from-red-400/20 to-pink-400/20
          dark:from-red-600/12 dark:to-pink-600/12 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />

      {/* Orange to Red orb - center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]
          bg-gradient-to-br from-orange-300/15 to-red-300/15
          dark:from-orange-600/10 dark:to-red-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Abstract shapes - colorful accents */}
      <motion.div
        className="absolute top-40 right-40 w-32 h-32 border-2 border-purple-300 dark:border-purple-700 rounded-2xl rotate-12"
        animate={{
          rotate: [12, 22, 12],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-60 left-1/3 w-20 h-20 border-2 border-pink-300 dark:border-pink-700 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute bottom-40 left-40 w-28 h-28 bg-gradient-to-br from-yellow-300/40 to-orange-300/40
          dark:from-yellow-600/25 dark:to-orange-600/25 rounded-3xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-300/50 to-cyan-300/50
          dark:from-pink-600/30 dark:to-cyan-600/30 rounded-lg rotate-45"
        animate={{
          rotate: [45, 90, 45],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Squiggly lines - colorful */}
      <svg className="absolute top-32 left-1/4 w-32 h-32 text-pink-300 dark:text-pink-700" viewBox="0 0 100 100">
        <motion.path
          d="M10,50 Q30,30 50,50 T90,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <svg className="absolute bottom-32 right-1/4 w-32 h-32 text-purple-300 dark:text-purple-700" viewBox="0 0 100 100">
        <motion.path
          d="M10,30 Q30,50 50,30 T90,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
      <svg className="absolute top-1/2 right-1/3 w-24 h-24 text-orange-300 dark:text-orange-700" viewBox="0 0 100 100">
        <motion.path
          d="M20,50 Q40,20 60,50 T100,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      {/* Small colorful circles */}
      {[
        { color: 'bg-yellow-400/30 dark:bg-yellow-600/20', top: '15%', left: '12%' },
        { color: 'bg-orange-400/30 dark:bg-orange-600/20', top: '25%', left: '85%' },
        { color: 'bg-red-400/30 dark:bg-red-600/20', top: '45%', left: '8%' },
        { color: 'bg-pink-400/30 dark:bg-pink-600/20', top: '65%', left: '90%' },
        { color: 'bg-purple-400/30 dark:bg-purple-600/20', top: '80%', left: '15%' },
        { color: 'bg-purple-400/30 dark:bg-purple-600/20', top: '35%', left: '75%' },
        { color: 'bg-orange-400/30 dark:bg-orange-600/20', top: '55%', left: '45%' },
        { color: 'bg-fuchsia-400/30 dark:bg-fuchsia-600/20', top: '20%', left: '55%' },
      ].map((circle, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 ${circle.color} rounded-full`}
          style={{
            top: circle.top,
            left: circle.left,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </>
  );
}

// Checking State - Premium loading animation
function CheckingState() {
  return (
    <motion.div
      {...fadeInUp}
      className="relative z-10 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AetherLogo size={100} className="mb-8 mx-auto" />
      </motion.div>

      {/* Spinning ring loader */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-pink-100 dark:border-pink-900/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-r-purple-500 dark:border-r-purple-400 rounded-full animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>

      <motion.p
        className="text-lg font-medium text-neutral-700 dark:text-neutral-300"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Checking authentication...
      </motion.p>
      <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
        Please wait while we verify your credentials
      </p>
    </motion.div>
  );
}

// Welcome State - Centered Card Design
function WelcomeState({ onContinue, projectId, location }) {
  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Powered by Vertex AI', color: 'text-orange-500 dark:text-orange-400' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your data, your control', color: 'text-pink-500 dark:text-pink-400' },
    { icon: Sparkles, title: 'Multi-Model', desc: 'Claude, Gemini & GPT', color: 'text-pink-500 dark:text-pink-400' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative z-10 w-full max-w-2xl mx-auto px-4"
    >
      {/* Centered Card */}
      <motion.div
        variants={staggerItem}
        className="p-10 md:p-14 rounded-3xl bg-white/60 dark:bg-neutral-900/60
          backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-sm"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <AetherLogo size={80} className="mx-auto drop-shadow-2xl" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-4 text-center tracking-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Aether
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-lg mx-auto leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your AI workspace is ready
        </motion.p>

        {/* Status Section - Compact */}
        <motion.div
          variants={staggerItem}
          className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/80 dark:from-pink-950/30 dark:to-purple-950/30
            border border-pink-200/50 dark:border-purple-700/30 max-w-md mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="p-2.5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl shadow-sm"
              animate={{
                boxShadow: [
                  '0 2px 10px rgba(236, 72, 153, 0.2)',
                  '0 2px 15px rgba(168, 85, 247, 0.3)',
                  '0 2px 10px rgba(236, 72, 153, 0.2)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              All Systems Ready
            </h3>
          </div>

          <div className="space-y-2 text-sm text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
              <span className="text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{projectId || 'ltc-dev-mgmt-wsky'}</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              <span className="text-neutral-600 dark:text-neutral-400">
                {location || 'us-east5'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-pink-500" />
              <span className="text-neutral-600 dark:text-neutral-400">
                3 AI Models Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Features - Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 max-w-2xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const gradients = [
              'from-orange-50/80 to-yellow-50/80 dark:from-orange-950/30 dark:to-yellow-950/30',
              'from-pink-50/80 to-rose-50/80 dark:from-pink-950/30 dark:to-rose-950/30',
              'from-purple-50/80 to-fuchsia-50/80 dark:from-purple-950/30 dark:to-fuchsia-950/30'
            ];
            const borders = [
              'border-orange-200/50 dark:border-orange-700/30',
              'border-pink-200/50 dark:border-pink-700/30',
              'border-purple-200/50 dark:border-purple-700/30'
            ];
            return (
              <motion.div
                key={feature.title}
                className={`p-4 rounded-2xl bg-gradient-to-br ${gradients[index]}
                  border ${borders[index]} hover:scale-105 transition-transform cursor-default`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          className="text-center max-w-sm mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                localStorage.setItem('aether:welcomeCompleted', 'true');
                onContinue();
              }}
              className="px-10 py-3.5 text-base font-semibold rounded-2xl shadow-md w-full
                bg-gradient-to-r from-pink-500 via-pink-500 to-purple-600 hover:from-pink-600 hover:via-pink-600 hover:to-purple-700
                border-none transition-all duration-200"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Continue to Aether
            </Button>
          </motion.div>

          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
            Start creating with AI in seconds
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Auth Required State - Setup needed
function AuthRequiredState({ onRetry, onSkip, authStatus, testing, setTesting }) {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const instructions = getAuthInstructions();

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openTerminal = () => {
    if (window.electron.isMac) {
      window.electron.shell.exec(`osascript -e 'tell application "Terminal" to do script "gcloud auth application-default login"'`);
    } else if (window.electron.isWindows) {
      window.electron.shell.exec('start cmd.exe /K "gcloud auth application-default login"');
    } else {
      window.electron.shell.exec('x-terminal-emulator -e "gcloud auth application-default login" || gnome-terminal -- bash -c "gcloud auth application-default login; exec bash"');
    }
  };

  const handleTestAuth = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await testAuthConnection();
      setTestResult(result);

      if (result.success) {
        setTimeout(() => {
          onRetry();
        }, 1500);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Failed to test authentication'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative z-10 w-full max-w-2xl mx-auto px-4"
    >

      {/* Centered Setup Card */}
      <motion.div variants={staggerItem}>
        <div className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-neutral-900/60
          backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-sm p-8 md:p-12">

          {/* Logo & Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center mb-8"
          >
            <AetherLogo size={100} className="mx-auto mb-6 drop-shadow-2xl" />
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600
              dark:from-orange-400 dark:via-pink-400 dark:to-purple-500 bg-clip-text text-transparent leading-tight text-center mb-4"
          >
            Let's Get Started
          </motion.h1>

          <motion.p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 text-center mb-8">
            Authenticate with Google Cloud to unlock premium AI models powered by Vertex AI
          </motion.p>

          {/* Setup Steps */}
          <div className="space-y-6 mb-8">
            {instructions.steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="flex gap-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Number - Enhanced */}
                <div className="flex-shrink-0">
                  <motion.div
                    className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br text-white rounded-xl font-bold text-lg shadow-lg ${
                      index === 0 ? 'from-orange-500 to-orange-600 shadow-orange-500/30' :
                      index === 1 ? 'from-pink-500 to-pink-600 shadow-pink-500/30' :
                      index === 2 ? 'from-purple-500 to-purple-600 shadow-purple-500/30' :
                      'from-pink-500 to-purple-600 shadow-blue-500/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.number}
                  </motion.div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <p className="text-base font-medium text-neutral-800 dark:text-neutral-200 mb-3">
                    {step.description}
                  </p>

                  {step.command && (
                    <div className="flex items-stretch gap-2">
                      <code className="flex-1 px-4 py-3.5 bg-neutral-100/80 dark:bg-neutral-800/80
                        backdrop-blur-sm rounded-xl font-mono text-sm text-neutral-900 dark:text-neutral-100
                        border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
                        {step.command}
                      </code>

                      <motion.button
                        onClick={() => handleCopy(step.command)}
                        className="px-4 py-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800
                          hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all flex-shrink-0
                          border border-neutral-200 dark:border-neutral-700 hover:border-pink-300 dark:hover:border-pink-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={copied ? 'Copied!' : 'Copy command'}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Action */}
          <motion.div
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-50/80 to-pink-50/80 dark:from-orange-950/30 dark:to-pink-950/30
              border border-orange-200/50 dark:border-orange-700/30 mb-8"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className="p-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-sm flex-shrink-0"
                animate={{
                  boxShadow: [
                    '0 2px 10px rgba(249, 115, 22, 0.2)',
                    '0 2px 15px rgba(236, 72, 153, 0.3)',
                    '0 2px 10px rgba(249, 115, 22, 0.2)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Terminal className="w-6 h-6 text-white" />
              </motion.div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  ⚡ Quick Setup
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Launch your terminal with the authentication command pre-loaded.
                </p>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="primary"
                    size="md"
                    onClick={openTerminal}
                    className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700
                      shadow-sm border-none rounded-xl px-6 w-full"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Open Terminal & Authenticate
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Test Result - Inside Card */}
          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mb-8"
              >
                <div className={`rounded-2xl p-6 border backdrop-blur-xl
                  ${testResult.success
                    ? 'bg-green-50/70 dark:bg-green-950/50 border-green-300/60 dark:border-green-700'
                    : 'bg-red-50/70 dark:bg-red-950/50 border-red-300/60 dark:border-red-700'
                  }`}
                >
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {testResult.success ? (
                    <div className="p-2 bg-green-500 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-500 rounded-full">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                </motion.div>
                <div>
                  <h4 className={`font-bold text-lg mb-1
                    ${testResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {testResult.success ? '✓ Authentication Successful!' : '✗ Authentication Failed'}
                  </h4>
                  <p className={`text-sm
                    ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {testResult.message}
                  </p>
                  </div>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleTestAuth}
            disabled={testing}
            className="w-full px-6 py-4 text-base font-semibold rounded-2xl shadow-md
              bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700
              border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Testing Connection...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                I've Authenticated
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            className="w-full px-6 py-4 text-base font-semibold rounded-2xl
              bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/40 dark:border-neutral-700/40
              hover:border-pink-300 dark:hover:border-purple-600 shadow-sm"
          >
            Skip for Now
          </Button>
        </motion.div>
          </div>

          {/* Alternative Option */}
          <div className="text-center mt-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Don't have Google Cloud?{' '}
              <button
                onClick={onSkip}
                className="font-medium text-pink-600 dark:text-pink-400 hover:text-purple-600
                  dark:hover:text-purple-400 underline underline-offset-2 transition-colors"
              >
                Use OpenAI or Anthropic API keys instead →
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default WelcomeScreen;
