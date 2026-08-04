/**
 * Contact form for the RydeChain marketing site.
 *
 * Hands the message to the visitor's own mail client rather than posting it
 * anywhere. The site is static on Vercel and the API has no contact endpoint;
 * adding an unauthenticated one would mean an open, unrate-limited write path
 * on the same service that carries live trips, which is a poor trade for a
 * form that a mailto satisfies. The visitor also keeps a copy in their sent
 * folder, and replies land in a real inbox instead of a database nobody reads.
 *
 * If this ever needs to submit for real — attachments, tickets, an
 * auto-reply — it wants a POST endpoint with rate limiting and spam handling,
 * not a quiet upgrade of this file.
 */
(function () {
  'use strict';

  var TO = 'admin@arcaccra.org';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var alertBox = document.getElementById('formAlert');

  function say(kind, text) {
    if (!alertBox) return;
    alertBox.className = 'alert show ' + kind;
    alertBox.textContent = text;
  }

  function clearSay() {
    if (!alertBox) return;
    alertBox.className = 'alert';
    alertBox.textContent = '';
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function invalid(id, yes) {
    var el = document.getElementById(id);
    if (el) el.setAttribute('aria-invalid', yes ? 'true' : 'false');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearSay();

    var name = value('name');
    var email = value('email');
    var topic = value('topic');
    var message = value('message');

    // Checked here rather than left to `required`, so the message is one the
    // visitor can act on and every bad field is marked at once.
    var missing = [];
    invalid('name', !name);
    invalid('email', false);
    invalid('message', !message);
    if (!name) missing.push('your name');
    if (!email) {
      missing.push('your email address');
      invalid('email', true);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      invalid('email', true);
      say('err', 'That email address does not look right — we need a working one to reply to.');
      return;
    }
    if (!message) missing.push('a message');

    if (missing.length) {
      say('err', 'Please add ' + missing.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.');
      return;
    }

    var subject = 'RydeChain — ' + (topic || 'Website enquiry');
    var body = message + '\n\n—\n' + name + '\n' + email;

    // encodeURIComponent, not escape: names and messages carry apostrophes,
    // ampersands and newlines that would otherwise truncate the mailto.
    var href =
      'mailto:' + TO +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    say('ok', 'Opening your email app with the message ready. If nothing happens, write to ' + TO + ' directly.');
    window.location.href = href;
  });
})();
