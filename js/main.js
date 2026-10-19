// ============================================================
// TURNIS — main.js
// ============================================================

// ---- CONFIGURAZIONE ----
// URL a cui inviare l'email raccolta (POST JSON: { email, source }).
// Esempi: endpoint Formspree/Web3Forms/Brevo oppure API di Turnis.
// L'email automatica di conferma va configurata lato servizio.
// Se vuoto, il form ripiega su un mailto verso CONTACT_EMAIL.
const SIGNUP_ENDPOINT = '';
const CONTACT_EMAIL = 'welcome@turnis.it';
// URL della privacy policy (se vuoto il link resta inattivo).
const PRIVACY_URL = '';

document.addEventListener('DOMContentLoaded', () => {

  // ---- Scroll reveal ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ---- Accordion ----
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const body = item.querySelector('.accordion-body');
    if (!trigger || !body) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-body').style.maxHeight = '';
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ---- Privacy links ----
  document.querySelectorAll('[data-privacy]').forEach(a => {
    if (PRIVACY_URL) {
      a.href = PRIVACY_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.addEventListener('click', e => e.preventDefault());
    }
  });

  // ---- Signup form ----
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.querySelectorAll('[data-signup]').forEach(form => {
    const msg = form.querySelector('.signup-msg');
    const btn = form.querySelector('.signup-btn');
    const source = form.closest('header') ? 'hero' : 'footer';

    const showError = (text) => { msg.textContent = text; msg.classList.add('error'); };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.classList.remove('error');

      // Honeypot: i bot compilano il campo nascosto.
      if (form.elements.website.value) return;

      const email = form.elements.email.value.trim();
      if (!EMAIL_RE.test(email)) return showError('Inserisci un indirizzo email valido.');
      if (!form.elements.consent.checked) return showError('Per continuare serve il tuo consenso al trattamento dell\'email.');

      // Nessun endpoint configurato: fallback su mailto.
      if (!SIGNUP_ENDPOINT) {
        const subject = encodeURIComponent('Onboarding Turnis');
        const body = encodeURIComponent([
          'Buongiorno Team Turnis,',
          'desidero esser ricontattato per esprimere il mio interesse a entrare a far parte della realtà di Turnis.',
          "Nella gestione dei team di lavoro, l'organizzazione dei turni rappresenta spesso una delle attività più complesse e dispendiose in termini di tempo. Sono interessato a scoprire la vostra soluzioni e i vantaggi di cui potrei trarre.",
          'Grazie e a presto.'
        ].join('\r\n'));
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
        return;
      }

      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Invio in corso…';
      try {
        const res = await fetch(SIGNUP_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email, source })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        document.querySelectorAll('[data-signup]').forEach(f => f.classList.add('is-done'));
      } catch (err) {
        showError('Qualcosa è andato storto. Riprova o scrivici a ' + CONTACT_EMAIL + '.');
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  });

});
