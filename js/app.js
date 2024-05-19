document.addEventListener('DOMContentLoaded', (event) => {
    loadConfig();
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
    populateDropdowns();
    displayEntries();
    setDefaultDates();
    setCurrentGMTTime(); // Set the initial GMT time for entry-time
});

function updateTime() {
    const gmtTime = new Date().toUTCString().slice(17, 22).replace(':', '');
    const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    document.getElementById('gmt-time-value').innerText = gmtTime;
    document.getElementById('local-time-value').innerText = localTime;
    document.getElementById('current-date').innerText = currentDate;
}

function setCurrentGMTTime() {
    const gmtTime = new Date().toUTCString().slice(17, 22).replace(':', '');
    document.getElementById('entry-time').value = gmtTime;
}

function autoFillData() {
    updateSubmissionPlaceholder();
}

function updateSubmissionPlaceholder() {
    const level = document.getElementById('entry-level').value;
    let placeholder = "";
    if (level) {
        const config = JSON.parse(localStorage.getItem('config'));
        const selectedLevel = config.levels.find(lvl => lvl.prefix === level);
        if (selectedLevel) {
            placeholder = `${selectedLevel.prefix} `;
        }
    }
    document.getElementById('data-submission').placeholder = placeholder + "Enter data";
}

function generateUniqueID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function submitEntry() {
    const category = document.getElementById('event-category').value;
    const time = document.getElementById('entry-time').value;
    const user = document.getElementById('user-select').value;
    let data = document.getElementById('data-submission').value;
    const date = document.getElementById('entry-date').value;
    const level = document.getElementById('entry-level').value;

    if (!category || !time || !user || !data || !date) {
        alert('Please fill in all entry details');
        return;
    }

    const config = JSON.parse(localStorage.getItem('config'));
    const selectedLevel = config.levels.find(lvl => lvl.prefix === level);

    if (selectedLevel) {
        data = `${selectedLevel.prefix} ${data.replace(/^\([^)]+\)\s*/, '')}`;
    }

    const id = generateUniqueID();
    const entry = { id, category, time, user, data, date, level };
    let log = JSON.parse(localStorage.getItem('log')) || [];
    log.push(entry);
    log = log.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('log', JSON.stringify(log));
    displayEntries();

    document.getElementById('event-category').value = '';
    document.getElementById('entry-time').value = '';
    document.getElementById('user-select').value = '';
    document.getElementById('data-submission').value = '';
    document.getElementById('entry-level').value = 'B';
    updateSubmissionPlaceholder();
    setCurrentGMTTime(); // Reset the entry-time to the current GMT time after submission
}

function openConfigPanel() {
    document.getElementById('config-panel').classList.remove('hidden');
    document.getElementById('wrapper').classList.add('blur');
    document.getElementById('header').classList.add('blur');
    document.getElementById('time-container').classList.add('blur');
    document.getElementById('data-container').classList.add('blur');
    document.getElementById('top-banner').classList.add('blur');
    document.getElementById('bottom-banner').classList.add('blur');
    document.getElementById('config-button').classList.add('blur');

    loadConfig();
}

function closeConfigPanel() {
    document.getElementById('config-panel').classList.add('hidden');
    document.getElementById('wrapper').classList.remove('blur');
    document.getElementById('header').classList.remove('blur');
    document.getElementById('time-container').classList.remove('blur');
    document.getElementById('data-container').classList.remove('blur');
    document.getElementById('top-banner').classList.remove('blur');
    document.getElementById('bottom-banner').classList.remove('blur');
    document.getElementById('config-button').classList.remove('blur');
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';
}

function loadConfig() {
    let config = localStorage.getItem('config');
    if (!config) {
        config = getDefaultConfig();
        saveConfig(config);
    } else {
        config = JSON.parse(config);
    }

    document.getElementById('app-title').innerText = `${config.appName} Unified Data Logging Platform`;
    document.getElementById('custom-logo-img').src = config.logo;
    document.getElementById('custom-favicon').href = config.favicon;

    const bannerLevel = config.bannerLevel || 'UNCONFIGURED';
    document.getElementById('banner-level-select').value = bannerLevel;
    updateBannerDisplay(bannerLevel);

    displayLevels();
    populateDropdowns();
    displayEntries();
    populateTables();
}

function getDefaultConfig() {
    return {
        appName: '',
        logo: 'images/logo.png',
        favicon: 'default-favicon.ico',
        bannerLevel: 'UNCONFIGURED',
        users: [],
        shifts: [],
        events: [],
        levels: []
    };
}

function saveConfig(config) {
    localStorage.setItem('config', JSON.stringify(config));
}

function updateAppName() {
    const appName = document.getElementById('app-name').value;
    let config = JSON.parse(localStorage.getItem('config'));
    config.appName = appName;
    saveConfig(config);
    document.getElementById('app-title').innerText = `${appName} Unified Data Logging Platform`;
}

function setCustomLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('custom-logo-img').src = e.target.result;
            let config = JSON.parse(localStorage.getItem('config'));
            config.logo = e.target.result;
            saveConfig(config);
        };
        reader.readAsDataURL(file);
    }
}

function setCustomFavicon(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('custom-favicon').href = e.target.result;
            let config = JSON.parse(localStorage.getItem('config'));
            config.favicon = e.target.result;
            saveConfig(config);
        };
        reader.readAsDataURL(file);
    }
}

function updateBannerLevel() {
    const bannerLevel = document.getElementById('banner-level-select').value;
    let config = JSON.parse(localStorage.getItem('config'));
    config.bannerLevel = bannerLevel;
    saveConfig(config);
    updateBannerDisplay(bannerLevel);
    populateDropdowns();
}

function updateBannerDisplay(bannerLevel) {
    let config = JSON.parse(localStorage.getItem('config'));
    const selectedLevel = config.levels.find(level => level.prefix === bannerLevel);
    if (selectedLevel) {
        document.getElementById('top-banner-text').textContent = `The maximum level to be stored on this medium is ${selectedLevel.name}`;
        document.getElementById('bottom-banner-text').textContent = `The maximum level to be stored on this medium is ${selectedLevel.name}`;
        document.getElementById('top-banner').style.backgroundColor = selectedLevel.color;
        document.getElementById('bottom-banner').style.backgroundColor = selectedLevel.color;
    }
}

function populateDropdowns() {
    let config = JSON.parse(localStorage.getItem('config'));
    const eventCategorySelect = document.getElementById('event-category');
    const userSelect = document.getElementById('user-select');
    const userShiftSelect = document.getElementById('user-shift');
    const editUserShiftSelect = document.getElementById('edit-user-shift');
    const editCategorySelect = document.getElementById('edit-category');
    const editUserSelect = document.getElementById('edit-user');
    const entryLevelSelect = document.getElementById('entry-level');
    const editLevelSelect = document.getElementById('edit-level');

    eventCategorySelect.innerHTML = '';
    userSelect.innerHTML = '';
    userShiftSelect.innerHTML = '';
    editUserShiftSelect.innerHTML = '';
    editCategorySelect.innerHTML = '';
    editUserSelect.innerHTML = '';
    entryLevelSelect.innerHTML = '';
    editLevelSelect.innerHTML = '';

    // Populate shifts dropdown
    config.shifts.forEach(shift => {
        const option = document.createElement('option');
        option.value = shift.name;
        option.innerText = shift.name;
        userShiftSelect.appendChild(option);
        editUserShiftSelect.appendChild(option.cloneNode(true));
    });

    // Populate users dropdown
    config.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.initials;
        option.innerText = user.name;
        userSelect.appendChild(option);
        editUserSelect.appendChild(option.cloneNode(true));
    });

    // Populate event categories dropdown
    config.events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.name;
        option.innerText = event.name;
        eventCategorySelect.appendChild(option);
        editCategorySelect.appendChild(option.cloneNode(true));
    });

    // Populate entry level dropdown based on banner level
    const bannerLevel = config.bannerLevel;
    config.levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.prefix;
        option.innerText = level.name;
        entryLevelSelect.appendChild(option);
        editLevelSelect.appendChild(option.cloneNode(true));
    });

    // Set default value to the highest available level
    if (config.levels.length > 0) {
        entryLevelSelect.value = config.levels[config.levels.length - 1].prefix;
    }
    updateSubmissionPlaceholder();
}

function addUser() {
    const userName = document.getElementById('user-name').value;
    const userInitials = document.getElementById('user-initials').value;
    const userShift = document.getElementById('user-shift').value;

    if (!userName || !userInitials || !userShift) {
        alert('Please fill in all user details');
        return;
    }

    let config = JSON.parse(localStorage.getItem('config'));
    config.users.push({ name: userName, initials: userInitials, shift: userShift });
    saveConfig(config);
    populateDropdowns();
    populateTables();
}

function addShift() {
    const shiftName = document.getElementById('shift-name').value;

    if (!shiftName) {
        alert('Please enter a shift name');
        return;
    }

    let config = JSON.parse(localStorage.getItem('config'));
    config.shifts.push({ name: shiftName });
    saveConfig(config);
    populateDropdowns();
    populateTables();
}

function addEvent() {
    const eventName = document.getElementById('event-name').value;
    const eventTemplate = document.getElementById('event-template').value;

    if (!eventName || !eventTemplate) {
        alert('Please fill in all event details');
        return;
    }

    let config = JSON.parse(localStorage.getItem('config'));
    config.events.push({ name: eventName, template: eventTemplate });
    saveConfig(config);
    populateDropdowns();
    populateTables();
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entry-date').value = today;
    document.getElementById('display-date').value = today;
}

function displayEntries() {
    const displayDate = document.getElementById('display-date').value;
    let log = JSON.parse(localStorage.getItem('log')) || [];
    log = log.filter(entry => entry.date === displayDate).sort((a, b) => a.time.localeCompare(b.time));
    const displayContent = document.querySelector('#display-content tbody');
    displayContent.innerHTML = '';

    log.forEach(entry => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', entry.id);
        row.innerHTML = `
            <td>${entry.category}</td>
            <td>${entry.time}</td>
            <td>${entry.user}</td>
            <td>${entry.data}</td>
            <td><button onclick="editEntry('${entry.id}')"><img src="images/edit.svg" alt="Edit" style="height: 25px;"></button></td>
        `;
        displayContent.appendChild(row);
    });
}

function editEntry(id) {
    let log = JSON.parse(localStorage.getItem('log')) || [];
    const entry = log.find(entry => entry.id === id);
    if (entry) {
        document.getElementById('edit-id').value = entry.id;
        document.getElementById('edit-date').value = entry.date;
        document.getElementById('edit-time').value = entry.time;
        document.getElementById('edit-category').value = entry.category;
        document.getElementById('edit-user').value = entry.user;
        document.getElementById('edit-data').value = entry.data;
        document.getElementById('edit-level').value = entry.level;

        openEditEntryPanel();
    }
}

function openEditEntryPanel() {
    document.getElementById('edit-entry-panel').classList.remove('hidden');
    blurBackground();
}

function closeEditEntryPanel() {
    document.getElementById('edit-entry-panel').classList.add('hidden');
    removeBlurBackground();
}

function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const category = document.getElementById('edit-category').value;
    const user = document.getElementById('edit-user').value;
    let data = document.getElementById('edit-data').value;
    const level = document.getElementById('edit-level').value;

    const config = JSON.parse(localStorage.getItem('config'));
    const selectedLevel = config.levels.find(lvl => lvl.prefix === level);

    if (selectedLevel) {
        data = `${selectedLevel.prefix} ${data.replace(/^\([^)]+\)\s*/, '')}`;
    }

    let log = JSON.parse(localStorage.getItem('log')) || [];
    const index = log.findIndex(entry => entry.id === id);
    if (index !== -1) {
        log[index] = { id, date, time, category, user, data, level };
        localStorage.setItem('log', JSON.stringify(log));
    }

    closeEditEntryPanel();
    displayEntries();
}

function deleteEntry() {
    const id = document.getElementById('edit-id').value;

    let log = JSON.parse(localStorage.getItem('log')) || [];
    log = log.filter(entry => entry.id !== id);
    localStorage.setItem('log', JSON.stringify(log));

    closeEditEntryPanel();
    displayEntries();
}

function populateTables() {
    let config = JSON.parse(localStorage.getItem('config'));

    const userTable = document.querySelector('#user-list tbody');
    userTable.innerHTML = '';
    config.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.initials}</td>
            <td>${user.shift}</td>
            <td><button onclick="editUser('${user.name}', '${user.initials}', '${user.shift}')"><img src="images/edit.svg" alt="Edit" style="height: 25px;"></button></td>
        `;
        userTable.appendChild(row);
    });

    const shiftTable = document.querySelector('#shift-list tbody');
    shiftTable.innerHTML = '';
    config.shifts.forEach(shift => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${shift.name}</td>
            <td><button onclick="editShift('${shift.name}')"><img src="images/edit.svg" alt="Edit" style="height: 25px;"></button></td>
        `;
        shiftTable.appendChild(row);
    });

    const eventTable = document.querySelector('#event-list tbody');
    eventTable.innerHTML = '';
    config.events.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${event.name}</td>
            <td>${event.template}</td>
            <td><button onclick="editEvent('${event.name}', '${event.template}')"><img src="images/edit.svg" alt="Edit" style="height: 25px;"></button></td>
        `;
        eventTable.appendChild(row);
    });
}

function editUser(name, initials, shift) {
    document.getElementById('edit-user-name').value = name;
    document.getElementById('edit-user-initials').value = initials;
    document.getElementById('edit-user-shift').value = shift;
    openEditUserPanel();
}

function editShift(name) {
    document.getElementById('edit-shift-name').value = name;
    openEditShiftPanel();
}

function editEvent(name, template) {
    document.getElementById('edit-event-name').value = name;
    document.getElementById('edit-event-template').value = template;
    openEditEventPanel();
}

function openEditUserPanel() {
    document.getElementById('edit-user-panel').classList.remove('hidden');
    blurBackground();
}

function closeUserEditPanel() {
    document.getElementById('edit-user-panel').classList.add('hidden');
    removeBlurBackground();
}

function saveUserEdit() {
    const name = document.getElementById('edit-user-name').value;
    const initials = document.getElementById('edit-user-initials').value;
    const shift = document.getElementById('edit-user-shift').value;

    let config = JSON.parse(localStorage.getItem('config'));
    const index = config.users.findIndex(user => user.name === name && user.initials === initials);
    if (index !== -1) {
        config.users[index] = { name, initials, shift };
        saveConfig(config);
    }

    closeUserEditPanel();
    populateTables();
}

function deleteUser() {
    const name = document.getElementById('edit-user-name').value;
    const initials = document.getElementById('edit-user-initials').value;

    let config = JSON.parse(localStorage.getItem('config'));
    config.users = config.users.filter(user => !(user.name === name && user.initials === initials));
    saveConfig(config);

    closeUserEditPanel();
    populateTables();
}

function openEditShiftPanel() {
    document.getElementById('edit-shift-panel').classList.remove('hidden');
    blurBackground();
}

function closeShiftEditPanel() {
    document.getElementById('edit-shift-panel').classList.add('hidden');
    removeBlurBackground();
}

function saveShiftEdit() {
    const name = document.getElementById('edit-shift-name').value;

    let config = JSON.parse(localStorage.getItem('config'));
    const index = config.shifts.findIndex(shift => shift.name === name);
    if (index !== -1) {
        config.shifts[index] = { name };
        saveConfig(config);
    }

    closeShiftEditPanel();
    populateTables();
}

function deleteShift() {
    const name = document.getElementById('edit-shift-name').value;

    let config = JSON.parse(localStorage.getItem('config'));
    config.shifts = config.shifts.filter(shift => shift.name !== name);
    saveConfig(config);

    closeShiftEditPanel();
    populateTables();
}

function openEditEventPanel() {
    document.getElementById('edit-event-panel').classList.remove('hidden');
    blurBackground();
}

function closeEventEditPanel() {
    document.getElementById('edit-event-panel').classList.add('hidden');
    removeBlurBackground();
}

function saveEventEdit() {
    const name = document.getElementById('edit-event-name').value;
    const template = document.getElementById('edit-event-template').value;

    let config = JSON.parse(localStorage.getItem('config'));
    const index = config.events.findIndex(event => event.name === name && event.template === template);
    if (index !== -1) {
        config.events[index] = { name, template };
        saveConfig(config);
    }

    closeEventEditPanel();
    populateTables();
}

function deleteEvent() {
    const name = document.getElementById('edit-event-name').value;
    const template = document.getElementById('edit-event-template').value;

    let config = JSON.parse(localStorage.getItem('config'));
    config.events = config.events.filter(event => !(event.name === name && event.template === template));
    saveConfig(config);

    closeEventEditPanel();
    populateTables();
}

function blurBackground() {
    document.getElementById('wrapper').classList.add('blur');
    document.getElementById('header').classList.add('blur');
    document.getElementById('time-container').classList.add('blur');
    document.getElementById('data-container').classList.add('blur');
    document.getElementById('top-banner').classList.add('blur');
    document.getElementById('bottom-banner').classList.add('blur');
    document.getElementById('config-button').classList.add('blur');
}

function removeBlurBackground() {
    document.getElementById('wrapper').classList.remove('blur');
    document.getElementById('header').classList.remove('blur');
    document.getElementById('time-container').classList.remove('blur');
    document.getElementById('data-container').classList.remove('blur');
    document.getElementById('top-banner').classList.remove('blur');
    document.getElementById('bottom-banner').classList.remove('blur');
    document.getElementById('config-button').classList.remove('blur');
}

function openPrintPreview() {
    const displayDate = document.getElementById('display-date').value;
    if (displayDate) {
        window.open(`print-preview.html?date=${displayDate}`, '_blank');
    } else {
        alert('Please select a date to display');
    }
}

function saveAndReload() {
    let config = JSON.parse(localStorage.getItem('config'));
    saveConfig(config);
    location.reload();
}

function downloadConfig() {
    let config = JSON.parse(localStorage.getItem('config'));
    const configString = JSON.stringify(config, null, 2);
    const blob = new Blob([configString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function uploadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            saveConfig(config);
            loadConfig();
            alert('Config uploaded successfully');
        } catch (error) {
            console.error('Error parsing uploaded config', error);
            alert('Failed to upload config. Please ensure it is a valid JSON file.');
        }
    };
    reader.readAsText(file);
}
