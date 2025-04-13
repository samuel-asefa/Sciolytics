// Dashboard HTML (to be added to your existing HTML file)


// ----- DASHBOARD FUNCTIONALITY IMPLEMENTATION -----

// Global variables for pagination
let currentPage = 1;
const resultsPerPage = 10;
let filteredResults = [];
let currentFilter = 'all';

// Dashboard initialization
function initializeDashboard() {
// Inject dashboard HTML if it doesn't exist
if (!document.getElementById('dashboardSection')) {
const mainContainer = document.querySelector('main.container');
const tempDiv = document.createElement('div');
tempDiv.innerHTML = dashboardHTML;
mainContainer.appendChild(tempDiv.firstElementChild);
}

// Add CSS if not already added
if (!document.getElementById('dashboardStyles')) {
const styleEl = document.createElement('style');
styleEl.id = 'dashboardStyles';
styleEl.textContent = dashboardCSS;
document.head.appendChild(styleEl);
}

// Load Chart.js if not already loaded
if (typeof Chart === 'undefined') {
const scriptEl = document.createElement('script');
scriptEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js';
scriptEl.onload = function() {
    updateDashboard();
};
document.head.appendChild(scriptEl);
} else {
updateDashboard();
}
}

// Update dashboard with user data
function updateDashboard() {
if (!currentUser) return;

// Get all results for current user
const userResults = testResults.filter(r => r.userId === currentUser.id);
filteredResults = userResults;

// Update stats
document.getElementById('testsCompleted').textContent = userResults.length;

// Calculate average score
if (userResults.length > 0) {
const totalPercentage = userResults.reduce((sum, result) => sum + result.percentage, 0);
const averagePercentage = Math.round(totalPercentage / userResults.length);
document.getElementById('averageScore').textContent = `${averagePercentage}%`;

// Calculate highest score
const highestPercentage = Math.max(...userResults.map(result => result.percentage));
document.getElementById('highestScore').textContent = `${highestPercentage}%`;

// Calculate average time
const totalTime = userResults.reduce((sum, result) => sum + result.timeTaken, 0);
const avgTime = Math.round(totalTime / userResults.length);
const avgMinutes = Math.floor(avgTime / 60);
const avgSeconds = avgTime % 60;
document.getElementById('averageTime').textContent = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
} else {
document.getElementById('averageScore').textContent = 'N/A';
document.getElementById('highestScore').textContent = 'N/A';
document.getElementById('averageTime').textContent = 'N/A';
}

// Filter results based on current filter
filterResults(currentFilter, false);

// Draw charts if Chart.js is loaded
if (typeof Chart !== 'undefined') {
drawSubjectChart(userResults);
drawProgressChart(userResults);
}
}

// Draw subject performance chart
function drawSubjectChart(results) {
const subjects = ['biology', 'chemistry', 'physics', 'earth-science'];
const subjectNames = {
'biology': 'Biology',
'chemistry': 'Chemistry',
'physics': 'Physics',
'earth-science': 'Earth Science'
};

const subjectScores = {};
const subjectCounts = {};

// Initialize subjects
subjects.forEach(subject => {
subjectScores[subject] = 0;
subjectCounts[subject] = 0;
});

// Calculate average score per subject
results.forEach(result => {
const subject = getSubjectFromTestId(result.testId).toLowerCase().replace(' ', '-');
if (subjects.includes(subject)) {
    subjectScores[subject] += result.percentage;
    subjectCounts[subject]++;
}
});

const labels = [];
const data = [];
const backgroundColors = [
'rgba(34, 197, 94, 0.7)',
'rgba(59, 130, 246, 0.7)',
'rgba(245, 158, 11, 0.7)',
'rgba(168, 85, 247, 0.7)'
];

// Calculate average score for each subject
subjects.forEach((subject, index) => {
if (subjectCounts[subject] > 0) {
    const avgScore = Math.round(subjectScores[subject] / subjectCounts[subject]);
    labels.push(subjectNames[subject]);
    data.push(avgScore);
}
});

// Destroy previous chart if it exists
if (window.subjectChart instanceof Chart) {
window.subjectChart.destroy();
}

// Create new chart
const ctx = document.getElementById('subjectChart').getContext('2d');
window.subjectChart = new Chart(ctx, {
type: 'bar',
data: {
    labels: labels,
    datasets: [{
        label: 'Average Score (%)',
        data: data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1
    }]
},
options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                callback: function(value) {
                    return value + '%';
                }
            }
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
}
});
}

// Draw progress over time chart
function drawProgressChart(results) {
// Sort results by date
const sortedResults = [...results].sort((a, b) => new Date(a.date) - new Date(b.date));

const labels = [];
const data = [];

sortedResults.forEach(result => {
const date = new Date(result.date);
labels.push(date.toLocaleDateString());
data.push(result.percentage);
});

// Destroy previous chart if it exists
if (window.progressChart instanceof Chart) {
window.progressChart.destroy();
}

// Create new chart
const ctx = document.getElementById('progressChart').getContext('2d');
window.progressChart = new Chart(ctx, {
type: 'line',
data: {
    labels: labels,
    datasets: [{
        label: 'Score (%)',
        data: data,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        tension: 0.2,
        fill: true,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointRadius: 4
    }]
},
options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                callback: function(value) {
                    return value + '%';
                }
            }
        }
    }
}
});
}

// Filter results by subject
function filterResults(filter, updateUI = true) {
if (!currentUser) return;

currentFilter = filter;
const userResults = testResults.filter(r => r.userId === currentUser.id);

if (filter === 'all') {
filteredResults = userResults;
} else {
filteredResults = userResults.filter(r => {
    const subject = getSubjectFromTestId(r.testId).toLowerCase().replace(' ', '-');
    return subject === filter;
});
}

// Reset pagination to first page
currentPage = 1;

// Update table
updateResultsTable();

// Update active filter button
if (updateUI) {
document.querySelectorAll('.dashboard-actions button').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline');
});

const activeButton = document.querySelector(`.dashboard-actions button[onclick="filterResults('${filter}')"]`);
if (activeButton) {
    activeButton.classList.remove('btn-outline');
    activeButton.classList.add('btn-primary');
}
}
}

// Search results
function searchResults() {
const searchTerm = document.getElementById('searchInput').value.toLowerCase();
const userResults = testResults.filter(r => r.userId === currentUser.id);

if (searchTerm.trim() === '') {
filterResults(currentFilter, false);
return;
}

filteredResults = userResults.filter(r => {
return r.testTitle.toLowerCase().includes(searchTerm) || 
       getSubjectFromTestId(r.testId).toLowerCase().includes(searchTerm);
});

// Reset pagination to first page
currentPage = 1;

// Update table
updateResultsTable();
}

// Sort results
function sortResults() {
const sortOption = document.getElementById('sortDropdown').value;

switch (sortOption) {
case 'date-desc':
    filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    break;
case 'date-asc':
    filteredResults.sort((a, b) => new Date(a.date) - new Date(b.date));
    break;
case 'score-desc':
    filteredResults.sort((a, b) => b.percentage - a.percentage);
    break;
case 'score-asc':
    filteredResults.sort((a, b) => a.percentage - b.percentage);
    break;
}

// Update table
updateResultsTable();
}

// Update results table
function updateResultsTable() {
const resultsTableBody = document.getElementById('resultsTableBody');
resultsTableBody.innerHTML = '';

if (filteredResults.length === 0) {
const row = document.createElement('tr');
row.innerHTML = `<td colspan="6" style="text-align: center;">No test results found</td>`;
resultsTableBody.appendChild(row);

// Clear pagination
document.getElementById('resultsPagination').innerHTML = '';
return;
}

// Paginate results
const startIndex = (currentPage - 1) * resultsPerPage;
const endIndex = Math.min(startIndex + resultsPerPage, filteredResults.length);
const paginatedResults = filteredResults.slice(startIndex, endIndex);

// Create rows
paginatedResults.forEach(result => {
const date = new Date(result.date);
const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

const subject = getSubjectFromTestId(result.testId).toLowerCase().replace(' ', '-');
const subjectName = getSubjectFromTestId(result.testId);

// Format time taken
const minutes = Math.floor(result.timeTaken / 60);
const seconds = result.timeTaken % 60;
const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

const row = document.createElement('tr');
row.innerHTML = `
    <td>${result.testTitle}</td>
    <td><span class="badge badge-${subject}">${subjectName}</span></td>
    <td>${result.score}/${result.totalQuestions} (${result.percentage}%)</td>
    <td>${formattedTime}</td>
    <td>${formattedDate}</td>
    <td>
        <button class="btn btn-outline" onclick="viewResultDetail('${result.id}')">Details</button>
    </td>
`;
resultsTableBody.appendChild(row);
});

// Update pagination
updatePagination();
}

// Update pagination controls
function updatePagination() {
const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
const paginationElement = document.getElementById('resultsPagination');
paginationElement.innerHTML = '';

if (totalPages <= 1) return;

// Previous button
const prevButton = document.createElement('button');
prevButton.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
prevButton.textContent = '←';
prevButton.disabled = currentPage === 1;
prevButton.addEventListener('click', () => {
if (currentPage > 1) {
    currentPage--;
    updateResultsTable();
}
});
paginationElement.appendChild(prevButton);

// Page buttons
const maxVisiblePages = 5;
let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

if (endPage - startPage + 1 < maxVisiblePages) {
startPage = Math.max(1, endPage - maxVisiblePages + 1);
}

for (let i = startPage; i <= endPage; i++) {
const pageButton = document.createElement('button');
pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
pageButton.textContent = i;
pageButton.addEventListener('click', () => {
    currentPage = i;
    updateResultsTable();
});
paginationElement.appendChild(pageButton);
}

// Next button
const nextButton = document.createElement('button');
nextButton.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
nextButton.textContent = '→';
nextButton.disabled = currentPage === totalPages;
nextButton.addEventListener('click', () => {
if (currentPage < totalPages) {
    currentPage++;
    updateResultsTable();
}
});
paginationElement.appendChild(nextButton);
}

// View detailed test result
function viewResultDetail(resultId) {
const result = testResults.find(r => r.id === resultId);
if (!result) return;

const modalContent = document.getElementById('resultDetailContent');

// Format time taken
const minutes = Math.floor(result.timeTaken / 60);
const seconds = result.timeTaken % 60;
const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

// Set title
document.getElementById('detailTestTitle').textContent = result.testTitle;

// Create content
let content = `
<div class="user-stats">
    <div class="stat-box">
        <h4>Score</h4>
        <p>${result.score}/${result.totalQuestions}</p>
    </div>
    <div class="stat-box">
        <h4>Percentage</h4>
        <p>${result.percentage}%</p>
    </div>
    <div class="stat-box">
        <h4>Time Taken</h4>
        <p>${formattedTime}</p>
    </div>
    <div class="stat-box">
        <h4>Date</h4>
        <p>${new Date(result.date).toLocaleDateString()}</p>
    </div>
</div>
<h3>Question Breakdown</h3>
`;

// Add questions and answers
result.details.forEach((detail, index) => {
// Get question and options from the test data
const question = sampleQuestions.find(q => q.question === detail.question);
const options = question ? question.options : [];

content += `
    <div class="question-result ${detail.isCorrect ? 'correct' : 'incorrect'}">
        <h4>Question ${index + 1}: ${detail.question}</h4>
        <p><strong>Your answer:</strong> ${detail.userAnswer >= 0 && options.length > 0 ? options[detail.userAnswer] : 'Not answered'}</p>
        <p><strong>Correct answer:</strong> ${detail.correctAnswer >= 0 && options.length > 0 ? options[detail.correctAnswer] : 'Unknown'}</p>
        <p><strong>Status:</strong> ${detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
        ${detail.explanation ? `<p><strong>Explanation:</strong> ${detail.explanation}</p>` : ''}
    </div>
`;
});

modalContent.innerHTML = content;
openModal('resultDetailModal');
}
// Sample data
const testData = {
    biology: [
        { id: 'bio1', title: 'Cell Biology Basics', questions: 20, time: 30 },
        { id: 'bio2', title: 'Genetics and Heredity', questions: 25, time: 40 },
        { id: 'bio3', title: 'Ecology and Ecosystems', questions: 15, time: 25 }
    ],
    chemistry: [
        { id: 'chem1', title: 'Atomic Structure', questions: 20, time: 30 },
        { id: 'chem2', title: 'Chemical Bonding', questions: 25, time: 35 },
        { id: 'chem3', title: 'Acids and Bases', questions: 15, time: 20 }
    ],
    physics: [
        { id: 'phys1', title: 'Mechanics', questions: 20, time: 40 },
        { id: 'phys2', title: 'Electricity and Magnetism', questions: 25, time: 45 },
        { id: 'phys3', title: 'Thermodynamics', questions: 15, time: 30 }
    ],
    'earth-science': [
        { id: 'earth1', title: 'Geology Fundamentals', questions: 20, time: 30 },
        { id: 'earth2', title: 'Meteorology', questions: 25, time: 35 },
        { id: 'earth3', title: 'Astronomy', questions: 15, time: 25 }
    ]
};

// Sample questions (just for demo)
const sampleQuestions = [
    {
        id: 1,
        question: "Which organelle is known as the 'powerhouse of the cell'?",
        options: ["Nucleus", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
        answer: 1
    },
    {
        id: 2,
        question: "What is the primary function of chloroplasts in plant cells?",
        options: ["Cell division", "Protein synthesis", "Photosynthesis", "Energy storage"],
        answer: 2
    },
    {
        id: 3,
        question: "Which of the following is NOT a component of the cell membrane?",
        options: ["Phospholipids", "Proteins", "Carbohydrates", "DNA"],
        answer: 3
    },
    {
        id: 4,
        question: "What process is responsible for the movement of substances from an area of high concentration to an area of low concentration?",
        options: ["Active transport", "Facilitated diffusion", "Osmosis", "Diffusion"],
        answer: 3
    },
    {
        id: 5,
        question: "Which of the following cell types does NOT contain a nucleus?",
        options: ["Mature red blood cells", "Nerve cells", "Muscle cells", "Skin cells"],
        answer: 0
    }
];

// User data storage (would be handled by a database in a real app)
let currentUser = null;
let users = [];
let testResults = [];
let currentTest = null;
let timer = null;
let seconds = 0;

// DOM elements
const homeSection = document.querySelector('.home-section');
const testsSection = document.querySelector('.tests-section');
const testTakingSection = document.querySelector('.test-taking-section');
const resultsSection = document.querySelector('.test-results-section');
const dashboardSection = document.getElementById('dashboardSection');
const authButtons = document.getElementById('authButtons');
const userArea = document.getElementById('userArea');
const welcomeUser = document.getElementById('welcomeUser');

// Check for local storage data
function loadStoredData() {
    const storedUsers = localStorage.getItem('sciOlyUsers');
    const storedResults = localStorage.getItem('sciOlyResults');
    const storedCurrentUser = localStorage.getItem('sciOlyCurrentUser');
    
    if (storedUsers) users = JSON.parse(storedUsers);
    if (storedResults) testResults = JSON.parse(storedResults);
    if (storedCurrentUser) {
        currentUser = JSON.parse(storedCurrentUser);
        updateAuthUI();
        updateDashboard();
    }
}

// Save data to local storage
function saveData() {
    localStorage.setItem('sciOlyUsers', JSON.stringify(users));
    localStorage.setItem('sciOlyResults', JSON.stringify(testResults));
    if (currentUser) {
        localStorage.setItem('sciOlyCurrentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('sciOlyCurrentUser');
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

// Section visibility functions
function showSection(section) {
    homeSection.style.display = 'none';
    testsSection.style.display = 'none';
    testTakingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    
    if (section === 'home') homeSection.style.display = 'block';
    else if (section === 'tests') testsSection.style.display = 'block';
    else if (section === 'taking') testTakingSection.style.display = 'block';
    else if (section === 'results') resultsSection.style.display = 'block';
    else if (section === 'dashboard') dashboardSection.style.display = 'block';
}

function showTestsSection() {
    showSection('tests');
}

function goBack() {
    showSection('home');
}

// Test list functions
function showTestList(subject) {
    const testsList = document.getElementById('testsList');
    testsList.innerHTML = '';
    
    const subjectTests = testData[subject] || [];
    
    if (subjectTests.length === 0) {
        testsList.innerHTML = '<p>No tests available for this subject yet.</p>';
        return;
    }
    
    subjectTests.forEach(test => {
        const testCard = document.createElement('div');
        testCard.className = 'card';
        testCard.innerHTML = `
            <h3>${test.title}</h3>
            <p>${test.questions} questions | ${test.time} minutes</p>
            <button class="btn btn-outline" onclick="startTest('${test.id}', '${test.title}')">Start Test</button>
        `;
        testsList.appendChild(testCard);
    });
    
    showSection('tests');
}

// Test taking functions
function startTest(testId, testTitle) {
    // Check if user is logged in
    if (!currentUser && testId !== 'demo') {
        alert("Please log in to take this test and save your results.");
        openModal('loginModal');
        return;
    }
    
    document.getElementById('testTitle').textContent = testTitle;
    
    const testContainer = document.getElementById('testContainer');
    testContainer.innerHTML = '';
    
    // Load questions (in a real app, these would come from a server)
    currentTest = {
        id: testId,
        title: testTitle,
        questions: sampleQuestions,
        startTime: new Date()
    };
    
    sampleQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <h3>Question ${index + 1}: ${q.question}</h3>
            <div class="options">
                ${q.options.map((option, i) => `
                    <div class="option" data-question="${q.id}" data-option="${i}" onclick="selectOption(this)">
                        <input type="radio" id="q${q.id}o${i}" name="q${q.id}">
                        <label for="q${q.id}o${i}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
        testContainer.appendChild(questionDiv);
    });
    
    // Start timer
    startTimer();
    
    showSection('taking');
}

function selectOption(optionElement) {
    // Clear other selections for this question
    const questionId = optionElement.dataset.question;
    const options = document.querySelectorAll(`.option[data-question="${questionId}"]`);
    options.forEach(opt => {
        opt.classList.remove('selected');
        opt.querySelector('input').checked = false;
    });
    
    // Select this option
    optionElement.classList.add('selected');
    optionElement.querySelector('input').checked = true;
}

function startTimer() {
    seconds = 0;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent = `Time: ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function stopTimer() {
    clearInterval(timer);
}

function submitTest() {
    stopTimer();
    
    // Calculate score
    let score = 0;
    const results = [];
    
    currentTest.questions.forEach(question => {
        const selectedOption = document.querySelector(`.option.selected[data-question="${question.id}"]`);
        const userAnswer = selectedOption ? parseInt(selectedOption.dataset.option) : -1;
        
        const isCorrect = (userAnswer === question.answer);
        if (isCorrect) score++;
        
        results.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            isCorrect: isCorrect,
            explanation: "Explanation would go here in a real app."
        });
    });
    
    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - currentTest.startTime) / 1000);
    
    // Save result if logged in
    if (currentUser) {
        const result = {
            id: Date.now().toString(),
            userId: currentUser.id,
            testId: currentTest.id,
            testTitle: currentTest.title,
            score: score,
            totalQuestions: currentTest.questions.length,
            percentage: Math.round((score / currentTest.questions.length) * 100),
            timeTaken: timeTaken,
            date: new Date().toISOString(),
            details: results
        };
        
        testResults.push(result);
        saveData();
        updateDashboard();
    }
    
    // Show results
    showResults(score, currentTest.questions.length, timeTaken, results);
}

function showResults(score, total, timeTaken, details) {
    document.getElementById('resultTitle').textContent = currentTest.title;
    document.getElementById('scoreValue').textContent = `${score}/${total}`;
    document.getElementById('percentageValue').textContent = `${Math.round((score / total) * 100)}%`;
    
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    document.getElementById('timeTaken').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const resultDetails = document.getElementById('resultDetails');
    resultDetails.innerHTML = '<h3>Question Details</h3>';
    
    details.forEach((detail, index) => {
        const detailDiv = document.createElement('div');
        detailDiv.className = `question ${detail.isCorrect ? 'correct' : 'incorrect'}`;
        detailDiv.innerHTML = `
            <h4>Question ${index + 1}: ${detail.question}</h4>
            <p>Your answer: ${detail.userAnswer >= 0 ? currentTest.questions[index].options[detail.userAnswer] : 'Not answered'}</p>
            <p>Correct answer: ${currentTest.questions[index].options[detail.correctAnswer]}</p>
            <p style="color: ${detail.isCorrect ? 'green' : 'red'}">
                ${detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </p>
        `;
        resultDetails.appendChild(detailDiv);
    });
    
    showSection('results');
}

// Authentication functions
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        updateAuthUI();
        saveData();
        closeModal('loginModal');
        updateDashboard();
        alert("Login successful!");
    } else {
        alert("Invalid email or password.");
    }
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    if (users.some(u => u.email === email)) {
        alert("Email already in use!");
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password // In a real app, this would be hashed
    };
    
    users.push(newUser);
    currentUser = newUser;
    updateAuthUI();
    saveData();
    closeModal('registerModal');
    alert("Registration successful!");
});

// Continuing the JavaScript code from before:

function updateAuthUI() {
if (currentUser) {
authButtons.style.display = 'none';
userArea.style.display = 'flex';
welcomeUser.textContent = `Welcome, ${currentUser.name}!`;

// Show dashboard button in navbar if not already there
const navLinks = document.querySelector('.nav-links');
if (!document.getElementById('dashboardLink')) {
    const dashLink = document.createElement('a');
    dashLink.id = 'dashboardLink';
    dashLink.href = '#';
    dashLink.textContent = 'Dashboard';
    dashLink.addEventListener('click', function() {
        showSection('dashboard');
    });
    navLinks.appendChild(dashLink);
}
} else {
authButtons.style.display = 'flex';
userArea.style.display = 'none';

// Remove dashboard link if it exists
const dashLink = document.getElementById('dashboardLink');
if (dashLink) dashLink.remove();
}
}

function logout() {
currentUser = null;
updateAuthUI();
localStorage.removeItem('sciOlyCurrentUser');
showSection('home');
}

// Dashboard functions
function updateDashboard() {
if (!currentUser) return;

const userResults = testResults.filter(r => r.userId === currentUser.id);
document.getElementById('testsCompleted').textContent = userResults.length;

// Calculate average score
if (userResults.length > 0) {
const totalPercentage = userResults.reduce((sum, result) => sum + result.percentage, 0);
const averagePercentage = Math.round(totalPercentage / userResults.length);
document.getElementById('averageScore').textContent = `${averagePercentage}%`;
} else {
document.getElementById('averageScore').textContent = 'N/A';
}

// Populate results table
const resultsTableBody = document.getElementById('resultsTableBody');
resultsTableBody.innerHTML = '';

// Sort by date (newest first)
userResults.sort((a, b) => new Date(b.date) - new Date(a.date));

// Show only the 5 most recent results
const recentResults = userResults.slice(0, 5);

if (recentResults.length === 0) {
const row = document.createElement('tr');
row.innerHTML = '<td colspan="5">No test results yet. Take a test to see your results here.</td>';
resultsTableBody.appendChild(row);
} else {
recentResults.forEach(result => {
    const date = new Date(result.date);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${result.testTitle}</td>
        <td>${getSubjectFromTestId(result.testId)}</td>
        <td>${result.score}/${result.totalQuestions} (${result.percentage}%)</td>
        <td>${formattedDate}</td>
        <td>
            <button class="btn btn-outline" onclick="viewResult('${result.id}')">View</button>
        </td>
    `;
    resultsTableBody.appendChild(row);
});
}
}

function getSubjectFromTestId(testId) {
// Extract subject from test ID (in a real app, this would be more robust)
if (testId.startsWith('bio')) return 'Biology';
if (testId.startsWith('chem')) return 'Chemistry';
if (testId.startsWith('phys')) return 'Physics';
if (testId.startsWith('earth')) return 'Earth Science';
return 'General';
}

function viewResult(resultId) {
const result = testResults.find(r => r.id === resultId);
if (!result) return;

// Set up the results display similar to submitTest()
currentTest = {
id: result.testId,
title: result.testTitle,
questions: sampleQuestions // In a real app, these would be stored with the result
};

showResults(result.score, result.totalQuestions, result.timeTaken, result.details);
}

// Helper function for demo
function startDemoTest() {
startTest('demo', 'Demo Test: Cell Biology');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
loadStoredData();
updateAuthUI();
});

// Test Configuration System
// Add this code to your main.js file

// ----- TEST CONFIGURATION FUNCTIONALITY -----

// Define the test configuration modal HTML
const testConfigModalHTML = `
<div class="modal" id="testConfigModal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Configure Your Test</h2>
      <span class="close" onclick="closeModal('testConfigModal')">&times;</span>
    </div>
    <form id="testConfigForm">
      <div class="form-group">
        <label for="configSubject">Subject</label>
        <select id="configSubject" class="form-control" onchange="updateTopicOptions()">
          <option value="biology">Biology</option>
          <option value="chemistry">Chemistry</option>
          <option value="physics">Physics</option>
          <option value="earth-science">Earth Science</option>
        </select>
      </div>
      <div class="form-group">
        <label for="configTopics">Topics</label>
        <div id="topicCheckboxes" class="checkbox-group">
          <!-- Topics will be loaded dynamically -->
        </div>
      </div>
      <div class="form-group">
        <label for="configDifficulty">Difficulty</label>
        <select id="configDifficulty" class="form-control">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <div class="form-group">
        <label for="configQuestionCount">Number of Questions</label>
        <input type="number" id="configQuestionCount" class="form-control" min="5" max="50" value="10">
      </div>
      <div class="form-group">
        <label for="configTimeLimit">Time Limit (minutes)</label>
        <input type="number" id="configTimeLimit" class="form-control" min="5" max="120" value="20">
      </div>
      <button type="submit" class="btn btn-primary">Generate Test</button>
    </form>
  </div>
</div>
`;

// Topic data for each subject
const topicsBySubject = {
  biology: [
    { id: 'cell-biology', name: 'Cell Biology' },
    { id: 'genetics', name: 'Genetics' },
    { id: 'evolution', name: 'Evolution' },
    { id: 'ecology', name: 'Ecology' },
    { id: 'physiology', name: 'Human Physiology' },
    { id: 'botany', name: 'Botany' }
  ],
  chemistry: [
    { id: 'atomic-structure', name: 'Atomic Structure' },
    { id: 'periodic-table', name: 'Periodic Table' },
    { id: 'chemical-bonding', name: 'Chemical Bonding' },
    { id: 'reactions', name: 'Chemical Reactions' },
    { id: 'acids-bases', name: 'Acids and Bases' },
    { id: 'organic-chemistry', name: 'Organic Chemistry' }
  ],
  physics: [
    { id: 'mechanics', name: 'Mechanics' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'magnetism', name: 'Magnetism' },
    { id: 'thermodynamics', name: 'Thermodynamics' },
    { id: 'waves', name: 'Waves and Optics' },
    { id: 'modern-physics', name: 'Modern Physics' }
  ],
  'earth-science': [
    { id: 'geology', name: 'Geology' },
    { id: 'meteorology', name: 'Meteorology' },
    { id: 'oceanography', name: 'Oceanography' },
    { id: 'astronomy', name: 'Astronomy' },
    { id: 'environmental', name: 'Environmental Science' },
    { id: 'climate', name: 'Climate Science' }
  ]
};

// Question bank (expanded with more sample questions)
// In a real app, this would come from a database
const questionBank = {
  biology: {
    'cell-biology': [
      {
        question: "Which organelle is known as the 'powerhouse of the cell'?",
        options: ["Nucleus", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
        answer: 1,
        difficulty: "easy"
      },
      {
        question: "What is the primary function of the cell membrane?",
        options: ["To produce energy", "To control what enters and exits the cell", "To store genetic information", "To break down waste"],
        answer: 1,
        difficulty: "easy"
      },
      {
        question: "Which of the following is NOT a component of the endomembrane system?",
        options: ["Endoplasmic reticulum", "Golgi apparatus", "Mitochondria", "Lysosomes"],
        answer: 2,
        difficulty: "medium"
      },
      {
        question: "What cellular structure is responsible for protein synthesis?",
        options: ["Ribosomes", "Nucleolus", "Peroxisomes", "Centrioles"],
        answer: 0,
        difficulty: "medium"
      },
      {
        question: "During which phase of mitosis do sister chromatids separate and move to opposite poles?",
        options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
        answer: 2,
        difficulty: "hard"
      }
    ],
    'genetics': [
      {
        question: "What are the nitrogenous bases found in DNA?",
        options: ["Adenine, thymine, uracil, cytosine", "Adenine, thymine, guanine, cytosine", "Adenine, uracil, guanine, cytosine", "Uracil, thymine, guanine, cytosine"],
        answer: 1,
        difficulty: "easy"
      },
      {
        question: "In a dihybrid cross between two heterozygous parents (AaBb × AaBb), what proportion of offspring would be expected to have the dominant phenotype for both traits?",
        options: ["9/16", "3/16", "1/16", "12/16"],
        answer: 0,
        difficulty: "hard"
      }
    ],
    // More biology categories and questions would go here
  },
  chemistry: {
    'atomic-structure': [
      {
        question: "What is the charge of an electron?",
        options: ["Positive", "Negative", "Neutral", "It varies"],
        answer: 1,
        difficulty: "easy"
      },
      {
        question: "Which subatomic particle is found in the nucleus of an atom and has no charge?",
        options: ["Proton", "Electron", "Neutron", "Positron"],
        answer: 2,
        difficulty: "easy"
      }
    ],
    'chemical-bonding': [
      {
        question: "Which type of bond involves the sharing of electron pairs between atoms?",
        options: ["Ionic bond", "Covalent bond", "Hydrogen bond", "Metallic bond"],
        answer: 1,
        difficulty: "easy"
      },
      {
        question: "What is the hybridization of carbon in methane (CH₄)?",
        options: ["sp", "sp²", "sp³", "sp³d"],
        answer: 2,
        difficulty: "medium"
      }
    ],
    // More chemistry categories and questions would go here
  },
  physics: {
    'mechanics': [
      {
        question: "What is Newton's Second Law of Motion?",
        options: ["An object at rest stays at rest unless acted upon by an external force", "Force equals mass times acceleration", "For every action, there is an equal and opposite reaction", "Energy can neither be created nor destroyed"],
        answer: 1,
        difficulty: "easy"
      },
      {
        question: "A ball is thrown vertically upward with an initial velocity of 20 m/s. Neglecting air resistance, what is its velocity after 1 second? (g = 10 m/s²)",
        options: ["10 m/s upward", "10 m/s downward", "30 m/s upward", "30 m/s downward"],
        answer: 0,
        difficulty: "medium"
      }
    ],
    // More physics categories and questions would go here
  },
  'earth-science': {
    'geology': [
      {
        question: "Which type of rock forms from the cooling of magma or lava?",
        options: ["Sedimentary", "Metamorphic", "Igneous", "Composite"],
        answer: 2,
        difficulty: "easy"
      },
      {
        question: "What is the most abundant mineral in Earth's crust?",
        options: ["Quartz", "Feldspar", "Mica", "Olivine"],
        answer: 1,
        difficulty: "medium"
      }
    ],
    // More earth science categories and questions would go here
  }
};

// Initialize test configuration
function initTestConfig() {
  // Add modal HTML to the document if it doesn't exist
  if (!document.getElementById('testConfigModal')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = testConfigModalHTML;
    document.body.appendChild(tempDiv.firstElementChild);
    
    // Initialize form
    document.getElementById('testConfigForm').addEventListener('submit', handleTestConfigSubmit);
  }
  
  // Add CSS for checkbox group
  const style = document.createElement('style');
  style.textContent = `
    .checkbox-group {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 10px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    .checkbox-item input {
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);
  
  // Update topic options for the initial subject
  updateTopicOptions();
  
  // Open the modal
  openModal('testConfigModal');
}

// Update topic checkboxes based on selected subject
function updateTopicOptions() {
  const subject = document.getElementById('configSubject').value;
  const topicsList = topicsBySubject[subject] || [];
  const topicCheckboxes = document.getElementById('topicCheckboxes');
  
  topicCheckboxes.innerHTML = '';
  
  topicsList.forEach(topic => {
    const checkboxItem = document.createElement('div');
    checkboxItem.className = 'checkbox-item';
    checkboxItem.innerHTML = `
      <input type="checkbox" id="topic-${topic.id}" name="topics" value="${topic.id}" checked>
      <label for="topic-${topic.id}">${topic.name}</label>
    `;
    topicCheckboxes.appendChild(checkboxItem);
  });
}

// Handle test configuration form submission
function handleTestConfigSubmit(e) {
  e.preventDefault();
  
  // Get form values
  const subject = document.getElementById('configSubject').value;
  const selectedTopics = Array.from(document.querySelectorAll('input[name="topics"]:checked'))
                             .map(checkbox => checkbox.value);
  const difficulty = document.getElementById('configDifficulty').value;
  const questionCount = parseInt(document.getElementById('configQuestionCount').value);
  const timeLimit = parseInt(document.getElementById('configTimeLimit').value);
  
  // Validate inputs
  if (selectedTopics.length === 0) {
    alert("Please select at least one topic.");
    return;
  }
  
  if (isNaN(questionCount) || questionCount < 5 || questionCount > 50) {
    alert("Number of questions must be between 5 and 50.");
    return;
  }
  
  if (isNaN(timeLimit) || timeLimit < 5 || timeLimit > 120) {
    alert("Time limit must be between 5 and 120 minutes.");
    return;
  }
  
  // Generate custom test
  const customTest = generateCustomTest(subject, selectedTopics, difficulty, questionCount, timeLimit);
  
  if (customTest.questions.length < questionCount) {
    alert(`Only ${customTest.questions.length} questions available with your criteria. The test will be generated with the available questions.`);
  }
  
  // Close the configuration modal
  closeModal('testConfigModal');
  
  // Start the custom test
  startCustomTest(customTest);
}

// Generate a custom test based on configuration
function generateCustomTest(subject, topics, difficulty, questionCount, timeLimit) {
  const subjectName = getSubjectDisplayName(subject);
  const testId = `custom-${subject}-${Date.now()}`;
  const testTitle = `Custom ${subjectName} Test`;
  
  // Collect questions from selected topics
  let availableQuestions = [];
  
  topics.forEach(topic => {
    if (questionBank[subject] && questionBank[subject][topic]) {
      // Filter by difficulty if not 'mixed'
      if (difficulty === 'mixed') {
        availableQuestions = availableQuestions.concat(questionBank[subject][topic]);
      } else {
        const filteredQuestions = questionBank[subject][topic].filter(q => q.difficulty === difficulty);
        availableQuestions = availableQuestions.concat(filteredQuestions);
      }
    }
  });
  
  // Shuffle questions
  shuffleArray(availableQuestions);
  
  // Take only the requested number of questions (or all available if less)
  const finalQuestions = availableQuestions.slice(0, questionCount);
  
  // Format questions to match the expected structure in the rest of the app
  const formattedQuestions = finalQuestions.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: q.options,
    answer: q.answer
  }));
  
  return {
    id: testId,
    title: testTitle,
    subject: subject,
    questions: formattedQuestions,
    timeLimit: timeLimit * 60 // Convert minutes to seconds
  };
}

// Get display name for a subject
function getSubjectDisplayName(subject) {
  const names = {
    'biology': 'Biology',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
    'earth-science': 'Earth Science'
  };
  return names[subject] || subject;
}

// Start a custom test
function startCustomTest(test) {
  document.getElementById('testTitle').textContent = test.title;
  
  const testContainer = document.getElementById('testContainer');
  testContainer.innerHTML = '';
  
  // Set up current test object
  currentTest = {
    id: test.id,
    title: test.title,
    questions: test.questions,
    startTime: new Date(),
    timeLimit: test.timeLimit
  };
  
  // Set up timer with time limit
  startTimerWithLimit(test.timeLimit);
  
  // Create question elements
  test.questions.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
      <h3>Question ${index + 1}: ${q.question}</h3>
      <div class="options">
        ${q.options.map((option, i) => `
          <div class="option" data-question="${q.id}" data-option="${i}" onclick="selectOption(this)">
            <input type="radio" id="q${q.id}o${i}" name="q${q.id}">
            <label for="q${q.id}o${i}">${option}</label>
          </div>
        `).join('')}
      </div>
    `;
    testContainer.appendChild(questionDiv);
  });
  
  showSection('taking');
}

// Timer with time limit functionality
function startTimerWithLimit(timeLimit) {
  seconds = 0;
  clearInterval(timer);
  
  const timerElement = document.getElementById('timer');
  
  timer = setInterval(() => {
    seconds++;
    
    // Format time display
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerElement.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Check if time limit is reached
    if (timeLimit && seconds >= timeLimit) {
      clearInterval(timer);
      alert("Time's up! Your test will be submitted automatically.");
      submitTest();
    }
  }, 1000);
}

// Add a "Create Custom Test" button to the subjects grid
function addCustomTestButton() {
  // Find the subjects grid on the home page
  const subjectsGrid = document.querySelector('.home-section .subjects-grid');
  
  if (subjectsGrid) {
    const customTestCard = document.createElement('div');
    customTestCard.className = 'card';
    customTestCard.innerHTML = `
      <h3>🔧 Custom Test</h3>
      <p>Create your own personalized test by selecting topics, difficulty, and number of questions.</p>
      <button class="btn btn-primary" onclick="initTestConfig()">Create Custom Test</button>
    `;
    
    subjectsGrid.appendChild(customTestCard);
  }
}

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Add test configuration button to the tests section
function addConfigButtonToTestsSection() {
  const testsSection = document.querySelector('.tests-section .dashboard-header');
  
  if (testsSection) {
    const configButton = document.createElement('button');
    configButton.className = 'btn btn-primary';
    configButton.textContent = 'Create Custom Test';
    configButton.onclick = initTestConfig;
    
    testsSection.appendChild(configButton);
  }
}

// Initialize custom test functionality when document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add the custom test card to the home page
  addCustomTestButton();
  
  // Add config button to tests section
  addConfigButtonToTestsSection();
});