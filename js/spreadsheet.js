// spreadsheet.js

function generateSpreadsheet() {
    let config = JSON.parse(localStorage.getItem('config')) || {
        appName: '',
        logo: 'default-logo.png',
        favicon: 'default-favicon.ico',
        bannerLevel: 'UNCONFIGURED',
        users: [],
        shifts: [],
        events: []
    };

    let log = JSON.parse(localStorage.getItem('log')) || [];

    const workbook = XLSX.utils.book_new();

    // Users sheet
    const usersSheet = XLSX.utils.json_to_sheet(config.users);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');

    // Shifts sheet
    const shiftsSheet = XLSX.utils.json_to_sheet(config.shifts);
    XLSX.utils.book_append_sheet(workbook, shiftsSheet, 'Shifts');

    // Events sheet
    const eventsSheet = XLSX.utils.json_to_sheet(config.events);
    XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Events');

    // Log sheet
    const logSheet = XLSX.utils.json_to_sheet(log);
    XLSX.utils.book_append_sheet(workbook, logSheet, 'Log');

    return workbook;
}

function downloadSpreadsheet() {
    const workbook = generateSpreadsheet();
    XLSX.writeFile(workbook, 'master_station_log.xlsx');
}

function uploadSpreadsheet(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Users sheet
        const usersSheet = workbook.Sheets['Users'];
        const users = XLSX.utils.sheet_to_json(usersSheet);

        // Shifts sheet
        const shiftsSheet = workbook.Sheets['Shifts'];
        const shifts = XLSX.utils.sheet_to_json(shiftsSheet);

        // Events sheet
        const eventsSheet = workbook.Sheets['Events'];
        const events = XLSX.utils.sheet_to_json(eventsSheet);

        // Log sheet
        const logSheet = workbook.Sheets['Log'];
        const log = XLSX.utils.sheet_to_json(logSheet);

        // Save to localStorage
        const config = {
            appName: '',
            logo: 'default-logo.png',
            favicon: 'default-favicon.ico',
            bannerLevel: 'UNCONFIGURED',
            users,
            shifts,
            events
        };
        localStorage.setItem('config', JSON.stringify(config));
        localStorage.setItem('log', JSON.stringify(log));

        loadConfig();
        displayEntries();
        clearFileInput(event.target);
        alert('Spreadsheet uploaded successfully!');
    };
    reader.readAsArrayBuffer(file);
}

function downloadJSON() {
    const config = JSON.parse(localStorage.getItem('config')) || {};
    const log = JSON.parse(localStorage.getItem('log')) || [];

    const data = {
        config,
        log
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'master_station_log.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function uploadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);

        // Save to localStorage
        const { config, log } = data;
        localStorage.setItem('config', JSON.stringify(config));
        localStorage.setItem('log', JSON.stringify(log));

        loadConfig();
        displayEntries();
        clearFileInput(event.target);
        alert('JSON uploaded successfully!');
    };
    reader.readAsText(file);
}

function downloadCSV() {
    let config = JSON.parse(localStorage.getItem('config')) || {
        appName: '',
        logo: 'default-logo.png',
        favicon: 'default-favicon.ico',
        bannerLevel: 'UNCONFIGURED',
        users: [],
        shifts: [],
        events: []
    };

    let log = JSON.parse(localStorage.getItem('log')) || [];

    let csvContent = '';

    // Config data
    csvContent += 'Config\n';
    csvContent += 'App Name,Logo,Favicon,Banner Level\n';
    csvContent += `"${config.appName}","${config.logo}","${config.favicon}","${config.bannerLevel}"\n\n`;

    // Users data
    csvContent += 'Users\n';
    csvContent += 'Name,Initials,Shift\n';
    config.users.forEach(user => {
        csvContent += `"${user.name}","${user.initials}","${user.shift}"\n`;
    });
    csvContent += '\n';

    // Shifts data
    csvContent += 'Shifts\n';
    csvContent += 'Name\n';
    config.shifts.forEach(shift => {
        csvContent += `"${shift.name}"\n`;
    });
    csvContent += '\n';

    // Events data
    csvContent += 'Events\n';
    csvContent += 'Name,Template\n';
    config.events.forEach(event => {
        csvContent += `"${event.name}","${event.template}"\n`;
    });
    csvContent += '\n';

    // Log data
    csvContent += 'Log\n';
    csvContent += 'Category,Time,User,Data,Date\n';
    log.forEach(entry => {
        csvContent += `"${entry.category}","${entry.time}","${entry.user}","${entry.data}","${entry.date}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'master_station_log.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function uploadCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        const rows = data.split('\n').map(row => row.split(','));

        const config = {
            appName: rows[1][0].replace(/"/g, ''),
            logo: rows[1][1].replace(/"/g, ''),
            favicon: rows[1][2].replace(/"/g, ''),
            bannerLevel: rows[1][3].replace(/"/g, ''),
            users: [],
            shifts: [],
            events: []
        };

        let i = 4;
        while (rows[i][0] !== 'Shifts' && rows[i]) {
            config.users.push({
                name: rows[i][0].replace(/"/g, ''),
                initials: rows[i][1].replace(/"/g, ''),
                shift: rows[i][2].replace(/"/g, '')
            });
            i++;
        }

        i += 2;
        while (rows[i][0] !== 'Events' && rows[i]) {
            config.shifts.push({ name: rows[i][0].replace(/"/g, '') });
            i++;
        }

        i += 2;
        while (rows[i][0] !== 'Log' && rows[i]) {
            config.events.push({
                name: rows[i][0].replace(/"/g, ''),
                template: rows[i][1].replace(/"/g, '')
            });
            i++;
        }

        i += 2;
        const log = [];
        while (rows[i]) {
            log.push({
                category: rows[i][0].replace(/"/g, ''),
                time: rows[i][1].replace(/"/g, ''),
                user: rows[i][2].replace(/"/g, ''),
                data: rows[i][3].replace(/"/g, ''),
                date: rows[i][4].replace(/"/g, '')
            });
            i++;
        }

        // Save to localStorage
        localStorage.setItem('config', JSON.stringify(config));
        localStorage.setItem('log', JSON.stringify(log));

        loadConfig();
        displayEntries();
        clearFileInput(event.target);
        alert('CSV uploaded successfully!');
    };
    reader.readAsText(file);
}

function purgeData() {
    if (confirm('Are you sure you want to purge all running data from the session? This action cannot be undone.')) {
        localStorage.removeItem('config');
        localStorage.removeItem('log');
        loadConfig();
        displayEntries();
        alert('All running data has been purged.');
    }
}

function clearFileInput(input) {
    input.value = '';
}
