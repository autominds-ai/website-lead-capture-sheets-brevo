/*
 * Lead capture for static websites → Make.com webhook.
 * Validates the form, tags the lead source, cleans the phone number and posts JSON.
 *
 * Config:
 *   WEBHOOK_URL     your Make.com custom webhook (leave '' to log to console only)
 *   DEFAULT_COUNTRY dialling code used when a number is entered without one
 */
(function () {
  var WEBHOOK_URL = '';          // e.g. 'https://hook.eu1.make.com/xxxxxxxx'
  var DEFAULT_COUNTRY = '234';    // Nigeria. Use '1' for US, '44' for UK, '971' for UAE.

  // 1. Remember where the visitor came from: ?src=flyer-lekki
  var params = new URLSearchParams(window.location.search);
  var leadSource = 'direct';
  try {
    var fromLink = params.get('src');
    if (fromLink) localStorage.setItem('lead_src', fromLink);
    leadSource = fromLink || localStorage.getItem('lead_src') || 'direct';
  } catch (e) { /* storage blocked: keep 'direct' */ }
  leadSource = String(leadSource).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'direct';

  // 2. Pre-select the business type: ?biz=real-estate
  var biz = params.get('biz');
  var bizSelect = document.getElementById('business');
  if (biz && bizSelect) {
    Array.prototype.forEach.call(bizSelect.options, function (o) {
      if (o.value === biz) bizSelect.value = biz;
    });
  }

  // 3. Normalise phone numbers to international digits (no +)
  function cleanPhone(raw) {
    var d = String(raw).replace(/[^0-9]/g, '');
    if (d.indexOf(DEFAULT_COUNTRY + '0') === 0) return DEFAULT_COUNTRY + d.slice(DEFAULT_COUNTRY.length + 1);
    if (d.indexOf(DEFAULT_COUNTRY) === 0) return d;
    if (d.charAt(0) === '0') return DEFAULT_COUNTRY + d.slice(1);
    return DEFAULT_COUNTRY + d;
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // 4. Validate and send
  function submitLead(event) {
    if (event) event.preventDefault();
    var lead = {
      name: value('name'),
      phone: value('phone'),
      email: value('email'),
      business: value('business'),
      challenge: value('challenge')
    };
    if (!lead.name || !lead.phone || !lead.email || !lead.business || !lead.challenge) {
      alert('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    lead.phone_clean = cleanPhone(lead.phone);
    lead.source = leadSource;
    lead.page = window.location.pathname;
    lead.timestamp = new Date().toISOString();

    if (!WEBHOOK_URL) {
      console.log('[demo] lead payload:', lead);
    } else {
      // text/plain avoids a CORS preflight, so this works from any static host.
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(lead)
      }).catch(function (err) { console.log('Webhook error:', err); });
    }

    document.getElementById('form-content').style.display = 'none';
    document.getElementById('success-state').style.display = 'block';
  }

  var form = document.getElementById('lead-form');
  if (form) form.addEventListener('submit', submitLead);
})();
