/**
 * Aktualisiert die auf der Seite angezeigte Uhrzeit und das Datum.
 * 
 * Die Funktion `updateClock` holt die aktuelle Uhrzeit und das aktuelle Datum,
 * formatiert diese Werte und zeigt sie in den HTML-Elementen mit den IDs 'clock' und 'date' an.
 * 
 * - Die Uhrzeit wird im Format HH:MM:SS angezeigt.
 * - Das Datum wird im Format "Wochentag, DD. Monat YYYY" angezeigt.
 * 
 * @example
 * // Angenommen, das aktuelle Datum und die aktuelle Uhrzeit sind der 3. Oktober 2023, 14:05:09
 * updateClock();
 * // Das Element mit der ID 'clock' zeigt: "14:05:09"
 * // Das Element mit der ID 'date' zeigt: "Di, 03. Oktober 2023"
 */
function updateClock() {
    const jetzt = new Date(); // Holt das aktuelle Datum und die aktuelle Uhrzeit
    const stunden = jetzt.getHours().toString().padStart(2, '0'); // Holt die Stunden und formatiert sie auf zwei Stellen
    const minuten = jetzt.getMinutes().toString().padStart(2, '0'); // Holt die Minuten und formatiert sie auf zwei Stellen
    const sekunden = jetzt.getSeconds().toString().padStart(2, '0'); // Holt die Sekunden und formatiert sie auf zwei Stellen
    const uhrzeitText = `${stunden}:${minuten}:${sekunden}`; // Formatiert die Uhrzeit als HH:MM:SS
    document.getElementById('clock').textContent = uhrzeitText; // Zeigt die Uhrzeit im HTML-Element mit der ID 'clock' an

    const wochentage = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]; // Array der Wochentage
    const wochentag = wochentage[jetzt.getDay()]; // Holt den aktuellen Wochentag
    const tag = jetzt.getDate().toString().padStart(2, '0'); // Holt den Tag des Monats und formatiert ihn auf zwei Stellen
    const monat = jetzt.toLocaleString('de-DE', { month: 'long' }); // Holt den aktuellen Monat als langen String auf Deutsch
    const jahr = jetzt.getFullYear(); // Holt das aktuelle Jahr
    const datumText = `${wochentag}, ${tag}. ${monat} ${jahr}`; // Formatiert das Datum als "Wochentag, DD. Monat YYYY"
    document.getElementById('date').textContent = datumText; // Zeigt das Datum im HTML-Element mit der ID 'date' an
}

setInterval(updateClock, 1000); // Aktualisiert die Uhrzeit jede Sekunde
window.onload = updateClock; // Aktualisiert die Uhrzeit, wenn die Seite geladen wird