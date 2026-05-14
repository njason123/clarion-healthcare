/* ── Apply Modal — apply-modal.js ─────────────────────────────────── */
/* Supabase integration for Clarion Healthcare                         */

const SUPABASE_URL  = 'https://ttulhkwsewxtyskjxfwc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dWxoa3dzZXd4dHlza2p4ZndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NzU0OTcsImV4cCI6MjA5MTQ1MTQ5N30.-TT7xIKJBOSltMcR-e-aCarzBHUyznxFcuJGLcgjeos';

let _supabase;
function getClient() {
  if (!_supabase) _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  return _supabase;
}

/* ── Open / Close ──────────────────────────────────────────────── */
function openApplyModal() {
  const backdrop = document.getElementById('applyModalBackdrop');
  if (!backdrop) return;
  resetModalForm();
  document.body.classList.add('modal-open');
  backdrop.classList.add('open');
  setTimeout(() => {
    const first = backdrop.querySelector('input[type="radio"], button');
    if (first) first.focus();
  }, 350);
}

function closeApplyModal() {
  const backdrop = document.getElementById('applyModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  document.body.classList.remove('modal-open');
}

function resetModalForm() {
  /* Show gate, hide everything else */
  const gateView    = document.getElementById('applyGateView');
  const gateReject  = document.getElementById('applyGateReject');
  const formView    = document.getElementById('applyFormView');
  const successView = document.getElementById('applySuccessView');

  if (gateView)    { gateView.style.display    = 'block'; }
  if (gateReject)  { gateReject.style.display  = 'none';  }
  if (formView)    { formView.style.display     = 'none';  }
  if (successView) { successView.classList.remove('show'); }

  /* Reset radio buttons */
  document.querySelectorAll('input[name="gateRTW"], input[name="gateQual"]').forEach(r => {
    r.checked = false;
  });

  /* Clear gate error message */
  const gateErr = document.getElementById('gateError');
  if (gateErr) { gateErr.style.display = 'none'; gateErr.textContent = ''; }

  /* Reset form fields */
  ['m-firstName','m-lastName','m-email','m-phone','m-qual','m-avail','m-bio'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    el.classList.remove('error');
  });

  const cvZone  = document.getElementById('m-cvZone');
  const cvLabel = document.getElementById('m-cvLabel');
  const cvInput = document.getElementById('m-cvInput');
  if (cvZone)  cvZone.classList.remove('has-file');
  if (cvLabel) cvLabel.innerHTML = 'Click to upload <strong>.pdf, .doc, .docx</strong>';
  if (cvInput) cvInput.value = '';
}

/* ── Gate: check qualification answers ─────────────────────────── */
window.checkGateAnswers = function () {
  const rtwRadios  = document.querySelectorAll('input[name="gateRTW"]');
  const qualRadios = document.querySelectorAll('input[name="gateQual"]');

  const rtwVal  = [...rtwRadios].find(r => r.checked)?.value;
  const qualVal = [...qualRadios].find(r => r.checked)?.value;

  const gateErr = document.getElementById('gateError');

  /* Both questions must be answered */
  if (!rtwVal || !qualVal) {
    if (gateErr) {
      gateErr.textContent = 'Please answer both questions before continuing.';
      gateErr.style.display = 'flex';
    }
    return;
  }

  /* Clear any previous error */
  if (gateErr) gateErr.style.display = 'none';

  const gateView   = document.getElementById('applyGateView');
  const gateReject = document.getElementById('applyGateReject');
  const formView   = document.getElementById('applyFormView');

  /* Determine rejection reason */
  if (rtwVal === 'no') {
    /* Right to work failure */
    if (gateReject) {
      const msg = gateReject.querySelector('.gate-reject-msg');
      if (msg) msg.textContent = 'Unfortunately we are unable to process your application as you do not currently have the right to work in Ireland. Clarion Healthcare is not sponsoring work visas at this time.';
    }
    if (gateView)   gateView.style.display   = 'none';
    if (gateReject) gateReject.style.display = 'block';
    return;
  }

  if (qualVal === 'no') {
    /* Qualification failure */
    if (gateReject) {
      const msg = gateReject.querySelector('.gate-reject-msg');
      if (msg) msg.textContent = 'Thank you for your interest in Clarion Healthcare. Unfortunately, we require a relevant qualification from our accepted list to apply for this role. Please review the qualifications panel and get in touch if you have any questions.';
    }
    if (gateView)   gateView.style.display   = 'none';
    if (gateReject) gateReject.style.display = 'block';
    return;
  }

  /* Both Yes → show the full application form */
  if (gateView)  gateView.style.display  = 'none';
  if (formView)  formView.style.display  = 'block';

  /* Scroll form into view and focus first field */
  setTimeout(() => {
    const first = formView ? formView.querySelector('input, select, textarea') : null;
    if (first) first.focus();
  }, 100);
};

/* ── Gate: go back from rejection ──────────────────────────────── */
window.gateGoBack = function () {
  const gateView   = document.getElementById('applyGateView');
  const gateReject = document.getElementById('applyGateReject');
  if (gateReject) gateReject.style.display = 'none';
  if (gateView)   gateView.style.display   = 'block';
  /* Reset radio buttons */
  document.querySelectorAll('input[name="gateRTW"], input[name="gateQual"]').forEach(r => {
    r.checked = false;
  });
};

/* ── Wire up events ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  const backdrop = document.getElementById('applyModalBackdrop');
  const closeBtn = document.getElementById('applyModalClose');
  if (!backdrop) return;

  if (closeBtn) closeBtn.addEventListener('click', closeApplyModal);

  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeApplyModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) closeApplyModal();
  });

  const cvZone = document.getElementById('m-cvZone');
  if (cvZone) {
    cvZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      cvZone.style.borderColor = 'var(--green-500)';
    });
    cvZone.addEventListener('dragleave', function () {
      cvZone.style.borderColor = '';
    });
    cvZone.addEventListener('drop', function (e) {
      e.preventDefault();
      cvZone.style.borderColor = '';
      const files = e.dataTransfer.files;
      if (files.length) {
        try { document.getElementById('m-cvInput').files = files; } catch (_) {}
        handleModalCV({ files: files });
      }
    });
  }
});

/* ── CV upload preview ──────────────────────────────────────────── */
window.handleModalCV = function (input) {
  const zone  = document.getElementById('m-cvZone');
  const label = document.getElementById('m-cvLabel');
  const files = input.files || [];
  if (files.length) {
    if (zone)  zone.classList.add('has-file');
    if (label) label.innerHTML = '<span class="cv-file-name">' + files[0].name + '</span>';
  }
};

/* ── Form submission ─────────────────────────────────────────────── */
window.submitModalForm = async function () {
  const required = ['m-firstName','m-lastName','m-email','m-phone','m-qual','m-avail'];
  let valid = true;

  required.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('error');
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
  });

  const emailEl = document.getElementById('m-email');
  if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.classList.add('error'); valid = false;
  }

  if (!valid) return;

  /* Show loading */
  const btn = document.querySelector('.apply-submit-btn');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.style.opacity = '0.75';
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>&nbsp;Submitting...';

  try {
    const db = getClient();
    let cv_url = null;

    /* 1. Upload CV if provided */
    const cvInput = document.getElementById('m-cvInput');
    if (cvInput && cvInput.files && cvInput.files.length > 0) {
      const file     = cvInput.files[0];
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = Date.now() + '_' + safeName;

      const { error: uploadError } = await db.storage
        .from('cvs')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.warn('CV upload failed:', uploadError.message);
      } else {
        const { data: signed } = await db.storage
          .from('cvs')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);
        cv_url = signed ? signed.signedUrl : null;
      }
    }

    /* 2. Insert application row */
    const { error: insertError } = await db.from('applications').insert([{
      first_name:    document.getElementById('m-firstName').value.trim(),
      last_name:     document.getElementById('m-lastName').value.trim(),
      email:         document.getElementById('m-email').value.trim(),
      phone:         document.getElementById('m-phone').value.trim(),
      qualification: document.getElementById('m-qual').value,
      availability:  document.getElementById('m-avail').value,
      bio:           document.getElementById('m-bio').value.trim(),
      cv_url:        cv_url,
      submitted_at:  new Date().toISOString()
    }]);

    if (insertError) throw new Error(insertError.message);

    /* 3. Show success */
    const formView    = document.getElementById('applyFormView');
    const successView = document.getElementById('applySuccessView');
    if (formView)    formView.style.display = 'none';
    if (successView) successView.classList.add('show');

  } catch (err) {
    console.error('Submission error:', err);
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = originalHTML;
    alert('Something went wrong — please try again or email us at admin@clarionhc.com');
  }
};

window.openApplyModal  = openApplyModal;
window.closeApplyModal = closeApplyModal;

/* Spinner animation */
(function () {
  const s = document.createElement('style');
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
})();
