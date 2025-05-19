/**
 * Updates the displayed time and date on the page.
 * 
 * The `updateClock` function retrieves the current time and date,
 * formats these values, and displays them in the HTML elements with IDs 'clock' and 'date'.
 * 
 * - Time is displayed in the format HH:MM:SS.
 * - Date is displayed in the format "Weekday, DD. Month YYYY".
 * 
 * @example
 * // Assuming the current date and time are October 3, 2023, 14:05:09
 * updateClock();
 * // The element with ID 'clock' shows: "14:05:09"
 * // The element with ID 'date' shows: "Di, 03. Oktober 2023"
 */
function updateClock() {
    const jetzt = new Date(); // Gets the current date and time
    const stunden = jetzt.getHours().toString().padStart(2, '0'); // Gets hours and formats to two digits
    const minuten = jetzt.getMinutes().toString().padStart(2, '0'); // Gets minutes and formats to two digits
    const sekunden = jetzt.getSeconds().toString().padStart(2, '0'); // Gets seconds and formats to two digits
    const uhrzeitText = `${stunden}:${minuten}:${sekunden}`; // Formats time as HH:MM:SS
    document.getElementById('clock').textContent = uhrzeitText; // Displays time in the HTML element with ID 'clock'

    const wochentage = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]; // Array of weekdays
    const wochentag = wochentage[jetzt.getDay()]; // Gets the current weekday
    const tag = jetzt.getDate().toString().padStart(2, '0'); // Gets the day of the month and formats to two digits
    const monat = jetzt.toLocaleString('de-DE', { month: 'long' }); // Gets the current month as a long string in German
    const jahr = jetzt.getFullYear(); // Gets the current year
    const datumText = `${wochentag}, ${tag}. ${monat} ${jahr}`; // Formats date as "Weekday, DD. Month YYYY"
    document.getElementById('date').textContent = datumText; // Displays date in the HTML element with ID 'date'
}

setInterval(updateClock, 1000); // Updates the time every second
window.onload = updateClock; // Updates the time when the page loads