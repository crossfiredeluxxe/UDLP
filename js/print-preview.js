// js/print-preview.js

function openPrintPreview() {
    const displayDate = document.getElementById('display-date').value;
    if (displayDate) {
        window.open(`print-preview.html?date=${displayDate}`, '_blank');
    } else {
        alert('Please select a date to display');
    }
}
