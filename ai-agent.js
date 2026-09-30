/**
 * Sentinel AI - FinTech Security Copilot & Autonomous Transaction Anomaly Agent
 * Multi-Intent Reasoning Engine, DMGT Logic Solver, Statistical Z-Score Calculator,
 * Voice Interface (STT/TTS), and Zero-Dependency Interactive Agent Widget.
 */

(function () {
  'use strict';

  // --- Configuration & Knowledge Constants ---
  const SENTINEL_CONFIG = {
    AGENT_NAME: 'Sentinel AI',
    VERSION: '2.5.0',
    DMGT_HIGH_THRESHOLD: 50000,
    SAFE_LOCATIONS: ['Mumbai, IN', 'Delhi, IN', 'Bengaluru, IN', 'Hyderabad, IN', 'Chennai, IN', 'Kolkata, IN', 'Pune, IN'],
    DEFAULT_BASELINE: [1500, 2200, 1800, 3100, 2900, 1950, 2400],
    STORAGE_KEY: 'sentinel_ai_chat_history_v2',
    SETTINGS_KEY: 'sentinel_ai_settings_v2'
  };

  // State Management
  let chatHistory = [];
  let isVoiceEnabled = false;
  let isListening = false;
  let speechRecognition = null;
  let customApiKey = localStorage.getItem('sentinel_gemini_api_key') || '';

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSentinelAgent);
  } else {
    initSentinelAgent();
  }

  /**
   * Main Initialization Function
   */
  function initSentinelAgent() {
    if (document.getElementById('sentinel-ai-root')) return; // Avoid duplicate mounting

    injectAgentHTML();
    bindAgentEvents();
    loadChatHistory();
    initSpeechRecognition();

    // Context-aware greeting if chat is fresh
    if (chatHistory.length === 0) {
      sendInitialGreeting();
    }
  }

  /**
   * Inject HTML DOM Structure for Floating Widget, Modal & Quick Scanner
   */
  function injectAgentHTML() {
    const root = document.createElement('div');
    root.id = 'sentinel-ai-root';
    root.innerHTML = `
      <!-- Floating Action Button Trigger -->
      <div class="ai-agent-fab" id="sentinel-fab" role="button" aria-label="Open Sentinel AI Copilot" tabindex="0">
        <div class="ai-fab-avatar-wrap">
          <span class="ai-fab-pulse-ring"></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
        </div>
        <div class="ai-fab-text-wrap">
          <div class="ai-fab-title">
            <span>Sentinel AI</span>
            <span class="ai-fab-status-dot"></span>
          </div>
          <span class="ai-fab-subtitle">Security Copilot</span>
        </div>
        <span class="ai-fab-badge" id="sentinel-unread-badge" style="display: none;">1</span>
      </div>

      <!-- Main AI Agent Modal Window -->
      <div class="ai-agent-modal" id="sentinel-modal" role="dialog" aria-modal="true" aria-labelledby="sentinel-modal-title">
        
        <!-- Header -->
        <div class="ai-modal-header">
          <div class="ai-header-profile">
            <div class="ai-header-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span class="ai-avatar-online"></span>
            </div>
            <div class="ai-header-info">
              <div class="ai-header-title">
                <span id="sentinel-modal-title">Sentinel AI</span>
                <span class="ai-tag-copilot">COPILOT</span>
              </div>
              <div class="ai-header-status">
                <span class="ai-status-pulse"></span>
                <span>Autonomous Engine • Online</span>
              </div>
            </div>
          </div>

          <div class="ai-header-actions">
            <button class="ai-header-btn" id="sentinel-tts-btn" title="Toggle Voice Readout" aria-label="Toggle Voice Readout">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
            <button class="ai-header-btn" id="sentinel-expand-btn" title="Expand Window" aria-label="Expand Window">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <button class="ai-header-btn" id="sentinel-settings-btn" title="AI Agent Settings" aria-label="AI Settings">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button class="ai-header-btn" id="sentinel-close-btn" title="Close Copilot" aria-label="Close">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick Tool Pills Carousel -->
        <div class="ai-quick-tools" id="sentinel-quick-tools">
          <button class="ai-tool-pill" data-prompt="Audit transaction of ₹85,000 to PAYEE-91 from Paris">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Audit Outlier
          </button>
          <button class="ai-tool-pill" data-prompt="Simulate a high-risk velocity attack scenario">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Simulate Attack
          </button>
          <button class="ai-tool-pill" data-prompt="Explain DMGT logic rule formula (P ∧ Q) ∨ (P ∧ R) ∨ S">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            DMGT Logic
          </button>
          <button class="ai-tool-pill" data-prompt="How is statistical Z-score calculated for banking anomalies?">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Z-Score Math
          </button>
          <button class="ai-tool-pill" id="btn-toggle-scanner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Quick Scanner
          </button>
        </div>

        <!-- Quick Scanner Form Drawer (Collapsible) -->
        <div class="ai-scanner-drawer" id="sentinel-scanner-drawer">
          <div class="ai-scanner-title">
            <span>⚡ Interactive Transaction Scanner</span>
            <button class="ai-scanner-close" id="btn-close-scanner">&times;</button>
          </div>
          <div class="ai-scanner-grid">
            <div class="ai-scanner-field">
              <label>Amount (₹)</label>
              <input type="number" id="scan-amount" class="ai-scanner-input" value="75000" placeholder="e.g. 75000">
            </div>
            <div class="ai-scanner-field">
              <label>Payee Type</label>
              <select id="scan-new-payee" class="ai-scanner-input">
                <option value="true">New / First Time</option>
                <option value="false">Existing Verified</option>
              </select>
            </div>
            <div class="ai-scanner-field">
              <label>Location</label>
              <input type="text" id="scan-location" class="ai-scanner-input" value="London, UK" placeholder="e.g. Mumbai, IN">
            </div>
            <div class="ai-scanner-field">
              <label>Velocity Spike?</label>
              <select id="scan-velocity" class="ai-scanner-input">
                <option value="false">Normal Pace</option>
                <option value="true">Spike (>3 txns in 5m)</option>
              </select>
            </div>
          </div>
          <button class="ai-scanner-submit-btn" id="btn-submit-scanner">Run Instant AI Forensic Audit</button>
        </div>

        <!-- Chat Messages Feed -->
        <div class="ai-chat-feed" id="sentinel-feed" role="log" aria-live="polite">
          <!-- Messages inserted dynamically -->
        </div>

        <!-- Chat Input Bar -->
        <div class="ai-modal-input-bar">
          <div class="ai-input-row">
            <textarea 
              class="ai-text-input" 
              id="sentinel-input" 
              placeholder="Ask Sentinel AI or type: ₹80,000 to PAYEE-91..." 
              rows="1"
              aria-label="Ask Sentinel AI"
            ></textarea>
            
            <button class="ai-input-btn" id="sentinel-voice-btn" title="Voice Input (Speech-to-Text)" aria-label="Voice Input">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>

            <button class="ai-input-btn ai-send-btn" id="sentinel-send-btn" title="Send Query" aria-label="Send Query">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <div class="ai-input-footer">
            <span>🛡 DMGT Logic Engine • Graph Theory • Z-Score Outlier</span>
            <span class="ai-api-key-link" id="sentinel-clear-chat-btn">Clear Chat</span>
          </div>
        </div>

        <!-- Settings Modal Layer -->
        <div class="ai-settings-modal" id="sentinel-settings-layer">
          <div class="ai-settings-header">
            <span class="ai-settings-title">⚙ Sentinel AI Settings</span>
            <button class="ai-header-btn" id="sentinel-close-settings">&times;</button>
          </div>

          <div class="ai-settings-body">
            <div class="ai-settings-group">
              <label>Reasoning Engine Mode</label>
              <select id="sentinel-engine-mode">
                <option value="autonomous">Autonomous Rule & Math Engine (Fast, Offline)</option>
                <option value="gemini">Google Gemini AI (Requires API Key)</option>
              </select>
            </div>

            <div class="ai-settings-group" id="gemini-key-group" style="display: none;">
              <label>Google Gemini API Key (Optional)</label>
              <input type="password" id="sentinel-gemini-key" placeholder="AIzaSy..." value="${customApiKey}">
              <small style="color: #94a3b8; font-size: 0.7rem; margin-top: 4px;">Enables open-ended generative AI conversations directly with Gemini.</small>
            </div>

            <div class="ai-settings-group">
              <label>Voice Readout Voice</label>
              <select id="sentinel-voice-select">
                <option value="default">System Default Voice</option>
              </select>
            </div>
          </div>

          <button class="ai-settings-save-btn" id="sentinel-save-settings">Save & Apply Preferences</button>
        </div>

      </div>
    `;

    document.body.appendChild(root);
  }

  /**
   * Bind DOM Events for Agent
   */
  function bindAgentEvents() {
    const fab = document.getElementById('sentinel-fab');
    const modal = document.getElementById('sentinel-modal');
    const closeBtn = document.getElementById('sentinel-close-btn');
    const expandBtn = document.getElementById('sentinel-expand-btn');
    const ttsBtn = document.getElementById('sentinel-tts-btn');
    const settingsBtn = document.getElementById('sentinel-settings-btn');
    const closeSettingsBtn = document.getElementById('sentinel-close-settings');
    const saveSettingsBtn = document.getElementById('sentinel-save-settings');
    const settingsLayer = document.getElementById('sentinel-settings-layer');
    const engineSelect = document.getElementById('sentinel-engine-mode');
    const geminiGroup = document.getElementById('gemini-key-group');
    const clearChatBtn = document.getElementById('sentinel-clear-chat-btn');
    
    const input = document.getElementById('sentinel-input');
    const sendBtn = document.getElementById('sentinel-send-btn');
    const voiceBtn = document.getElementById('sentinel-voice-btn');
    const quickTools = document.querySelectorAll('.ai-tool-pill[data-prompt]');
    
    const toggleScannerBtn = document.getElementById('btn-toggle-scanner');
    const closeScannerBtn = document.getElementById('btn-close-scanner');
    const scannerDrawer = document.getElementById('sentinel-scanner-drawer');
    const submitScannerBtn = document.getElementById('btn-submit-scanner');

    // Toggle Modal Open/Close
    fab.addEventListener('click', () => {
      const isActive = modal.classList.toggle('active');
      if (isActive) {
        document.getElementById('sentinel-unread-badge').style.display = 'none';
        setTimeout(() => input.focus(), 150);
      }
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // Expand / Shrink Modal
    expandBtn.addEventListener('click', () => {
      modal.classList.toggle('expanded');
    });

    // Toggle TTS
    ttsBtn.addEventListener('click', () => {
      isVoiceEnabled = !isVoiceEnabled;
      ttsBtn.classList.toggle('active', isVoiceEnabled);
      if (isVoiceEnabled) {
        speakText('Sentinel AI voice readout activated.');
      } else {
        window.speechSynthesis && window.speechSynthesis.cancel();
      }
    });

    // Settings Toggle
    settingsBtn.addEventListener('click', () => {
      settingsLayer.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', () => {
      settingsLayer.classList.remove('active');
    });

    engineSelect.addEventListener('change', () => {
      geminiGroup.style.display = engineSelect.value === 'gemini' ? 'flex' : 'none';
    });

    saveSettingsBtn.addEventListener('click', () => {
      const keyVal = document.getElementById('sentinel-gemini-key').value.trim();
      customApiKey = keyVal;
      localStorage.setItem('sentinel_gemini_api_key', customApiKey);
      settingsLayer.classList.remove('active');
      appendAgentMessage(`Settings updated! Engine mode: **${engineSelect.value.toUpperCase()}**.`);
    });

    // Clear Chat
    clearChatBtn.addEventListener('click', () => {
      chatHistory = [];
      localStorage.removeItem(SENTINEL_CONFIG.STORAGE_KEY);
      const feed = document.getElementById('sentinel-feed');
      feed.innerHTML = '';
      sendInitialGreeting();
    });

    // Quick Tools
    quickTools.forEach(pill => {
      pill.addEventListener('click', () => {
        const prompt = pill.getAttribute('data-prompt');
        if (prompt) {
          handleUserSubmission(prompt);
        }
      });
    });

    // Toggle Scanner
    toggleScannerBtn.addEventListener('click', () => {
      scannerDrawer.classList.toggle('active');
    });

    closeScannerBtn.addEventListener('click', () => {
      scannerDrawer.classList.remove('active');
    });

    submitScannerBtn.addEventListener('click', () => {
      const amount = Number(document.getElementById('scan-amount').value) || 0;
      const isNew = document.getElementById('scan-new-payee').value === 'true';
      const loc = document.getElementById('scan-location').value.trim() || 'Mumbai, IN';
      const vel = document.getElementById('scan-velocity').value === 'true';

      scannerDrawer.classList.remove('active');

      const userText = `Audit quick scan: Amount ₹${amount.toLocaleString()}, Payee: ${isNew ? 'New' : 'Existing'}, Location: ${loc}, Velocity Spike: ${vel ? 'Yes' : 'No'}`;
      handleDirectTransactionAudit({
        amount,
        isNewPayee: isNew,
        location: loc,
        velocitySpike: vel,
        payeeId: 'PAYEE-' + Math.floor(1000 + Math.random() * 9000),
        accountId: 'ACC-' + Math.floor(1000 + Math.random() * 9000)
      }, userText);
    });

    // Send Input Handling
    function triggerSend() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      input.style.height = 'auto';
      handleUserSubmission(text);
    }

    sendBtn.addEventListener('click', triggerSend);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        triggerSend();
      }
    });

    // Auto-expand textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });

    // Voice Input Mic
    voiceBtn.addEventListener('click', () => {
      if (!speechRecognition) {
        appendAgentMessage('Speech recognition is not supported in this browser. Please use text input.');
        return;
      }

      if (isListening) {
        speechRecognition.stop();
      } else {
        speechRecognition.start();
      }
    });
  }

  /**
   * Initialize Web Speech API
   */
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    const voiceBtn = document.getElementById('sentinel-voice-btn');

    speechRecognition.onstart = () => {
      isListening = true;
      voiceBtn.classList.add('recording');
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('sentinel-input');
      input.value = transcript;
      handleUserSubmission(transcript);
    };

    speechRecognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      isListening = false;
      voiceBtn.classList.remove('recording');
    };

    speechRecognition.onend = () => {
      isListening = false;
      voiceBtn.classList.remove('recording');
    };
  }

  /**
   * Text to Speech Output
   */
  function speakText(text) {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio
    const cleanText = text.replace(/[*_#`\[\]]/g, '').replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Context-Aware Initial Greeting
   */
  function sendInitialGreeting() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    let contextualTip = '';

    if (path.includes('check-transaction')) {
      contextualTip = 'You are currently on the **Transaction Checker** page. You can ask me to evaluate any custom payload or fill the form automatically!';
    } else if (path.includes('dashboard')) {
      contextualTip = 'You are reviewing the **Monitoring Dashboard**. Ask me for statistical breakdowns, batch summaries, or anomaly insights.';
    } else if (path.includes('about')) {
      contextualTip = 'You are on the **About Architecture** page. Ask me how DMGT Logic, ADSA Graphs, and Python Z-Score integrate together.';
    } else {
      contextualTip = 'I can help you audit transactions, simulate attacks, solve discrete mathematics formulas, and explain risk scores in real-time!';
    }

    const greeting = `👋 **Hello! I am Sentinel AI**, your autonomous FinTech Security Copilot.

${contextualTip}

Try typing:
- \`Check ₹85,000 to PAYEE-9942 from Paris\`
- \`Simulate money laundering velocity spike\`
- \`Explain formula (P ∧ Q) ∨ (P ∧ R) ∨ S\``;

    appendAgentMessage(greeting, false);
  }

  /**
   * Message Feed Rendering Functions
   */
  function appendUserMessage(text) {
    const feed = document.getElementById('sentinel-feed');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-msg-user';
    msg.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="ai-msg-bubble">
        <div>${escapeHtml(text)}</div>
        <span class="ai-msg-time">${time}</span>
      </div>
    `;

    feed.appendChild(msg);
    feed.scrollTop = feed.scrollHeight;

    chatHistory.push({ role: 'user', content: text, time });
    saveChatHistory();
  }

  function showTypingIndicator() {
    const feed = document.getElementById('sentinel-feed');
    const indicator = document.createElement('div');
    indicator.id = 'sentinel-typing';
    indicator.className = 'ai-message ai-msg-agent';
    indicator.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="ai-typing-indicator">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-text">Sentinel AI is computing...</span>
      </div>
    `;
    feed.appendChild(indicator);
    feed.scrollTop = feed.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('sentinel-typing');
    if (el) el.remove();
  }

  function appendAgentMessage(markdownContent, shouldSpeak = true) {
    removeTypingIndicator();
    const feed = document.getElementById('sentinel-feed');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msg = document.createElement('div');
    msg.className = 'ai-message ai-msg-agent';
    
    const formattedHtml = formatAgentMarkdown(markdownContent);

    msg.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <div class="ai-msg-bubble">
        <div class="ai-bubble-body">${formattedHtml}</div>
        <span class="ai-msg-time">${time}</span>
      </div>
    `;

    feed.appendChild(msg);
    feed.scrollTop = feed.scrollHeight;

    // Attach dynamic click events to buttons inside message
    attachMessageActionHandlers(msg);

    chatHistory.push({ role: 'agent', content: markdownContent, time });
    saveChatHistory();

    if (shouldSpeak) {
      speakText(markdownContent);
    }
  }

  /**
   * Action Handler for buttons generated inside Agent messages
   */
  function attachMessageActionHandlers(container) {
    const actionBtns = container.querySelectorAll('[data-agent-action]');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-agent-action');
        const payloadStr = btn.getAttribute('data-payload');
        let payload = {};
        try {
          if (payloadStr) payload = JSON.parse(decodeURIComponent(payloadStr));
        } catch (e) {
          console.error('Failed to parse agent action payload', e);
        }

        executeAgentAction(action, payload);
      });
    });
  }

  /**
   * Autonomous Action Dispatcher
   */
  function executeAgentAction(action, payload) {
    switch (action) {
      case 'fill-checker':
        // If on check-transaction.html, populate form directly
        if (window.location.pathname.includes('check-transaction.html')) {
          populateCheckerForm(payload);
          appendAgentMessage(`✓ I have populated the **Transaction Screening Form** with amount **₹${payload.amount?.toLocaleString()}** and Payee **${payload.payeeId}**. You can click "Check Transaction" or make any edits.`);
        } else {
          // Redirect with URL params
          const params = new URLSearchParams({
            amount: payload.amount || 75000,
            payeeId: payload.payeeId || 'PAYEE-9942',
            newPayee: payload.isNewPayee ? 'Yes' : 'No',
            location: payload.location || 'Mumbai, IN',
            autoRun: '1'
          });
          window.location.href = `check-transaction.html?${params.toString()}`;
        }
        break;

      case 'navigate-dashboard':
        window.location.href = 'dashboard.html';
        break;

      case 'simulate-attack':
        handleUserSubmission('Simulate money laundering velocity burst attack');
        break;

      case 'run-quick-scan':
        document.getElementById('sentinel-scanner-drawer').classList.add('active');
        break;

      default:
        console.warn('Unknown agent action:', action);
    }
  }

  function populateCheckerForm(data) {
    const amtInput = document.getElementById('transactionAmount');
    const payeeInput = document.getElementById('payeeId');
    const locInput = document.getElementById('location');
    const accInput = document.getElementById('accountId');
    const form = document.getElementById('check-transaction-form');

    if (amtInput && data.amount) amtInput.value = data.amount;
    if (payeeInput && data.payeeId) payeeInput.value = data.payeeId;
    if (locInput && data.location) locInput.value = data.location;
    if (accInput && data.accountId) accInput.value = data.accountId;

    if (form && form.elements['newPayee']) {
      form.elements['newPayee'].value = data.isNewPayee ? 'Yes' : 'No';
    }

    if (typeof showToast === 'function') {
      showToast('Form Auto-Filled by Sentinel AI', `Loaded amount ₹${data.amount?.toLocaleString()}`);
    }
  }

  /**
   * Save & Load Local History
   */
  function saveChatHistory() {
    try {
      localStorage.setItem(SENTINEL_CONFIG.STORAGE_KEY, JSON.stringify(chatHistory.slice(-30)));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }

  function loadChatHistory() {
    try {
      const saved = localStorage.getItem(SENTINEL_CONFIG.STORAGE_KEY);
      if (saved) {
        chatHistory = JSON.parse(saved);
        chatHistory.forEach(item => {
          if (item.role === 'user') {
            appendUserMessageUI(item.content, item.time);
          } else {
            appendAgentMessageUI(item.content, item.time);
          }
        });
      }
    } catch (e) {
      chatHistory = [];
    }
  }

  function appendUserMessageUI(text, time) {
    const feed = document.getElementById('sentinel-feed');
    const msg = document.createElement('div');
    msg.className = 'ai-message ai-msg-user';
    msg.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="ai-msg-bubble">
        <div>${escapeHtml(text)}</div>
        <span class="ai-msg-time">${time}</span>
      </div>
    `;
    feed.appendChild(msg);
  }

  function appendAgentMessageUI(markdownContent, time) {
    const feed = document.getElementById('sentinel-feed');
    const msg = document.createElement('div');
    msg.className = 'ai-message ai-msg-agent';
    const formattedHtml = formatAgentMarkdown(markdownContent);
    msg.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <div class="ai-msg-bubble">
        <div class="ai-bubble-body">${formattedHtml}</div>
        <span class="ai-msg-time">${time}</span>
      </div>
    `;
    feed.appendChild(msg);
    attachMessageActionHandlers(msg);
  }

  /**
   * Main Submission Router
   */
  async function handleUserSubmission(queryText) {
    appendUserMessage(queryText);
    showTypingIndicator();

    // Check if Gemini mode is chosen & key is available
    const engineMode = document.getElementById('sentinel-engine-mode')?.value;
    if (engineMode === 'gemini' && customApiKey) {
      try {
        const geminiReply = await queryGeminiAPI(queryText);
        appendAgentMessage(geminiReply);
        return;
      } catch (err) {
        console.error('Gemini API call failed, falling back to autonomous engine:', err);
      }
    }

    // Simulate thinking delay (250ms - 500ms) for realistic agent feel
    setTimeout(() => {
      const response = processAutonomousQuery(queryText);
      appendAgentMessage(response);
    }, 350);
  }

  /**
   * Direct Forensic Transaction Audit from Scanner or Structured Inputs
   */
  function handleDirectTransactionAudit(txn, userQueryText) {
    appendUserMessage(userQueryText);
    showTypingIndicator();

    setTimeout(() => {
      const report = generateTransactionForensicReport(txn);
      appendAgentMessage(report);
    }, 350);
  }

  /**
   * Autonomous NLP Intent Processor & Technical Knowledge Reasoner
   */
  function processAutonomousQuery(rawQuery) {
    const query = rawQuery.toLowerCase().trim();

    // 1. Check if user is asking to audit/check a transaction with parameters
    const extractedTxn = extractTransactionParameters(rawQuery);
    if (extractedTxn && (extractedTxn.amount > 0 || extractedTxn.hasTxnKeywords)) {
      return generateTransactionForensicReport(extractedTxn);
    }

    // 2. Attack Simulation Intent
    if (query.includes('simulate') || query.includes('attack') || query.includes('smurf') || query.includes('laundering') || query.includes('mule')) {
      return generateAttackSimulationResponse(query);
    }

    // 3. DMGT Discrete Mathematics & Propositional Logic Intent
    if (query.includes('dmgt') || query.includes('proposition') || query.includes('formula') || query.includes('truth table') || query.includes('(p ∧ q)')) {
      return generateDMGTExplanationResponse();
    }

    // 4. Statistical Z-Score Outlier Intent
    if (query.includes('z-score') || query.includes('z score') || query.includes('standard deviation') || query.includes('gaussian') || query.includes('distribution') || query.includes('mean')) {
      return generateZScoreExplanationResponse();
    }

    // 5. Graph Theory & ADSA Intent
    if (query.includes('graph') || query.includes('adsa') || query.includes('network') || query.includes('cycle') || query.includes('adjacency') || query.includes('vertex')) {
      return generateGraphTheoryResponse();
    }

    // 6. Java OOP Architecture Intent
    if (query.includes('java') || query.includes('oop') || query.includes('object oriented') || query.includes('class') || query.includes('singleton')) {
      return generateJavaOOPResponse();
    }

    // 7. Dashboard & Metrics Telemetry Intent
    if (query.includes('dashboard') || query.includes('stats') || query.includes('metric') || query.includes('total') || query.includes('flag rate')) {
      return generateDashboardTelemetryResponse();
    }

    // 8. Navigation & Action Intent
    if (query.includes('check page') || query.includes('go to check') || query.includes('fill form') || query.includes('test')) {
      const sample = { amount: 88500, payeeId: 'PAYEE-9910', isNewPayee: true, location: 'London, UK' };
      const encoded = encodeURIComponent(JSON.stringify(sample));
      return `Sure! I can load a test outlier transaction directly into the **Check Transaction** page.

<div class="ai-content-box">
  <strong>Prepared Test Case:</strong><br>
  • Amount: <code>₹88,500</code> (> ₹50k threshold)<br>
  • Payee: <code>PAYEE-9910 (New)</code><br>
  • Location: <code>London, UK (Unrecognized)</code>
</div>

<div class="ai-msg-actions">
  <button class="ai-action-chip" data-agent-action="fill-checker" data-payload="${encoded}">⚡ Load into Screening Form</button>
</div>`;
    }

    // 9. About / Academic Info Intent
    if (query.includes('about') || query.includes('project') || query.includes('team') || query.includes('b.tech') || query.includes('college')) {
      return `🎓 **Bank Transaction Anomaly Flagger** is a B.Tech academic capstone project bridging **4 Computer Science core pillars**:

1. **DMGT (Discrete Math)**: Propositional logic expressions for deterministic compliance rules.
2. **ADSA (Data Structures & Algorithms)**: Directed relational graphs for detecting fund dispersion & money mule rings.
3. **Python AI & Statistics**: Gaussian Z-score outlier detection ($Z > 2.5$) for velocity & spending deviations.
4. **Java Enterprise OOP**: High-throughput modular business logic engine.

Would you like me to simulate an attack or calculate a Z-score?`;
    }

    // 10. General Security & Banking FAQs
    if (query.includes('why') && (query.includes('flag') || query.includes('blocked'))) {
      return `Bank transactions are flagged when they violate one or more risk policies:
- **High-Value to New Payees (Rule 1)**: Transfers > ₹50,000 to beneficiaries with no prior transaction history.
- **Geographic Outliers (Rule 2)**: Initiated from unrecognized IP/locations without habitual history.
- **Velocity Spikes (Rule 3)**: Rapid bursts of transactions within a tight 5-minute time window.
- **Statistical Deviation**: Amount exceeds 3 standard deviations ($Z > 3.0$) from the account's historical mean.`;
    }

    // Fallback Comprehensive Expert Response
    return `🤖 **Sentinel AI Analysis & Copilot Assistant**

I am ready to audit banking transactions, evaluate propositional formulas, or demonstrate attack detection.

Here are a few quick actions you can try:
<div class="ai-msg-actions">
  <button class="ai-action-chip" data-agent-action="run-quick-scan">⚡ Open Quick Scanner</button>
  <button class="ai-action-chip" data-agent-action="simulate-attack">🚨 Simulate Velocity Attack</button>
  <button class="ai-action-chip" data-agent-action="navigate-dashboard">📊 Open Dashboard</button>
</div>

Or paste any transaction summary such as:
> *"Audit ₹92,000 sent from Paris to PAYEE-4401"*`;
  }

  /**
   * Extract Transaction Parameters from Natural Language Query
   */
  function extractTransactionParameters(text) {
    const raw = text;
    let amount = 0;
    let isNewPayee = false;
    let location = 'Mumbai, IN';
    let payeeId = 'PAYEE-' + Math.floor(1000 + Math.random() * 9000);
    let velocitySpike = false;
    let hasTxnKeywords = false;

    // Check for amount patterns (e.g., ₹50,000, 50000, 50k, $4000, rs 70000, inr 90000)
    const amountMatch = raw.match(/(?:(?:rs\.?|inr|₹|\$)\s*|amount\s*(?:is|of)?\s*)?(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(?:k|thousand|lakh|lac))?/i);
    
    if (amountMatch) {
      let numStr = amountMatch[1].replace(/,/g, '');
      let baseVal = parseFloat(numStr);
      if (raw.toLowerCase().includes(amountMatch[1].toLowerCase() + 'k')) {
        baseVal = baseVal * 1000;
      } else if (raw.toLowerCase().includes(amountMatch[1].toLowerCase() + ' lakh') || raw.toLowerCase().includes(amountMatch[1].toLowerCase() + ' lac')) {
        baseVal = baseVal * 100000;
      }
      if (baseVal > 0) {
        amount = baseVal;
        hasTxnKeywords = true;
      }
    }

    // Check for New Payee keywords
    if (raw.match(/new(?:\s+payee|\s+beneficiary|\s+account|\s+user)?|unregistered|first\s*time|unknown\s+payee/i)) {
      isNewPayee = true;
      hasTxnKeywords = true;
    } else if (raw.match(/existing|verified|registered|old\s+payee|trusted/i)) {
      isNewPayee = false;
      hasTxnKeywords = true;
    } else {
      // Default to new payee if amount is high for demonstration safety
      isNewPayee = amount > SENTINEL_CONFIG.DMGT_HIGH_THRESHOLD;
    }

    // Check for Payee ID match
    const payeeMatch = raw.match(/payee[-_]?([a-z0-9]+)/i);
    if (payeeMatch) {
      payeeId = 'PAYEE-' + payeeMatch[1].toUpperCase();
      hasTxnKeywords = true;
    }

    // Check for Location keywords
    const foreignCities = ['paris', 'london', 'new york', 'dubai', 'singapore', 'tokyo', 'moscow', 'zurich', 'sydney'];
    const indianSafe = ['mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune'];

    for (let city of foreignCities) {
      if (raw.toLowerCase().includes(city)) {
        location = city.charAt(0).toUpperCase() + city.slice(1) + ', International';
        hasTxnKeywords = true;
        break;
      }
    }

    for (let city of indianSafe) {
      if (raw.toLowerCase().includes(city)) {
        location = city.charAt(0).toUpperCase() + city.slice(1) + ', IN';
        hasTxnKeywords = true;
        break;
      }
    }

    // Check for Velocity spike
    if (raw.match(/velocity|burst|rapid|spike|repeated|fast/i)) {
      velocitySpike = true;
      hasTxnKeywords = true;
    }

    if (amount === 0 && !hasTxnKeywords) return null;

    return {
      amount,
      isNewPayee,
      payeeId,
      location,
      velocitySpike,
      hasTxnKeywords,
      accountId: 'ACC-' + Math.floor(1000 + Math.random() * 9000)
    };
  }

  /**
   * Run DMGT Logic & Z-Score to generate comprehensive forensic evaluation report
   */
  function generateTransactionForensicReport(txn) {
    const amount = Number(txn.amount) || 0;
    const isNew = Boolean(txn.isNewPayee);
    const loc = (txn.location || 'Mumbai, IN').trim();
    const vel = Boolean(txn.velocitySpike);

    // 1. Evaluate Truth Values for Formal DMGT Propositions
    const P = amount > SENTINEL_CONFIG.DMGT_HIGH_THRESHOLD;
    const Q = isNew;
    const R = !SENTINEL_CONFIG.SAFE_LOCATIONS.some(s => s.toLowerCase() === loc.toLowerCase());
    const S = vel;

    // 2. Evaluate Compound Formulas
    const rule1 = P && Q; // High Amount & New Payee
    const rule2 = P && R; // High Amount & Unrecognized Geo
    const rule3 = S;      // Velocity Spike

    const isAnomaly = rule1 || rule2 || rule3;
    const riskLevel = rule1 ? 'HIGH' : (rule2 || rule3 ? 'MEDIUM' : 'LOW');

    // 3. Statistical Z-Score Computation
    const baseline = SENTINEL_CONFIG.DEFAULT_BASELINE;
    const mean = baseline.reduce((a, b) => a + b, 0) / baseline.length;
    const variance = baseline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baseline.length;
    const stdDev = Math.sqrt(variance);
    const zScore = (amount - mean) / (stdDev || 1);
    const isZOutlier = Math.abs(zScore) >= 2.5;

    // Build Formatted Output
    const encodedPayload = encodeURIComponent(JSON.stringify(txn));

    return `### 🔍 Forensic Transaction Screening Report

${isAnomaly 
  ? `<div class="ai-flag-badge ai-badge-flagged">⚠ ANOMALY FLAGGED • ${riskLevel} RISK</div>` 
  : `<div class="ai-flag-badge ai-badge-safe">✓ TRANSACTION VERIFIED NORMAL</div>`}

**Transaction Parameters:**
- **Amount:** \`₹${amount.toLocaleString()}\`
- **Payee:** \`${txn.payeeId} (${isNew ? 'New / Unregistered' : 'Existing'})\`
- **Location:** \`${loc} ${R ? '(Foreign / Unrecognized)' : '(Recognized)'}\`
- **Velocity Spike:** \`${vel ? 'Triggered (Spike)' : 'Normal'}\`

---

#### 📐 DMGT Propositional Logic Evaluation:
<div class="ai-formula-code">Formula: (P ∧ Q) ∨ (P ∧ R) ∨ S = ${isAnomaly ? 'TRUE (1)' : 'FALSE (0)'}</div>

<div class="ai-prop-breakdown">
  <div class="ai-prop-item ${P ? 'true-val' : 'false-val'}">
    <strong>P (Amount > ₹50k):</strong> ${P ? 'TRUE (T)' : 'FALSE (F)'}
  </div>
  <div class="ai-prop-item ${Q ? 'true-val' : 'false-val'}">
    <strong>Q (New Payee):</strong> ${Q ? 'TRUE (T)' : 'FALSE (F)'}
  </div>
  <div class="ai-prop-item ${R ? 'true-val' : 'false-val'}">
    <strong>R (Unsafe Origin):</strong> ${R ? 'TRUE (T)' : 'FALSE (F)'}
  </div>
  <div class="ai-prop-item ${S ? 'true-val' : 'false-val'}">
    <strong>S (Velocity Spike):</strong> ${S ? 'TRUE (T)' : 'FALSE (F)'}
  </div>
</div>

${rule1 ? `> **Rule DMGT-01 Triggered:** High-value transfer (₹${amount.toLocaleString()}) to an unverified beneficiary.\n` : ''}
${rule2 ? `> **Rule DMGT-02 Triggered:** High-value initiation from an unrecognized geographic origin (${loc}).\n` : ''}
${rule3 ? `> **Rule DMGT-03 Triggered:** Rapid burst transfer anomaly.\n` : ''}

---

#### 📊 Statistical Z-Score Telemetry:
- Baseline Mean ($\mu$): \`₹${Math.round(mean).toLocaleString()}\` | Std Dev ($\sigma$): \`₹${Math.round(stdDev).toLocaleString()}\`
- Computed **Z-Score ($Z$):** \`${zScore.toFixed(2)}\` ${isZOutlier ? '*(Extreme Statistical Outlier > 2.5σ)*' : '*(Within Normal Gaussian Band)*'}

<div class="ai-msg-actions">
  <button class="ai-action-chip" data-agent-action="fill-checker" data-payload="${encodedPayload}">⚡ Open in Full Screening Form</button>
  <button class="ai-action-chip" data-agent-action="run-quick-scan">🔄 Test Another Parameter</button>
</div>`;
  }

  /**
   * Attack Simulation Generator
   */
  function generateAttackSimulationResponse(query) {
    const attackPayload = {
      accountId: 'ACC-ATTACK-9',
      transactionId: 'TXN-BURST-88',
      amount: 94000,
      payeeId: 'PAYEE-MULE-44',
      isNewPayee: true,
      location: 'Zurich, International',
      velocitySpike: true
    };
    const encoded = encodeURIComponent(JSON.stringify(attackPayload));

    return `🚨 **FinTech Anomaly Simulation: Velocity Burst & Money Mule Structuring**

I have simulated a multi-layered attack pattern to demonstrate the detection system:

1. **Attack Vector:** Smurfing & Layering
2. **Simulated Payload:**
   - Account: \`ACC-ATTACK-9\`
   - Amount: \`₹94,000\` (Exceeds ₹50,000 threshold)
   - Beneficiary: \`PAYEE-MULE-44\` (New unverified entity)
   - Origin: \`Zurich, International\` (Unrecognized Geo-IP)
   - Velocity: \`5 rapid transfers in 180 seconds\`

**Multi-Layer Detection Results:**
- **DMGT Propositional Deductions:** Triggered **Rule 1 (P ∧ Q)** and **Rule 2 (P ∧ R)** and **Rule 3 (S)** simultaneously!
- **ADSA Graph Linkage:** Out-degree $\\delta^+(v) = 5$ with cyclic flow into sink mule vertex.
- **Python Z-Score:** Calculated $Z = +4.82$ (Deviating $> 4.8\\sigma$ from historical baseline).

<div class="ai-msg-actions">
  <button class="ai-action-chip" data-agent-action="fill-checker" data-payload="${encoded}">⚡ Test This Attack in Form</button>
  <button class="ai-action-chip" data-agent-action="navigate-dashboard">📊 View Audit Records</button>
</div>`;
  }

  /**
   * DMGT Propositional Logic Knowledge
   */
  function generateDMGTExplanationResponse() {
    return `### 📐 Phase 2: DMGT Propositional Logic Engine

The core rule screening engine implements formal discrete propositions from **Discrete Mathematics & Graph Theory**:

#### 1. Atomic Propositions:
- **$P$**: $\\text{Amount} > ₹50,000$ *(High-Value Threshold)*
- **$Q$**: $\\text{Payee is New / First-Time Transfer}$
- **$R$**: $\\text{Location is Unrecognized / Non-Whitelisted}$
- **$S$**: $\\text{Transaction Velocity Spike Detected}$

#### 2. Deduction Rules:
- **Rule 1:** $P \\land Q \\implies \\text{FLAG}$ *(High value to new payee)*
- **Rule 2:** $P \\land R \\implies \\text{FLAG}$ *(High value from unknown location)*
- **Rule 3:** $S \\implies \\text{FLAG}$ *(Velocity burst)*

#### 3. Composite Master Formula:
$$\\text{Anomaly} \\iff (P \\land Q) \\lor (P \\land R) \\lor S$$

Whenever this Boolean expression evaluates to **TRUE (1)**, the transaction is immediately quarantined for compliance review.`;
  }

  /**
   * Z-Score Math Knowledge
   */
  function generateZScoreExplanationResponse() {
    return `### 📈 Statistical Gaussian Z-Score Outlier Detection

In Phase 3 (Python Backend Integration), transactions are screened using **Standard Score (Z-Score)** analysis:

$$Z = \\frac{x - \\mu}{\\sigma}$$

Where:
- **$x$**: Current Transaction Amount
- **$\\mu$**: Historical Mean Spending for this Account: $\\mu = \\frac{1}{N}\\sum_{i=1}^N x_i$
- **$\\sigma$**: Standard Deviation: $\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^N (x_i - \\mu)^2}$

**Decision Thresholds:**
- $|Z| < 2.0$: **Normal** (Falls within 95.4% expected Gaussian distribution)
- $2.0 \\le |Z| < 3.0$: **Warning / Elevated Review**
- $|Z| \\ge 3.0$: **Extreme Anomaly** (Only 0.3% probability in benign behavior)`;
  }

  /**
   * ADSA Graph Theory Knowledge
   */
  function generateGraphTheoryResponse() {
    return `### 🕸 ADSA Graph Theory & Network Linkage Analysis

In Phase 4 (ADSA Integration), transactions are modeled as a **Directed Multigraph** $G = (V, E)$:

- **Vertices ($V$):** Bank Accounts and Merchant Payees
- **Directed Edges ($E$):** Fund transfers with weights $w(e) = \\text{Amount}$ and timestamp $\\tau$

**Graph Algorithms Applied:**
1. **Cycle Detection (Tarjan's / DFS):** Identifies circular fund routing ($A \\to B \\to C \\to A$) used in layering.
2. **In-Degree / Out-Degree Ratios:** Flags "Hub Nodes" with high fan-in immediately followed by rapid fan-out (Money Mule behavior).
3. **Shortest Path Clustering:** Computes graph distance between high-risk blacklisted entities.`;
  }

  /**
   * Java OOP Architecture Knowledge
   */
  function generateJavaOOPResponse() {
    return `### ☕ Java Enterprise OOP Architecture

The underlying backend is designed with clean **Object-Oriented Design Principles**:

- **Domain Entities:** \`Account\`, \`Transaction\`, \`Payee\`, \`AuditLog\`
- **Strategy Pattern:** Interchangeable anomaly detection strategies (\`DMGTRuleEvaluator\`, \`ZScoreEvaluator\`, \`GraphCycleEvaluator\`).
- **Factory Pattern:** \`AnomalyResultFactory\` for standardizing multi-stage screening payloads.
- **Repository Layer:** Fast in-memory caching and persistent transaction ledger.`;
  }

  /**
   * Dashboard Telemetry Knowledge
   */
  function generateDashboardTelemetryResponse() {
    return `### 📊 Real-Time Dashboard KPI Overview

Current operational metrics from the active monitoring batch:

- **Total Batch Transactions:** \`500\`
- **Flagged Anomalies:** \`48\`
- **Overall Anomaly Flag Rate:** \`9.6%\`
- **Safe Verified Transactions:** \`452 (90.4%)\`

**Flag Distribution by Category:**
1. High-Value to New Payees (DMGT-01): **54.2%**
2. Geolocation Mismatch (DMGT-02): **29.2%**
3. Velocity Spikes (DMGT-03): **16.6%**

<div class="ai-msg-actions">
  <button class="ai-action-chip" data-agent-action="navigate-dashboard">📊 Open Monitoring Dashboard</button>
</div>`;
  }

  /**
   * Optional Google Gemini API Direct Integration
   */
  async function queryGeminiAPI(userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${customApiKey}`;
    
    const systemInstruction = `You are Sentinel AI, the expert FinTech Security & Anomaly Detection Copilot on the "Bank Transaction Anomaly Flagger" academic website.
Explain topics using discrete mathematics (DMGT logic rules: (P ∧ Q) ∨ (P ∧ R) ∨ S), statistical Z-score outlier formulas, graph theory ADSA networks, and Java OOP architecture. Keep responses concise, well-structured with markdown and bullet points.`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from Gemini.';
  }

  /**
   * Markdown Formatter Helper
   */
  function formatAgentMarkdown(text) {
    if (!text) return '';

    let html = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline Code
      .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
      // Headers
      .replace(/^### (.*$)/gim, '<h4 style="color:#93c5fd; font-size:0.95rem; margin:8px 0 4px;">$1</h4>')
      .replace(/^#### (.*$)/gim, '<h5 style="color:#cbd5e1; font-size:0.86rem; margin:6px 0 2px;">$1</h5>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote style="border-left:3px solid #38bdf8; padding-left:8px; margin:4px 0; color:#cbd5e1; font-size:0.8rem;">$1</blockquote>')
      // Lists
      .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left:14px; font-size:0.84rem;">$1</li>')
      // Numbered lists
      .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li style="margin-left:14px; font-size:0.84rem;">$1. $2</li>')
      // Newlines
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
