document.addEventListener('DOMContentLoaded', (event) => {
    loadConfig();
    displayLevels();
    populateDropdowns();
});

let initialConfig;

function loadConfig() {
    let config;
    try {
        const configString = localStorage.getItem('config');
        if (configString) {
            config = JSON.parse(configString);
        } else {
            config = getDefaultConfig();
            saveConfig(config);
        }
    } catch (e) {
        console.error('Error parsing config from localStorage', e);
        config = getDefaultConfig();
        saveConfig(config);
    }

    document.getElementById('app-title').innerText = `${config.appName} Master Station Log`;
    document.getElementById('custom-logo-img').src = config.logo;
    document.getElementById('custom-favicon').href = config.favicon;

    displayLevels();
    populateDropdowns();
    updateBannerDisplay(config.bannerLevel);
}

function getDefaultConfig() {
    return {
        appName: '',
        logo: 'images/logo.png',
        favicon: 'default-favicon.ico',
        bannerLevel: '',
        users: [],
        shifts: [],
        events: [],
        levels: []
    };
}

function openConfigPanel() {
    try {
        initialConfig = JSON.parse(localStorage.getItem('config')); // Store the initial config when the panel is opened
    } catch (e) {
        console.error('Error parsing initial config from localStorage', e);
        initialConfig = getDefaultConfig();
    }

    document.getElementById('config-panel').classList.remove('hidden');
    document.getElementById('wrapper').classList.add('blur');
    document.getElementById('header').classList.add('blur');
    document.getElementById('time-container').classList.add('blur');
    document.getElementById('data-container').classList.add('blur');
    document.getElementById('top-banner').classList.add('blur');
    document.getElementById('bottom-banner').classList.add('blur');
    document.getElementById('config-button').classList.add('blur');
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

function saveConfig(config) {
    localStorage.setItem('config', JSON.stringify(config));
}

function addLevel() {
    let prefix = document.getElementById('level-prefix').value;
    const name = document.getElementById('level-name').value;
    const color = document.getElementById('level-color').value;

    if (!prefix || !name || !color) {
        alert('Please fill in all level details');
        return;
    }

    // Ensure prefix format
    if (!prefix.startsWith('(')) {
        prefix = '(' + prefix;
    }
    if (!prefix.endsWith(')')) {
        prefix = prefix + ')';
    }

    let config = JSON.parse(localStorage.getItem('config'));
    config.levels.push({ prefix, name, color });
    saveConfig(config);
    displayLevels();
    populateDropdowns();
    document.getElementById('level-prefix').value = '';
    document.getElementById('level-name').value = '';
    document.getElementById('level-color').value = '';
}

function displayLevels() {
    let config = JSON.parse(localStorage.getItem('config'));
    const levelList = document.getElementById('level-list');
    levelList.innerHTML = '';

    config.levels.forEach((level, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="text" value="${level.prefix}" data-index="${index}" onchange="editLevelPrefix(event)">
            <input type="text" value="${level.name}" data-index="${index}" onchange="editLevelName(event)">
            <input type="color" value="${level.color}" data-index="${index}" onchange="editLevelColor(event)">
            <button onclick="removeLevel(${index})">Remove</button>
        `;
        levelList.appendChild(li);
    });

    const bannerSelect = document.getElementById('banner-level-select');
    bannerSelect.innerHTML = '';
    config.levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.prefix;
        option.innerText = level.name;
        bannerSelect.appendChild(option);
    });
}

function editLevelPrefix(event) {
    const index = event.target.getAttribute('data-index');
    let config = JSON.parse(localStorage.getItem('config'));
    let prefix = event.target.value;

    // Ensure prefix format
    if (!prefix.startsWith('(')) {
        prefix = '(' + prefix;
    }
    if (!prefix.endsWith(')')) {
        prefix = prefix + ')';
    }

    config.levels[index].prefix = prefix;
    saveConfig(config);
    displayLevels();
    populateDropdowns();
}

function editLevelName(event) {
    const index = event.target.getAttribute('data-index');
    let config = JSON.parse(localStorage.getItem('config'));
    config.levels[index].name = event.target.value;
    saveConfig(config);
    displayLevels();
    populateDropdowns();
}

function editLevelColor(event) {
    const index = event.target.getAttribute('data-index');
    let config = JSON.parse(localStorage.getItem('config'));
    config.levels[index].color = event.target.value;
    saveConfig(config);
    displayLevels();
    populateDropdowns();
}

function removeLevel(index) {
    let config = JSON.parse(localStorage.getItem('config'));
    config.levels.splice(index, 1);
    saveConfig(config);
    displayLevels();
    populateDropdowns();
}

function populateDropdowns() {
    let config = JSON.parse(localStorage.getItem('config'));
    const entryLevelSelect = document.getElementById('entry-level');
    const editLevelSelect = document.getElementById('edit-level');
    entryLevelSelect.innerHTML = '';
    editLevelSelect.innerHTML = '';
    config.levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.prefix;
        option.innerText = level.name;
        entryLevelSelect.appendChild(option);
        editLevelSelect.appendChild(option.cloneNode(true));
    });

    if (config.levels.length > 0) {
        entryLevelSelect.value = config.levels[config.levels.length - 1].prefix;
    }
}

function updateBannerLevel() {
    const select = document.getElementById('banner-level-select');
    const selectedPrefix = select.value;
    let config = JSON.parse(localStorage.getItem('config'));
    config.bannerLevel = selectedPrefix;
    saveConfig(config);
    updateBannerDisplay(selectedPrefix);
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

function updateAppName() {
    const appName = document.getElementById('app-name').value;
    let config = JSON.parse(localStorage.getItem('config'));
    config.appName = appName;
    saveConfig(config);
    document.getElementById('app-title').innerText = `${appName} Master Station Log`;
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
