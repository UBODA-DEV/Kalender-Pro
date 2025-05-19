// Global variables to store selected date and time slot
let selectedDate = null;
let selectedTimeSlot = null;

// Function to update the displayed time and date
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeText = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = timeText;

    const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    const weekday = weekdays[now.getDay()];
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('de-DE', { month: 'long' });
    const year = now.getFullYear();
    const dateText = `${weekday}, ${day}. ${month} ${year}`;
    document.getElementById('date').textContent = dateText;
}

setInterval(updateClock, 1000); // Update clock every second
window.onload = updateClock; // Initialize clock on page load

// Function to check if a time slot is full
function isSlotFull(appointments, slot) {
    return appointments.filter(app => app.time === slot).length >= 3;
}

// Function to load existing appointments for a specific date
function loadAppointments(date) {
    fetch(`http://localhost:3001/appointments?date=${date}`)
        .then(response => response.json())
        .then(data => {
            const timeSlots = ['6-10', '11-15', '16-20', '21-00'];
            timeSlots.forEach(slot => {
                const button = document.querySelector(`.time-slot-button[data-time="${slot}"]`);
                const appointmentCount = getAppointmentCount(data, slot);
                updateButtonColor(button, appointmentCount);
            });
        })
        .catch(error => console.error('Error loading appointments:', error));
}

// Function to count appointments in a slot
function getAppointmentCount(appointments, slot) {
    return appointments.filter(app => app.time === slot).length;
}

// Function to update button color based on appointment count
function updateButtonColor(button, count) {
    button.classList.remove('green', 'orange', 'red'); // Remove previous color classes

    if (count === 1) {
        button.classList.add('green');
    } else if (count === 2) {
        button.classList.add('orange');
    } else if (count >= 3) {
        button.classList.add('red');
    }
}

// Function to load all appointments for a month and color calendar cells
function loadMonthAppointments(month, year) {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const startDate = `${year}-${formattedMonth}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${formattedMonth}-${lastDay}`;
    
    fetch(`http://localhost:3001/appointments?date_gte=${startDate}&date_lte=${endDate}`)
        .then(response => response.json())
        .then(data => {
            const appointmentsByDate = {};
            data.forEach(appointment => {
                if (!appointmentsByDate[appointment.date]) {
                    appointmentsByDate[appointment.date] = [];
                }
                appointmentsByDate[appointment.date].push(appointment);
            });
            colorCalendarCells(appointmentsByDate, month, year);
        })
        .catch(error => console.error('Error loading month appointments:', error));
}

// Function to color calendar cells based on appointment count
function colorCalendarCells(appointmentsByDate, month, year) {
    const calendarCells = document.querySelectorAll('.calendar-days table td:not(.other-month)');
    
    calendarCells.forEach(cell => {
        const day = parseInt(cell.textContent);
        const formattedMonth = (month + 1).toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');
        const dateString = `${year}-${formattedMonth}-${formattedDay}`;
        
        cell.classList.remove('original-color', 'green', 'orange', 'red'); // Remove previous color classes
        
        if (appointmentsByDate[dateString]) {
            const count = appointmentsByDate[dateString].length;
            const colorClass = getColorClass(count);
            cell.classList.add(colorClass);
        } else {
            cell.classList.add('original-color');
        }
    });
}

// Function to update calendar colors after appointment changes
function updateCalendarColors() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    loadMonthAppointments(month, year);
}

// Function to generate the calendar for a given month and year
function generateCalendar(month, year) {
    const calendarDays = document.querySelector('.calendar-days');
    calendarDays.innerHTML = '';

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const prevDays = new Date(year, month, 0).getDate();

    let table = document.createElement('table');
    let row = table.insertRow();
    let dayCounter = 1;
    let nextMonthDay = 1;
    let cell;

    for (let x = 0; x < firstDayIndex; x++) {
        cell = row.insertCell();
        cell.textContent = prevDays - firstDayIndex + x + 1;
        cell.classList.add('other-month');
    }

    while (dayCounter <= daysInMonth) {
        if (row.cells.length === 7) {
            row = table.insertRow();
        }
        cell = row.insertCell();
        cell.textContent = dayCounter;
        const currentDay = dayCounter;
        cell.addEventListener('click', () => openAgendaModal(currentDay, month, year));
        dayCounter++;
    }

    while (row.cells.length < 7) {
        cell = row.insertCell();
        cell.textContent = nextMonthDay;
        cell.classList.add('other-month');
        nextMonthDay++;
    }

    calendarDays.appendChild(table);
    loadMonthAppointments(month, year); // Load appointments for the current month and color cells
}

// Function to update the calendar
function updateCalendar() {
    try {
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        generateCalendar(month, year);
    } catch (error) {
        console.error("Error updating calendar:", error);
    }
}

// Function to open the agenda modal
function openAgendaModal(day, month, year) {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    selectedDate = `${year}-${formattedMonth}-${day.toString().padStart(2, '0')}`;
    document.getElementById('selected-date').innerText = `Datum: ${selectedDate}`;

    const timeSlotButtons = document.querySelectorAll('.time-slot-button');
    timeSlotButtons.forEach(button => {
        button.classList.remove('full');
        button.textContent = button.textContent.replace(' (Voll)', '');
    });

    loadAppointments(selectedDate);

    document.getElementById('agenda-modal').classList.add('active');
    document.querySelector('.backdrop').classList.add('active');
}

// Determines the color class for a date based on the number of appointments
function getColorClass(count) {
    if (count === 0) return 'original-color';
    if (count >= 1 && count <= 4) return 'green';
    if (count >= 5 && count <= 8) return 'orange';
    return 'red';
}

// Function to select a time slot
function selectTimeSlot(event) {
    selectedTimeSlot = event.target.dataset.time;
    const timeBlock = document.getElementById('selected-time-block');
    const timeHeader = document.getElementById('selected-time-header');
    const appointmentsList = timeBlock.querySelector('.appointments-list');

    timeHeader.textContent = event.target.textContent;
    appointmentsList.innerHTML = '';
    timeBlock.style.display = 'block';

    const appointmentInputArea = timeBlock.querySelector('.appointment-input-area');
    appointmentInputArea.style.display = 'flex';

    fetch(`http://localhost:3001/appointments?date=${selectedDate}&time=${selectedTimeSlot}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(appointment => {
                const listItem = createAppointmentListItem(appointment);
                appointmentsList.appendChild(listItem);
            });
            if (appointmentsList.children.length >= 3) {
                appointmentInputArea.style.display = 'none';
                alert('This time slot is full. Maximum 3 appointments reached.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Helper function to create an appointment list item
function createAppointmentListItem(appointment) {
    const listItem = document.createElement('li');
    listItem.textContent = appointment.description;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-appointment-button');
    editButton.addEventListener('click', () => editAppointment(listItem, appointment));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-appointment-button');
    deleteButton.addEventListener('click', () => deleteAppointment(listItem, appointment.id));

    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    return listItem;
}

// Function to add an appointment
function addAppointment() {
    if (!selectedTimeSlot) {
        alert('Please select a time slot first.');
        return;
    }

    const timeBlock = document.getElementById('selected-time-block');
    const appointmentsList = timeBlock.querySelector('.appointments-list');
    const appointmentInput = timeBlock.querySelector('.appointment-input');
    const appointmentText = appointmentInput.value.trim();

    if (appointmentText) {
        if (appointmentsList.children.length < 3) {
            fetch('http://localhost:3001/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: selectedDate,
                    time: selectedTimeSlot,
                    description: appointmentText
                })
            })
            .then(response => response.json())
            .then(data => {
                const listItem = createAppointmentListItem(data);
                appointmentsList.appendChild(listItem);
                appointmentInput.value = '';

                if (appointmentsList.children.length >= 3) {
                    timeBlock.querySelector('.appointment-input-area').style.display = 'none';
                    alert('Time slot full. Maximum 3 appointments reached.');
                }

                const button = document.querySelector(`.time-slot-button[data-time="${selectedTimeSlot}"]`);
                if (appointmentsList.children.length >= 3) {
                    button.classList.add('full');
                    button.textContent += ' (Full)';
                }
                
                updateCalendarColors();
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('You can add a maximum of 3 appointments in this time slot.');
        }
    } else {
        alert('Please enter an appointment.');
    }
}

// Function to edit an appointment
function editAppointment(listItem, appointment) {
    const newText = prompt('Edit appointment:', appointment.description);
    if (newText && newText !== appointment.description) {
        fetch(`http://localhost:3001/appointments/${appointment.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: newText
            })
        })
        .then(response => response.json())
        .then(updatedAppointment => {
            listItem.textContent = updatedAppointment.description;
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-appointment-button');
            editButton.addEventListener('click', () => editAppointment(listItem, updatedAppointment));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-appointment-button');
            deleteButton.addEventListener('click', () => deleteAppointment(listItem, updatedAppointment.id));

            listItem.appendChild(editButton);
            listItem.appendChild(deleteButton);
            
            updateCalendarColors();
        })
        .catch(error => console.error('Error editing appointment:', error));
    }
}

// Function to delete an appointment
function deleteAppointment(listItem, appointmentId) {
    fetch(`http://localhost:3001/appointments/${appointmentId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            const appointmentsList = listItem.parentElement;
            appointmentsList.removeChild(listItem);

            const appointmentInputArea = document.querySelector('#selected-time-block .appointment-input-area');
            if (appointmentsList.children.length < 3) {
                appointmentInputArea.style.display = 'flex';
            }

            const button = document.querySelector(`.time-slot-button[data-time="${selectedTimeSlot}"]`);
            if (appointmentsList.children.length < 3) {
                button.classList.remove('full');
                button.textContent = button.textContent.replace(' (Full)', '');
            }
            
            updateCalendarColors();
        } else {
            console.error('Error deleting appointment:', response.status);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to save appointments
function saveAppointment() {
    alert('Appointments saved!');
    closeAgendaModal();
}

// Function to close the modal
function closeAgendaModal() {
    document.getElementById('agenda-modal').classList.remove('active');
    document.querySelector('.backdrop').classList.remove('active');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const timeSlotButtons = document.querySelectorAll('.time-slot-button');
    timeSlotButtons.forEach(button => {
        button.addEventListener('click', selectTimeSlot);
    });

    const addAppointmentButton = document.querySelector('.add-appointment-button');
    addAppointmentButton.addEventListener('click', addAppointment);

    // Initialize the calendar
    updateCalendar();

    // Add event listeners for month and year selects
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    monthSelect.addEventListener('change', updateCalendar);
    yearSelect.addEventListener('change', updateCalendar);
});







