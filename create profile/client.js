/**
 * Matrimony Client Form — JavaScript
 * Features:
 *  - Populate all dropdowns from data
 *  - Live photo preview
 *  - Profile card preview modal
 *  - Download profile card as PNG (html2canvas)
 *  - Submit profile to localStorage → admin page
 *  - Toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ════════════════════════════════════════
     DATA
  ════════════════════════════════════════ */
  const DATA = {
    rasiData: {
      "Mesham":    ["Aswini", "Bharani", "Karthigai (1st Pada)"],
      "Rishabam":  ["Karthigai (2,3,4 Pada)", "Rohini", "Mirugasirisham (1,2 Pada)"],
      "Mithunam":  ["Mirugasirisham (3,4 Pada)", "Thiruvathirai", "Punarpoosam (1,2,3 Pada)"],
      "Kadagam":   ["Punarpoosam (4th Pada)", "Poosam", "Ayilyam"],
      "Simmam":    ["Magam", "Pooram", "Uthiram (1st Pada)"],
      "Kanni":     ["Uthiram (2,3,4 Pada)", "Hastham", "Chithirai (1,2 Pada)"],
      "Thulam":    ["Chithirai (3,4 Pada)", "Swathi", "Visakam (1,2,3 Pada)"],
      "Viruchigam":["Visakam (4th Pada)", "Anusham", "Kettai"],
      "Dhanusu":   ["Moolam", "Pooradam", "Uthiradam (1st Pada)"],
      "Magaram":   ["Uthiradam (2,3,4 Pada)", "Thiruvonam", "Avittam (1,2 Pada)"],
      "Kumbam":    ["Avittam (3,4 Pada)", "Sadayam", "Poorattadhi (1,2,3 Pada)"],
      "Meenam":    ["Poorattadhi (4th Pada)", "Uthirattadhi", "Revathi"]
    },
    doshamTypes: ["No Dosham","Sevvai Dosham","Naga Dosham","Kalathra Dosham","Rahu Dosham","Kethu Dosham","Pitru Dosham","Guru Chandal Dosham","Shani Dosham","Sarpa Dosham"],
    maritalStatus: ["Never Married","Divorced","Widow","Widower","Awaiting Divorce"],
    motherTongue: ["Tamil","Telugu","Malayalam","Kannada","Hindi","English","Urdu","Marathi","Bengali","Gujarati","Punjabi","Odia","Assamese","Others"],
    physicalStatus: ["Normal","Physically Challenged","Hearing Impaired","Speech Impaired","Visually Challenged","Differently Abled"],
    colors: ["Very Fair", "Fair", "Wheatish", "Medium", "Dark"],
    religions: ["Hindu","Muslim","Christian","Sikh","Jain","Buddhist","Zoroastrian","Jewish","Others","No Bar"],
    education: ["SSLC","HSC","Diploma","B.E","B.Tech","B.Sc","B.Com","BBA","BCA","BA","MBBS","BDS","B.Pharm","LLB","M.E","M.Tech","M.Sc","M.Com","MBA","MCA","MA","M.Pharm","MD","MS","M.Phil","PhD","Doctorate"],
    professions: ["Software Engineer","Developer","Tester","Data Analyst","Data Scientist","AI Engineer","DevOps Engineer","Government Employee","Teacher","Professor","Doctor","Dentist","Nurse","Pharmacist","Business Owner","Entrepreneur","Startup Founder","Trader","Civil Engineer","Mechanical Engineer","Electrical Engineer","CA","Accountant","Auditor","Banker","Lawyer","Architect","Police","Army","Farmer","Driver","Self Employed","Private Employee","Not Working"],
    locations: ["India","USA","UK","Canada","Australia","Singapore","UAE","Germany","France","Italy","Japan","New Zealand","Others"],
    statesByCountry: {
      "India": ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Others"],
      "USA": ["Alabama","Alaska","Arizona","California","Colorado","Florida","Georgia","Illinois","Michigan","New Jersey","New York","Ohio","Pennsylvania","Texas","Virginia","Washington","Others"],
      "UK": ["England","Scotland","Wales","Northern Ireland","Others"],
      "Canada": ["Alberta","British Columbia","Manitoba","Ontario","Quebec","Saskatchewan","Others"],
      "Australia": ["New South Wales","Queensland","South Australia","Tasmania","Victoria","Western Australia","Others"],
      "Singapore": ["Central","East","North","North-East","West","Others"],
      "UAE": ["Abu Dhabi","Dubai","Sharjah","Ajman","Fujairah","Ras Al Khaimah","Umm Al Quwain"],
      "Germany": ["Bavaria","Berlin","Hamburg","Hesse","Lower Saxony","North Rhine-Westphalia","Others"],
      "Others": ["Other"]
    },
    castes: {
      "Hindu":     ["Brahmin","Mudaliyar","Vanniyar","Thevar","Nadar","Chettiar","Gounder","Naidu","Pillai","Yadava","SC","ST","Others"],
      "Muslim":    ["Sunni","Shia","Rowther","Labbai","Maraikayar","Others"],
      "Christian": ["Roman Catholic","CSI","Pentecostal","Protestant","Others"],
      "Sikh":      ["Jatt","Khatri","Arora","Others"],
      "Jain":      ["Digambar","Shvetambara","Others"]
    }
  };

  /* ════════════════════════════════════════
     POPULATE DROPDOWNS
  ════════════════════════════════════════ */
  const populate = (id, items) => {
    const el = document.getElementById(id);
    if (!el) return;
    items.forEach(v => el.add(new Option(v, v)));
  };

  Object.keys(DATA.rasiData).forEach(r =>
    document.getElementById('reg-rasi').add(new Option(r, r))
  );

  document.getElementById('reg-rasi').addEventListener('change', function () {
    const star = document.getElementById('reg-natchathiram');
    star.innerHTML = '<option value="">Select Natchathiram</option>';
    if (this.value) DATA.rasiData[this.value].forEach(s => star.add(new Option(s, s)));
  });

  populate('reg-dosham', DATA.doshamTypes);
  for (let h = 120; h <= 220; h++) document.getElementById('reg-height').add(new Option(`${h} cm`, `${h} cm`));
  populate('reg-weight', ["Below 40 Kg","40-50 Kg","51-60 Kg","61-70 Kg","71-80 Kg","81-90 Kg","91-100 Kg","Above 100 Kg"]);
  populate('reg-marital', DATA.maritalStatus);
  populate('reg-language', DATA.motherTongue);
  populate('reg-physical', DATA.physicalStatus);
  populate('reg-color', DATA.colors);
  populate('reg-education', DATA.education);
  populate('reg-profession', DATA.professions);

  DATA.religions.forEach(r => document.getElementById('reg-religion').add(new Option(r, r)));
  document.getElementById('reg-religion').addEventListener('change', function () {
    const caste = document.getElementById('reg-caste');
    caste.innerHTML = '<option value="">Select Caste</option>';
    
    if (this.value === "No Bar") {
      caste.add(new Option("Not Applicable", "Not Applicable"));
      caste.value = "Not Applicable";
      caste.disabled = true;
    } else {
      caste.disabled = false;
      const list = DATA.castes[this.value] || ['Others'];
      list.forEach(c => caste.add(new Option(c, c)));
    }
  });

  /* ════════════════════════════════════════
     PHOTO PREVIEW
  ════════════════════════════════════════ */
  let photoBase64 = '';
  const fileInput = document.getElementById('client-photo');
  const previewImg = document.getElementById('photo-preview-img');
  const placeholder = document.getElementById('photo-placeholder');
  const cardPhoto = document.getElementById('card-photo');

  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Photo too large! Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      photoBase64 = e.target.result;
      previewImg.src = photoBase64;
      previewImg.style.display = 'block';
      placeholder.style.display = 'none';
      cardPhoto.src = photoBase64;
    };
    reader.readAsDataURL(file);
  });

  /* ════════════════════════════════════════
     HELPER FUNCTIONS
  ════════════════════════════════════════ */
  const g = id => (document.getElementById(id) || {}).value || '';
  const fmt = n => n ? parseInt(n).toLocaleString('en-IN') : '—';

  function getProfileData() {
    return {
      name:       g('client-name'),
      age:        g('client-age'),
      dob:        g('client-dob'),
      gender:     g('client-gender'),
      marital:    g('reg-marital'),
      height:     g('reg-height'),
      weight:     g('reg-weight'),
      physical:   g('reg-physical'),
      color:      g('reg-color'),
      language:   g('reg-language'),
      
      rasi:       g('reg-rasi'),
      natchathiram: g('reg-natchathiram'),
      star:       g('reg-natchathiram'),
      dosham:     g('reg-dosham'),
      gothram:    g('client-gothram'),

      religion:   g('reg-religion'),
      caste:      g('reg-caste'),
      subcaste:   g('client-subcaste'),

      education:  g('reg-education'),
      profession: g('reg-profession'),
      salary:     g('client-salary'),

      father:     g('client-father'),
      mother:     g('client-mother'),
      siblings:   g('client-siblings'),
      familytype: g('client-familytype'),

      phone:      g('client-phone'),
      email:      g('client-email'),
      nativePlace: g('client-native'),
      currentPlace: g('client-current'),
      location:   g('client-current'),
      
      about:      g('client-about'),
      photo:      photoBase64
    };
  }

  /* ════════════════════════════════════════
     POPULATE PROFILE CARD
  ════════════════════════════════════════ */
  function fillCard(data) {
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };

    cardPhoto.src = data.photo || '';
    cardPhoto.style.background = data.photo ? 'transparent' : '#fce4ec';

    setTxt('card-name', data.name);

    setTxt('cd-age',       data.age ? `${data.age} yrs` : '—');
    setTxt('cd-gender',    data.gender);
    setTxt('cd-height',    data.height);
    setTxt('cd-weight',    data.weight);
    setTxt('cd-marital',   data.marital);
    setTxt('cd-lang',      data.language);
    setTxt('cd-rasi',      data.rasi);
    setTxt('cd-star',      data.natchathiram);
    setTxt('cd-religion',  data.religion);
    setTxt('cd-caste',     data.caste);
    setTxt('cd-edu',       data.education);
    setTxt('cd-profession',data.profession);
    setTxt('cd-salary',    data.salary ? `₹${fmt(data.salary)} /mo` : '—');
    setTxt('cd-native',    data.nativePlace || '—');
    setTxt('cd-current',   data.currentPlace || '—');
    setTxt('cd-color',     data.color || '—');

    // update tagline: Profession • Current Place
    document.getElementById('card-tagline').textContent =
      [data.profession, data.currentPlace].filter(Boolean).join(' • ') || '—';

    const aboutEl = document.getElementById('cd-about');
    aboutEl.textContent = data.about || 'No bio provided.';

    document.getElementById('cd-phone').textContent  = data.phone  ? `📞 ${data.phone}`  : '📞 —';
    document.getElementById('cd-email').textContent  = data.email  ? `✉️ ${data.email}`  : '✉️ —';
  }

  /* ════════════════════════════════════════
     MODAL OPEN / CLOSE
  ════════════════════════════════════════ */
  const overlay = document.getElementById('modal-overlay');

  function openModal(data) {
    fillCard(data);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ════════════════════════════════════════
     DIRECT DOWNLOAD AS PNG (no modal)
  ════════════════════════════════════════ */
  async function captureCardAsPng(data) {
    fillCard(data);
    const original = document.getElementById('profile-card');
    const clone = original.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:480px;opacity:1;visibility:visible;pointer-events:none;z-index:-9999';
    document.body.appendChild(clone);
    await new Promise(r => setTimeout(r, 180));
    try {
      const canvas = await html2canvas(clone, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#fff5f8', logging: false, width: clone.offsetWidth, height: clone.offsetHeight });
      return canvas;
    } finally {
      document.body.removeChild(clone);
    }
  }

  document.getElementById('direct-download-btn').addEventListener('click', async () => {
    const data = getProfileData();
    if (!data.name) { showToast('⚠️ Please enter your Full Name before downloading.'); return; }
    if (!data.photo) { showToast('⚠️ Please upload a profile photo before downloading.'); return; }

    const btn = document.getElementById('direct-download-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span style="animation:spin 1s linear infinite;display:inline-block">⏳</span> Generating PNG...';
    btn.disabled = true;

    try {
      const canvas = await captureCardAsPng(data);
      const link = document.createElement('a');
      const nameSlug = (data.name || 'profile').replace(/\s+/g, '_').toLowerCase();
      link.download = `matrimony_${nameSlug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('✅ Profile card downloaded successfully!');
    } catch (err) {
      console.error('PNG capture error:', err);
      showToast('❌ Download failed — ' + (err.message || 'unknown error'));
    } finally {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  });

  /* ════════════════════════════════════════
     DOWNLOAD AS PNG from modal button
  ════════════════════════════════════════ */
  document.getElementById('download-png-btn').addEventListener('click', async () => {
    const btn = document.getElementById('download-png-btn');
    const originalHTML = btn.innerHTML;
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;
    try {
      const canvas = await captureCardAsPng(getProfileData());
      const link = document.createElement('a');
      const nameSlug = (g('client-name') || 'profile').replace(/\s+/g, '_').toLowerCase();
      link.download = `matrimony_${nameSlug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('✅ Profile card downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('❌ Download failed. Please try again.');
    } finally {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  });

  /* ════════════════════════════════════════
     SUBMIT — save to localStorage + redirect
  ════════════════════════════════════════ */
  document.getElementById('profile-reg-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!photoBase64) { showToast('⚠️ Please upload a profile photo.'); return; }
    const data = getProfileData();
    localStorage.setItem('pendingProfile', JSON.stringify(data));
    showToast('✅ Profile sent to Admin for approval!');
    setTimeout(() => { window.location.href = 'admin.html'; }, 1500);
  });

  document.getElementById('submit-from-modal-btn').addEventListener('click', () => {
    const data = getProfileData();
    if (!photoBase64) { showToast('⚠️ Please upload a profile photo first.'); closeModal(); return; }
    localStorage.setItem('pendingProfile', JSON.stringify(data));
    showToast('✅ Profile sent to Admin!');
    setTimeout(() => { window.location.href = 'admin.html'; }, 1500);
    closeModal();
  });

  /* ════════════════════════════════════════
     TOAST NOTIFICATION
  ════════════════════════════════════════ */
  let toastTimer;
  function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  /* ════════════════════════════════════════
     DRAG & DROP PHOTO
  ════════════════════════════════════════ */
  const dropZone = document.getElementById('photo-preview-wrap');
  ['dragenter','dragover'].forEach(evt =>
    dropZone.addEventListener(evt, e => { e.preventDefault(); dropZone.style.borderColor = '#c2185b'; })
  );
  ['dragleave','drop'].forEach(evt =>
    dropZone.addEventListener(evt, () => { dropZone.style.borderColor = ''; })
  );
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
  dropZone.addEventListener('click', () => fileInput.click());

});