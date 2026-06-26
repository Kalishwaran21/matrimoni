document.addEventListener('DOMContentLoaded', () => {
    // Dropdowns options data structures mirror sync loader
    const matrimonyOptions = {
        "rasiData": {
            "Mesham": ["Aswini", "Bharani", "Karthigai (1st Pada)"], "Rishabam": ["Karthigai (2,3,4 Pada)", "Rohini", "Mirugasirisham (1,2 Pada)"],
            "Mithunam": ["Mirugasirisham (3,4 Pada)", "Thiruvathirai", "Punarpoosam (1,2,3 Pada)"], "Kadagam": ["Punarpoosam (4th Pada)", "Poosam", "Ayilyam"],
            "Simmam": ["Magam", "Pooram", "Uthiram (1st Pada)"], "Kanni": ["Uthiram (2,3,4 Pada)", "Hastham", "Chithirai (1,2 Pada)"],
            "Thulam": ["Chithirai (3,4 Pada)", "Swathi", "Visakam (1,2,3 Pada)"], "Viruchigam": ["Visakam (4th Pada)", "Anusham", "Kettai"],
            "Dhanusu": ["Moolam", "Pooradam", "Uthiradam (1st Pada)"], "Magaram": ["Uthiradam (2,3,4 Pada)", "Thiruvonam", "Avittam (1,2 Pada)"],
            "Kumbam": ["Avittam (3,4 Pada)", "Sadayam", "Poorattadhi (1,2,3 Pada)"], "Meenam": ["Poorattadhi (4th Pada)", "Uthirattadhi", "Revathi"]
        },
        "doshamTypes": ["No Dosham", "Sevvai Dosham", "Naga Dosham", "Kalathra Dosham", "Rahu Dosham", "Kethu Dosham", "Pitru Dosham", "Guru Chandal Dosham", "Shani Dosham", "Sarpa Dosham"],
        "maritalStatus": ["Never Married", "Divorced", "Widow", "Widower", "Awaiting Divorce"],
        "motherTongue": ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "English", "Urdu", "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Assamese", "Others"],
        "physicalStatus": ["Normal", "Physically Challenged", "Hearing Impaired", "Speech Impaired", "Visually Challenged", "Differently Abled"],
        "religions": ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Zoroastrian", "Jewish", "Others"],
        "education": ["SSLC", "HSC", "Diploma", "B.E", "B.Tech", "B.Sc", "B.Com", "BBA", "BCA", "BA", "MBBS", "BDS", "B.Pharm", "LLB", "M.E", "M.Tech", "M.Sc", "M.Com", "MBA", "MCA", "MA", "M.Pharm", "MD", "MS", "M.Phil", "PhD", "Doctorate"],
        "professions": ["Software Engineer", "Developer", "Tester", "Data Analyst", "Data Scientist", "AI Engineer", "DevOps Engineer", "Government Employee", "Teacher", "Professor", "Doctor", "Dentist", "Nurse", "Pharmacist", "Business Owner", "Entrepreneur", "Startup Founder", "Trader", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "CA", "Accountant", "Auditor", "Banker", "Lawyer", "Architect", "Police", "Army", "Farmer", "Driver", "Self Employed", "Private Employee", "Not Working"],
        "locations": ["India", "USA", "UK", "Canada", "Australia", "Singapore", "UAE"],
        "castes": {
            "Hindu": ["Brahmin", "Mudaliyar", "Vanniyar", "Thevar", "Nadar", "Chettiar", "Gounder", "Naidu", "Pillai", "Yadava", "SC", "ST", "Others"],
            "Muslim": ["Sunni", "Shia", "Rowther", "Labbai", "Maraikayar", "Others"],
            "Christian": ["Roman Catholic", "CSI", "Pentecostal", "Protestant", "Others"]
        }
    };

    // Populate Filters
    const rasi = document.getElementById('rasi-select'); const star = document.getElementById('natchathiram-select');
    const religion = document.getElementById('religion-select'); const caste = document.getElementById('caste-select');

    for (let r in matrimonyOptions.rasiData) { rasi.add(new Option(r, r)); }
    rasi.addEventListener('change', () => {
        star.innerHTML = '<option value="">Select Natchathiram</option>';
        if(rasi.value) matrimonyOptions.rasiData[rasi.value].forEach(s => star.add(new Option(s,s)));
    });
    matrimonyOptions.doshamTypes.forEach(d => document.getElementById('dosham-select').add(new Option(d,d)));
    for (let h = 120; h <= 220; h++) { document.getElementById('height-select').add(new Option(`${h} cm`, h)); }
    ["Below 40 Kg", "40-50 Kg", "51-60 Kg", "61-70 Kg", "71-80 Kg", "81-90 Kg", "91-100 Kg", "Above 100 Kg"].forEach(w => document.getElementById('weight-select').add(new Option(w,w)));
    matrimonyOptions.maritalStatus.forEach(m => document.getElementById('marital-select').add(new Option(m,m)));
    matrimonyOptions.motherTongue.forEach(l => document.getElementById('language-select').add(new Option(l,l)));
    matrimonyOptions.physicalStatus.forEach(p => document.getElementById('physical-select').add(new Option(p,p)));
    matrimonyOptions.religions.forEach(r => religion.add(new Option(r,r)));
    religion.addEventListener('change', () => {
        caste.innerHTML = '<option value="">Select Caste</option>';
        if(religion.value && matrimonyOptions.castes[religion.value]) matrimonyOptions.castes[religion.value].forEach(c => caste.add(new Option(c,c)));
    });
    matrimonyOptions.education.forEach(e => document.getElementById('education-select').add(new Option(e,e)));
    matrimonyOptions.professions.forEach(p => document.getElementById('profession-select').add(new Option(p,p)));
    matrimonyOptions.locations.forEach(l => document.getElementById('location-select').add(new Option(l,l)));

    // Render Approved Profiles inside DOM Grid Layout Engine
    const masterGrid = document.getElementById('master-profile-grid');
    const approvedProfiles = JSON.parse(localStorage.getItem('approvedProfiles')) || [];

    approvedProfiles.forEach(p => {
        const cardHtml = `
            <div class="profile-card">
                <div class="profile-image"><img src="${p.photo}" alt="Profile Photo"></div>
                <div class="profile-details">
                    <h3>${p.name} (${p.age})</h3>
                    <p><strong>Religion/Caste:</strong> ${p.religion}, ${p.caste}</p>
                    <p><strong>Edu & Profession:</strong> ${p.education}, ${p.profession}</p>
                    <p><strong>Location & Income:</strong> ${p.currentPlace} | ₹${p.salary} /Yr</p>
                    <p><strong>Status & Habits:</strong> ${p.marital} | Normal</p>
                    <p><strong>Astro Info:</strong> ${p.rasi}, ${p.natchathiram} | ${p.dosham}</p>
                    <p><strong>Physique:</strong> ${p.height} cm | ${p.weight} | ${p.physical}</p>
                    <button class="interest-btn">Interested</button>
                </div>
            </div>
        `;
        masterGrid.insertAdjacentHTML('afterbegin', cardHtml);
    });

    // Flipkart Sliders Execution
    function setupDoubleSlider(minId, maxId, trackId, minValId, maxValId, isSal) {
        const minIn = document.getElementById(minId); const maxIn = document.getElementById(maxId);
        const tr = document.getElementById(trackId); const minV = document.getElementById(minValId); const maxV = document.getElementById(maxValId);

        function update() {
            let v1 = parseInt(minIn.value); let v2 = parseInt(maxIn.value);
            let mn = parseInt(minIn.min); let mx = parseInt(minIn.max);
            if (v1 > v2) { let t = v1; v1 = v2; v2 = t; }
            const p1 = ((v1 - mn) / (mx - mn)) * 100; const p2 = ((v2 - mn) / (mx - mn)) * 100;
            tr.style.background = `linear-gradient(to right, #e2e8f0 ${p1}%, #d81b60 ${p1}%, #d81b60 ${p2}%, #e2e8f0 ${p2}%)`;
            minV.textContent = isSal ? `₹${(minIn.value/100000).toFixed(0)} L` : `${minIn.value} Yrs`;
            maxV.textContent = isSal ? `₹${(maxIn.value/100000).toFixed(0)} L` : `${maxIn.value} Yrs`;
        }
        minIn.addEventListener('input', update); maxIn.addEventListener('input', update); update();
    }
    setupDoubleSlider('age-min-input', 'age-max-input', 'age-track', 'age-min-val', 'age-max-val', false);
    setupDoubleSlider('salary-min-input', 'salary-max-input', 'salary-track', 'salary-min-val', 'salary-max-val', true);

    // Global Interest button click trigger link
    document.body.addEventListener('click', (e) => {
        if(e.target.classList.contains('interest-btn')) {
            e.target.classList.toggle('clicked');
            e.target.textContent = e.target.classList.contains('clicked') ? '✓ Interested' : 'Interested';
        }
    });
});