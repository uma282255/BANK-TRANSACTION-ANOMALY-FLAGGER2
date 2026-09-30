/**
 * Bank Transaction Anomaly Flagger
 * Multi-Page Frontend Interactions & DMGT Propositional Logic Engine Integration
 * Vanilla JavaScript (Zero external dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initNavActiveState();
  initCheckTransactionForm();
  initDashboardTableFilters();
});

/**
 * Mobile Navigation Menu Toggle with Accessible State & Outside Click Detection
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link, .nav-btn');

  if (!toggleBtn || !navMenu) return;

  function toggleMenu(forceState) {
    const isCurrentlyOpen = navMenu.classList.contains('open');
    const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    navMenu.classList.toggle('open', nextState);
    toggleBtn.classList.toggle('is-active', nextState);
    toggleBtn.setAttribute('aria-expanded', String(nextState));
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close mobile drawer when clicking any navigation link or nav button
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close when clicking outside of the navbar header
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });
}

/**
 * Ensures the correct navigation link has the 'active' class based on the current filename
 */
function initNavActiveState() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath) {
      link.classList.add('active');
    } else if (currentPath === '' && linkHref === 'index.html') {
      link.classList.add('active');
    }
  });
}

/**
 * Check Transaction Form Logic (check-transaction.html)
 * Integrated with DMGT Propositional Logic Rule Engine
 */
function initCheckTransactionForm() {
  const form = document.getElementById('check-transaction-form');
  const resultContainer = document.getElementById('demo-result-container');
  const resultCard = document.getElementById('result-card-main');
  const statusBadge = document.getElementById('result-status-badge');
  const statusText = document.getElementById('result-status-text');
  const priorityTag = document.getElementById('result-priority-tag');
  const summaryText = document.getElementById('result-summary-text');
  const propositionsGrid = document.getElementById('dmgt-propositions-grid');
  const rulesBreakdown = document.getElementById('dmgt-rules-breakdown');
  const payloadGrid = document.getElementById('result-payload-grid');

  const prefillHighRiskBtn = document.getElementById('btn-prefill-sample');
  const prefillSafeBtn = document.getElementById('btn-safe-sample');
  const resetBtn = document.getElementById('btn-reset-form');

  if (!form) return;

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const accountId = document.getElementById('accountId')?.value.trim() || 'ACC-1001';
    const transactionId = document.getElementById('transactionId')?.value.trim() || 'TXN-1025';
    const amount = Number(document.getElementById('transactionAmount')?.value) || 0;
    const payeeId = document.getElementById('payeeId')?.value.trim() || 'PAYEE-9942';
    const newPayee = (form.elements['newPayee']?.value || 'Yes') === 'Yes';
    const txnType = document.getElementById('transactionType')?.value || 'IMPS Transfer';
    const location = document.getElementById('location')?.value.trim() || 'Mumbai, IN';
    const prevAmounts = document.getElementById('prevAmounts')?.value.trim() || '1200, 1500, 2100';

    const txnData = {
      accountId,
      transactionId,
      amount,
      payeeId,
      isNewPayee: newPayee,
      transactionType: txnType,
      location,
      prevAmounts
    };

    // Run DMGT Propositional Logic Engine
    let dmgtReport;
    if (typeof evaluateDMGTRules === 'function') {
      dmgtReport = evaluateDMGTRules(txnData);
    } else {
      dmgtReport = {
        isFlagged: amount > 50000 && newPayee,
        status: (amount > 50000 && newPayee) ? 'FLAGGED FOR REVIEW' : 'NORMAL',
        riskLevel: (amount > 50000 && newPayee) ? 'HIGH' : 'LOW',
        propositions: {
          P: { symbol: 'P', name: 'High Amount', value: amount > 50000, description: `₹${amount} ${amount > 50000 ? '> ₹50k' : '≤ ₹50k'}` },
          Q: { symbol: 'Q', name: 'New Payee', value: newPayee, description: newPayee ? 'New Beneficiary' : 'Existing' },
          R: { symbol: 'R', name: 'Unrecognized Location', value: false, description: location },
          S: { symbol: 'S', name: 'Velocity Spike', value: false, description: 'Normal' }
        },
        compositeFormula: '(P ∧ Q) ∨ (P ∧ R) ∨ S',
        formulaEvaluation: `Result = ${amount > 50000 && newPayee}`,
        triggeredRules: [],
        explanation: 'Evaluated using default logic.'
      };
    }

    renderDMGTResults(txnData, dmgtReport);

    if (resultContainer) {
      resultContainer.style.display = 'block';
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (dmgtReport.isFlagged) {
      showToast('⚠ Anomaly Flagged by DMGT Logic', `Rule violation detected in formula ${dmgtReport.compositeFormula}`);
    } else {
      showToast('✓ Transaction Passed DMGT Logic', 'All propositional constraints satisfied safely.');
    }
  });

  function renderDMGTResults(txn, report) {
    // 1. Update Result Status Badge & Lead Summary
    if (report.isFlagged) {
      resultCard.className = 'card result-card result-flagged';
      statusText.textContent = '⚠ FLAGGED FOR REVIEW';
      statusBadge.className = 'result-status-badge badge-danger';
      priorityTag.textContent = `${report.riskLevel} Risk Priority`;
      priorityTag.className = 'stage-tag tag-danger';
      summaryText.innerHTML = `Transaction triggered propositional logic constraint: <strong>${report.triggeredRules.map(r => r.formula).join(', ') || 'P ∧ Q'}</strong>. Elevated for compliance audit.`;
    } else {
      resultCard.className = 'card result-card result-safe';
      statusText.textContent = '✓ TRANSACTION VERIFIED NORMAL';
      statusBadge.className = 'result-status-badge badge-safe';
      priorityTag.textContent = 'Low Risk Normal';
      priorityTag.className = 'stage-tag tag-safe';
      summaryText.innerHTML = `Transaction passed all DMGT propositional logic safety conditions. The formula <code>(P ∧ Q) ∨ (P ∧ R) ∨ S</code> evaluated to <strong>FALSE</strong>.`;
    }

    // 2. Render Atomic Propositions Grid
    if (propositionsGrid) {
      const props = report.propositions;
      propositionsGrid.innerHTML = `
        <div class="prop-card ${props.P.value ? 'prop-true' : 'prop-false'}">
          <div class="prop-header">
            <span class="prop-symbol">P</span>
            <span class="prop-truth-val">${props.P.value ? 'TRUE (T)' : 'FALSE (F)'}</span>
          </div>
          <div class="prop-name">${escapeHtml(props.P.name)}</div>
          <div class="prop-desc">${escapeHtml(props.P.description)}</div>
        </div>

        <div class="prop-card ${props.Q.value ? 'prop-true' : 'prop-false'}">
          <div class="prop-header">
            <span class="prop-symbol">Q</span>
            <span class="prop-truth-val">${props.Q.value ? 'TRUE (T)' : 'FALSE (F)'}</span>
          </div>
          <div class="prop-name">${escapeHtml(props.Q.name)}</div>
          <div class="prop-desc">${escapeHtml(props.Q.description)}</div>
        </div>

        <div class="prop-card ${props.R.value ? 'prop-true' : 'prop-false'}">
          <div class="prop-header">
            <span class="prop-symbol">R</span>
            <span class="prop-truth-val">${props.R.value ? 'TRUE (T)' : 'FALSE (F)'}</span>
          </div>
          <div class="prop-name">${escapeHtml(props.R.name)}</div>
          <div class="prop-desc">${escapeHtml(props.R.description)}</div>
        </div>

        <div class="prop-card ${props.S.value ? 'prop-true' : 'prop-false'}">
          <div class="prop-header">
            <span class="prop-symbol">S</span>
            <span class="prop-truth-val">${props.S.value ? 'TRUE (T)' : 'FALSE (F)'}</span>
          </div>
          <div class="prop-name">${escapeHtml(props.S.name)}</div>
          <div class="prop-desc">${escapeHtml(props.S.description)}</div>
        </div>
      `;
    }

    // 3. Render Rules Deduction Breakdown
    if (rulesBreakdown) {
      if (report.isFlagged && report.triggeredRules.length > 0) {
        rulesBreakdown.innerHTML = `
          <div class="rules-eval-title">Deduction Rule Violations:</div>
          <div class="rules-list">
            ${report.triggeredRules.map(rule => `
              <div class="rule-eval-item item-triggered">
                <div class="rule-icon-flag">⚠</div>
                <div class="rule-body">
                  <div class="rule-top">
                    <span class="rule-code-badge font-mono">${rule.ruleId} (${rule.formula})</span>
                    <span class="rule-severity">${rule.severity} Risk</span>
                  </div>
                  <p class="rule-detail-text">${escapeHtml(rule.description)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        rulesBreakdown.innerHTML = `
          <div class="rules-eval-title">Deduction Rule Evaluation:</div>
          <div class="rule-eval-item item-safe">
            <div class="rule-icon-safe">✓</div>
            <div class="rule-body">
              <div class="rule-top">
                <span class="rule-code-badge font-mono">ALL RULES SATISFIED</span>
                <span class="rule-severity text-safe">Safe Flow</span>
              </div>
              <p class="rule-detail-text">No propositional contradiction or high-value anomalous condition detected.</p>
            </div>
          </div>
        `;
      }
    }

    // 4. Render Captured Parameters
    if (payloadGrid) {
      payloadGrid.innerHTML = `
        <div class="payload-cell">
          <span class="payload-cell-label">Account ID</span>
          <span class="payload-cell-value">${escapeHtml(txn.accountId)}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">Transaction ID</span>
          <span class="payload-cell-value">${escapeHtml(txn.transactionId)}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">Amount</span>
          <span class="payload-cell-value ${report.isFlagged ? 'text-danger' : 'text-safe'} font-bold">₹${txn.amount.toLocaleString()}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">Payee ID</span>
          <span class="payload-cell-value">${escapeHtml(txn.payeeId)}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">New Payee</span>
          <span class="payload-cell-value">${txn.isNewPayee ? 'Yes (New)' : 'No (Existing)'}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">Transaction Type</span>
          <span class="payload-cell-value">${escapeHtml(txn.transactionType)}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">Location</span>
          <span class="payload-cell-value">${escapeHtml(txn.location)}</span>
        </div>
        <div class="payload-cell">
          <span class="payload-cell-label">History Baseline</span>
          <span class="payload-cell-value font-mono">${escapeHtml(txn.prevAmounts)}</span>
        </div>
      `;
    }
  }

  // Pre-fill High-Risk Sample
  if (prefillHighRiskBtn) {
    prefillHighRiskBtn.addEventListener('click', () => {
      document.getElementById('accountId').value = 'ACC-8820';
      document.getElementById('transactionId').value = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('transactionAmount').value = '82000';
      document.getElementById('payeeId').value = 'PAYEE-4019';
      if (form.elements['newPayee']) form.elements['newPayee'].value = 'Yes';
      document.getElementById('transactionType').value = 'IMPS Transfer';
      document.getElementById('location').value = 'Mumbai, IN';
      document.getElementById('prevAmounts').value = '1500, 2200, 1800, 3100, 2900';

      showToast('High-Risk Outlier Loaded', 'Amount ₹82,000 to a New Payee loaded for demonstration.');
    });
  }

  // Pre-fill Safe Sample
  if (prefillSafeBtn) {
    prefillSafeBtn.addEventListener('click', () => {
      document.getElementById('accountId').value = 'ACC-1001';
      document.getElementById('transactionId').value = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('transactionAmount').value = '1850';
      document.getElementById('payeeId').value = 'PAYEE-201';
      if (form.elements['newPayee']) form.elements['newPayee'].value = 'No';
      document.getElementById('transactionType').value = 'UPI Payment';
      document.getElementById('location').value = 'Mumbai, IN';
      document.getElementById('prevAmounts').value = '1200, 1500, 2100, 1800, 2400';

      showToast('Safe Transfer Loaded', 'Routine amount ₹1,850 to an Existing Payee loaded.');
    });
  }

  // Reset Form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      if (resultContainer) {
        resultContainer.style.display = 'none';
      }
      showToast('Form Cleared', 'Transaction form fields have been reset.');
    });
  }

  // Handle URL Query Parameters (e.g. from Sentinel AI Agent cross-page actions)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('amount') || urlParams.has('payeeId')) {
    if (urlParams.has('amount') && document.getElementById('transactionAmount')) {
      document.getElementById('transactionAmount').value = urlParams.get('amount');
    }
    if (urlParams.has('payeeId') && document.getElementById('payeeId')) {
      document.getElementById('payeeId').value = urlParams.get('payeeId');
    }
    if (urlParams.has('location') && document.getElementById('location')) {
      document.getElementById('location').value = urlParams.get('location');
    }
    if (urlParams.has('accountId') && document.getElementById('accountId')) {
      document.getElementById('accountId').value = urlParams.get('accountId');
    }
    if (urlParams.has('newPayee') && form.elements['newPayee']) {
      form.elements['newPayee'].value = urlParams.get('newPayee');
    }

    if (urlParams.get('autoRun') === '1') {
      setTimeout(() => {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 200);
    }
  }
}

/**
 * Dashboard Table Filtering & Row Interactions (dashboard.html)
 */
function initDashboardTableFilters() {
  const filterButtons = document.querySelectorAll('.table-filters .filter-btn');
  const tableRows = document.querySelectorAll('#transactions-table tbody tr');
  const actionButtons = document.querySelectorAll('.table-action-btn');

  if (filterButtons.length === 0 || tableRows.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      tableRows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (filterValue === 'all' || rowStatus === filterValue) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Action Buttons
  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const txn = btn.getAttribute('data-txn') || 'TXN';
      showToast(`Inspecting ${txn}`, 'Detailed graph route & Z-score telemetry will be viewable here in next phase.');
    });
  });
}

/**
 * Toast Notification Helper
 */
function showToast(title, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
    </div>
    <div class="toast-msg">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
