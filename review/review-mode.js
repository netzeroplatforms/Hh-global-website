/* ============================================================
   HH Global Holdings — Review Mode Script
   Injects the review banner, tooltip handler, and floating
   change panel. Active only on /review/ pages.
   ============================================================ */
(function () {
  'use strict';

  const PAGE_TITLE = document.title.replace(/\s*—\s*HH Global.*$/i, '').trim() || 'this page';

  // ─── BANNER ─────────────────────────────────────────────────
  const banner = document.createElement('div');
  banner.className = 'rv-banner';
  banner.innerHTML = `
    <div class="rv-banner-left">
      <span class="rv-banner-tag">Review Mode</span>
      <span class="rv-banner-text">
        Changes from <strong>Sam's feedback (12 May)</strong> are highlighted in amber.
        Hover any highlighted element for context.
      </span>
    </div>
    <div class="rv-banner-right">
      <button class="rv-banner-btn" data-rv-jump="next">Next change →</button>
    </div>
  `;
  document.body.insertBefore(banner, document.body.firstChild);

  // ─── COLLECT CHANGES ────────────────────────────────────────
  const changes = Array.from(document.querySelectorAll('.rv-change, .rv-change-block'));
  changes.forEach((el, i) => el.setAttribute('data-rv-num', String(i + 1)));

  // ─── TOOLTIP ────────────────────────────────────────────────
  const tooltip = document.createElement('div');
  tooltip.className = 'rv-tooltip';
  document.body.appendChild(tooltip);

  function showTooltip(el) {
    const orig = el.getAttribute('data-rv-original') || '';
    const reason = el.getAttribute('data-rv-reason') || '';
    if (!orig && !reason) return;
    tooltip.innerHTML = `
      ${orig ? `<span class="rv-tooltip-label">Original wording</span><div class="rv-tooltip-original">${orig}</div>` : ''}
      ${reason ? `<span class="rv-tooltip-label">Why changed</span><div class="rv-tooltip-reason">${reason}</div>` : ''}
    `;
    const rect = el.getBoundingClientRect();
    let top = rect.bottom + 8;
    let left = rect.left;
    // Keep within viewport
    const tipWidth = 420;
    if (left + tipWidth > window.innerWidth - 20) left = window.innerWidth - tipWidth - 20;
    if (top + 200 > window.innerHeight) top = rect.top - 200;
    tooltip.style.top = top + 'px';
    tooltip.style.left = Math.max(20, left) + 'px';
    tooltip.classList.add('rv-visible');
  }
  function hideTooltip() {
    tooltip.classList.remove('rv-visible');
  }
  changes.forEach((el) => {
    el.addEventListener('mouseenter', () => showTooltip(el));
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('focus', () => showTooltip(el));
    el.addEventListener('blur', hideTooltip);
  });

  // ─── PANEL ──────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'rv-panel';
  const items = changes.map((el, i) => {
    const reason = (el.getAttribute('data-rv-reason') || '').slice(0, 90);
    const short = reason || (el.textContent || '').trim().slice(0, 70);
    return `<div class="rv-change-item" data-rv-target="${i + 1}">
      <span class="rv-change-item-num">#${i + 1}</span>${short}${short.length >= 70 ? '…' : ''}
    </div>`;
  }).join('');

  panel.innerHTML = `
    <div class="rv-panel-header" data-rv-toggle="panel">
      <span class="rv-panel-title">Changes on ${PAGE_TITLE}</span>
      <span style="display:flex;align-items:center;gap:10px;">
        <span class="rv-panel-count">${changes.length}</span>
        <button class="rv-panel-collapse" aria-label="Toggle panel"></button>
      </span>
    </div>
    <div class="rv-panel-body">
      ${items || '<div style="font-size:12px;color:#6B7280;">No changes applied on this page.</div>'}
      <div class="rv-toggle-row">
        <span class="rv-toggle-label">Show highlights</span>
        <div class="rv-switch" data-rv-toggle="highlights"></div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // Open by default if there are changes
  if (changes.length) panel.classList.add('rv-open');

  panel.querySelector('[data-rv-toggle="panel"]').addEventListener('click', () => {
    panel.classList.toggle('rv-open');
  });

  panel.querySelector('[data-rv-toggle="highlights"]').addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('rv-highlights-off');
  });

  // Jump-to-change from panel items
  panel.querySelectorAll('.rv-change-item').forEach((item) => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-rv-target'), 10) - 1;
      jumpTo(idx);
    });
  });

  // Next-change button
  let cursor = -1;
  function jumpTo(i) {
    if (i < 0 || i >= changes.length) return;
    cursor = i;
    const el = changes[i];
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'background 0.4s';
    const orig = el.style.background;
    el.style.background = 'rgba(229, 184, 96, 0.45)';
    setTimeout(() => { el.style.background = orig; }, 1200);
  }
  banner.querySelector('[data-rv-jump="next"]').addEventListener('click', () => {
    jumpTo((cursor + 1) % Math.max(1, changes.length));
  });

  // Keyboard: 'n' for next change
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'n' || e.key === 'N') {
      jumpTo((cursor + 1) % Math.max(1, changes.length));
    }
  });
})();
