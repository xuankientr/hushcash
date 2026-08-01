/* HushCash Plug v1.0 — https://hushcash.xyz/plug */
(function () {
  'use strict';

  var BASE = 'https://hushcash.xyz';

  function openHushPay(opts) {
    var to = (opts.to || '').trim();
    if (!to) { console.warn('[HushPay] Missing required option: to'); return; }

    var params = 'to=' + encodeURIComponent(to);
    if (opts.amount) params += '&amount=' + encodeURIComponent(opts.amount);
    if (opts.note)   params += '&note='   + encodeURIComponent(opts.note);

    var w = 420, h = 620;
    var left = Math.round(Math.max(0, (screen.width  - w) / 2));
    var top  = Math.round(Math.max(0, (screen.height - h) / 2));
    var features = [
      'width='   + w,
      'height='  + h,
      'left='    + left,
      'top='     + top,
      'toolbar=no',
      'location=no',
      'status=no',
      'menubar=no',
      'resizable=no',
      'scrollbars=yes',
    ].join(',');

    var popup = window.open(BASE + '/plug/pay?' + params, 'hushpay', features);
    if (!popup) {
      console.warn('[HushPay] Popup was blocked. Please allow popups for this site.');
      return;
    }

    function onMessage(e) {
      if (e.origin !== BASE) return;
      if (e.data && e.data.type === 'hushpay:success') {
        window.removeEventListener('message', onMessage);
        if (typeof opts.onSuccess === 'function') opts.onSuccess(e.data);
      }
    }
    window.addEventListener('message', onMessage);

    var poll = setInterval(function () {
      if (!popup || popup.closed) {
        clearInterval(poll);
        window.removeEventListener('message', onMessage);
      }
    }, 500);
  }

  // Public API
  window.HushPay = { open: openHushPay };

  // Auto-wire buttons with data-hushpay-to attribute
  function wireButtons() {
    var buttons = document.querySelectorAll('[data-hushpay-to]');
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        if (btn.__hushpay) return;
        btn.__hushpay = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          openHushPay({
            to:        btn.getAttribute('data-hushpay-to') || '',
            amount:    btn.getAttribute('data-hushpay-amount') || '',
            note:      btn.getAttribute('data-hushpay-note') || '',
            onSuccess: null,
          });
        });
      })(buttons[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }
})();
