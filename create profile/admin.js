document.addEventListener('DOMContentLoaded', () => {
    const pendingData = localStorage.getItem('pendingProfile');
    const noProfileMsg = document.getElementById('no-profile-msg');
    const profileSheet = document.getElementById('profile-sheet');

    if (!pendingData) {
        noProfileMsg.classList.remove('hidden');
        profileSheet.classList.add('hidden');
        return;
    }

    noProfileMsg.classList.add('hidden');
    profileSheet.classList.remove('hidden');

    const profile = JSON.parse(pendingData);

    // Populate data to template view layout
    document.getElementById('admin-preview-img').src = profile.photo;
    document.getElementById('adm-display-name').textContent = `${profile.name} (${profile.age})`;
    document.getElementById('adm-age').textContent = profile.age;
    document.getElementById('adm-rel-caste').textContent = `${profile.religion}, ${profile.caste}`;
    document.getElementById('adm-edu-prof').textContent = `${profile.education}, ${profile.profession}`;
    document.getElementById('adm-loc-sal').textContent = `${profile.currentPlace} | ₹${profile.salary} /Yr`;
    document.getElementById('adm-astro').textContent = `${profile.rasi}, ${profile.natchathiram} | ${profile.dosham}`;
    document.getElementById('adm-physique').textContent = `${profile.height} cm | ${profile.weight} | ${profile.physical}`;

    document.getElementById('admin-board-btn').addEventListener('click', () => {
        // Fetch existing approved array or create empty list array
        let approvedProfiles = JSON.parse(localStorage.getItem('approvedProfiles')) || [];
        approvedProfiles.unshift(profile); // Add latest to top position

        localStorage.setItem('approvedProfiles', JSON.stringify(approvedProfiles));
        localStorage.removeItem('pendingProfile'); // Clear form cache pool

        alert('Profile onboarding accepted! Moving to Live Dashboard Feed.');
        window.location.href = 'dashboard.html';
    });
});