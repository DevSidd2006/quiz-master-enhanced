import { quizQuestions, getRandomQuestions } from './questions.js';

// Sound effects
const sounds = {
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
    wrong: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    start: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
    timeup: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3')
};

// Quiz state variables
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let userAnswers = [];
let streak = 0;
let timeBonus = 0;
let totalTimeBonus = 0;
let hintsAvailable = 3;
let powerUps = {
    skip: 1,
    timeFreeze: 1,
    doublePoints: 1
};

// Add scoring constants
const SCORING = {
    BASE_POINTS: 10,
    TIME_BONUS_MULTIPLIER: 0.67, // 67% of base points possible as time bonus
    STREAK_BONUS: {
        3: 5,  // 5 points bonus at 3 correct answers
        5: 10  // 10 points bonus at 5 correct answers
    },
    MIN_TIME_FOR_BONUS: 5 // Minimum seconds required for time bonus
};

// Add to quiz state variables
let correctAnswers = 0;
let incorrectAnswers = 0;
let skippedQuestions = 0;
let hintsUsed = 0;
let powerUpsUsed = 0;
let totalStreakBonus = 0; // Add this to track total streak bonus

// Update penalty constants
const PENALTIES = {
    HINT: 5,     // 5 points penalty per hint used
    SKIP: 10,    // 10 points penalty per skip
    TIME_FREEZE: 10, // 10 points penalty per time freeze
    DOUBLE_POINTS: 10 // 10 points penalty per double points used
};

// DOM Elements
let landingPage;
let quizContainer;
let themeSelect;
let levelSelect;
let startQuizButton;
let questionElement;
let optionsElement;
let nextButton;
let scoreElement;
let timerElement;
let themeToggle;

// Profile state variables
let userProfile = {
    username: '',
    memberSince: null,
    totalQuizzes: 0,
    highestScore: 0,
    averageScore: 0,
    totalScore: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalStreakBonus: 0,
    totalHintsUsed: 0,
    totalPowerUpsUsed: 0,
    achievements: [], // e.g., ['first_quiz', 'streak_master', 'top_10']
    recentActivity: [],
    lastQuiz: null
};

// Initialize DOM elements
function initializeDOMElements() {
    landingPage = document.getElementById('landing-page');
    quizContainer = document.getElementById('quiz-container');
    themeSelect = document.getElementById('theme');
    levelSelect = document.getElementById('level');
    startQuizButton = document.getElementById('start-quiz');
    questionElement = document.getElementById('question');
    optionsElement = document.getElementById('options');
    nextButton = document.getElementById('next-button');
    scoreElement = document.getElementById('score');
    timerElement = document.getElementById('timer');
    themeToggle = document.getElementById('theme-toggle');

    // Add event listener for start quiz button
    if (startQuizButton) {
        startQuizButton.addEventListener('click', startQuiz);
    }
}

// Hide all containers initially
function hideAllContainers() {
    landingPage.classList.add('hidden');
    quizContainer.classList.add('hidden');
    const rulesContainer = document.getElementById('rules-container');
    if (rulesContainer) {
        rulesContainer.classList.add('hidden');
    }
}

// Show specific container with animations
function showContainer(container) {
    hideAllContainers();
    container.classList.remove('hidden');
}

function resetQuizState() {
    currentQuiz = [];
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    timeBonus = 0;
    totalTimeBonus = 0;
    hintsAvailable = 3;
    powerUps = {
        skip: 1,
        timeFreeze: 1,
        doublePoints: 1
    };
    correctAnswers = 0;
    incorrectAnswers = 0;
    skippedQuestions = 0;
    hintsUsed = 0;
    powerUpsUsed = 0;
    userAnswers = [];
    timeLeft = 15;
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    if (scoreElement) scoreElement.textContent = `Score: ${score}`;
    if (timerElement) timerElement.textContent = `Time: ${timeLeft}s`;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = '0%';
}

// Initialize leaderboard from localStorage
function initializeLeaderboard() {
    const storedData = localStorage.getItem('quizLeaderboard');
    if (storedData) {
             leaderboardData = JSON.parse(storedData);
    }
}

// Save leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboardData));
}

// Add score to leaderboard
function addScoreToLeaderboard(score, theme, level) {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        alert('Please enter a username before starting the quiz.');
         return;
    }

    const entry = {
        username,
        score,
        theme,
        level,
        timestamp: new Date().toISOString(),
        id: Date.now() // Unique identifier for each entry
    };

    // Remove any existing entries for this user
    leaderboardData.scores = leaderboardData.scores.filter(entry => entry.username !== username);

    // Add the new entry
    leaderboardData.scores.push(entry);
    leaderboardData.lastUpdated = new Date().toISOString();

    // Sort scores in descending order
    leaderboardData.scores.sort((a, b) => b.score - a.score);

    // Keep only top 100 scores
    if (leaderboardData.scores.length > 100) {
        leaderboardData.scores = leaderboardData.scores.slice(0, 100);
    }

    saveLeaderboard();
    updateLeaderboardDisplay();
}

// Update leaderboard display to make it more visually appealing
function updateLeaderboardDisplay() {
    const leaderboardTable = document.getElementById('leaderboard-table');
    if (!leaderboardTable) return;

    leaderboardTable.innerHTML = '';

    leaderboardData.scores.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.className = 'leaderboard-item hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';

        // Add medal emoji for top 3 positions
        let rankDisplay = index + 1;
        if (index === 0) {
            rankDisplay = '🥇';
        } else if (index === 1) {
            rankDisplay = '🥈';
        } else if (index === 2) {
            rankDisplay = '🥉';
        }

        // Add special styling for top 3 positions
        const rankClass = index < 3 ? 'text-2xl' : 'font-semibold text-gray-700 dark:text-gray-300';
        const scoreClass = index < 3 ? 'text-2xl font-bold' : 'font-bold text-green-500 dark:text-green-400';
        const usernameClass = index < 3 ? 'text-xl font-bold text-indigo-600 dark:text-indigo-400' : 'font-medium text-indigo-600 dark:text-indigo-400';

        row.innerHTML = `
            <td class="py-4 text-center ${rankClass}">${rankDisplay}</td>
            <td class="py-4 text-center ${usernameClass}">${entry.username}</td>
            <td class="py-4 text-center ${scoreClass}">${entry.score}</td>
            <td class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">${entry.theme} (${entry.level})</td>
            <td class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">${new Date(entry.timestamp).toLocaleString()}</td>
        `;
        leaderboardTable.appendChild(row);
    });

    // Add a header row for better clarity
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    headerRow.innerHTML = `
        <th class="py-4 text-center">Rank</th>
        <th class="py-4 text-center">Username</th>
        <th class="py-4 text-center">Score</th>
        <th class="py-4 text-center">Theme</th>
        <th class="py-4 text-center">Date & Time</th>
    `;
    leaderboardTable.prepend(headerRow);

    // Add a subtle shadow and rounded corners to the table
    leaderboardTable.className = 'w-full table-auto border-collapse rounded-lg shadow-md overflow-hidden';
}

// Modify showQuestion function
function showQuestion() {
    if (!currentQuiz[currentQuestionIndex]) return;

    const question = currentQuiz[currentQuestionIndex];

    // Clear the quiz container
    quizContainer.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <div id="timer" class="timer text-xl font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">⏱️ Time: ${timeLeft}s</div>
            <div id="score" class="score text-xl font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">🏆 Score: ${score}</div>
        </div>
        <div class="progress-bar mb-6" id="progress-bar"></div>

        <!-- Power-ups Section -->
        <div class="power-ups-section mb-8">
            <h3 class="text-lg font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">Power-ups & Hints</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button id="hint-button" class="power-up-button bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 ${hintsAvailable === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <span>💡</span>
                    <span>Hint (${hintsAvailable})</span>
                </button>
                <button id="skip-button" class="power-up-button bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 ${powerUps.skip === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <span>⏩</span>
                    <span>Skip (${powerUps.skip})</span>
                </button>
                <button id="time-freeze-button" class="power-up-button bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 ${powerUps.timeFreeze === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <span>⏸️</span>
            <span>Time Freeze (${powerUps.timeFreeze})</span>
                </button>
                <button id="double-points-button" class="power-up-button bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 ${powerUps.doublePoints === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <span>2️⃣</span>
            <span>Double Points (${powerUps.doublePoints})</span>
                </button>
            </div>
        </div>

        <!-- Question Section -->
        <div class="question-section mb-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
            <div id="question" class="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200">
                ${question.question}
            </div>
        </div>

        <!-- Options Section -->
        <div id="options" class="options-section grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            ${question.options.map((option, index) => `
                <button class="option-button w-full bg-white text-gray-800 py-4 px-6 rounded-lg border-2 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md">
                    ${option}
                </button>
            `).join('')}
        </div>

        <!-- Next Button -->
        <button id="next-button" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 hidden">
            Next Question
        </button>
    `;

    // Initialize DOM elements
    timerElement = document.getElementById('timer');
    scoreElement = document.getElementById('score');
    optionsElement = document.getElementById('options');
    nextButton = document.getElementById('next-button');

    // Add option click event listeners
    const optionButtons = optionsElement.querySelectorAll('.option-button');
    optionButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectAnswer(index));
    });

    // Add power-up event listeners
    document.getElementById('hint-button').addEventListener('click', useHint);
    document.getElementById('skip-button').addEventListener('click', useSkip);
    document.getElementById('time-freeze-button').addEventListener('click', useTimeFreeze);
    document.getElementById('double-points-button').addEventListener('click', useDoublePoints);

    // Add next button event listener
    nextButton.addEventListener('click', showNextQuestion);

    // Update progress bar
    updateProgressBar();
    
    // Start timer
    startTimer();
}

// Modify startQuiz function to check for username
function startQuiz() {
    const theme = themeSelect.value;
    const level = levelSelect.value;
    const username = document.getElementById('username').value.trim();
    
    // Validate username
    if (!username) {
        alert('Please enter a username before starting the quiz.');
        return;
    }
    
    // Reset quiz state
    resetQuizState();
    
    // Show quiz container
    showContainer(quizContainer);
    
    // Show loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    quizContainer.appendChild(loadingSpinner);
    
    // Load questions (simulating API call with setTimeout)
    setTimeout(() => {
        // Remove spinner
        quizContainer.removeChild(loadingSpinner);
        
        // Get questions for selected theme and level
        currentQuiz = getRandomQuestions(theme, level, 5);
        
        // Show first question
        showQuestion();
        updateProgressBar();
        
        // Start timer
        startTimer();
        
        // Update score display
        scoreElement.textContent = `Score: ${score}`;
    }, 1500);
}

function selectAnswer(index) {
    // Stop the timer
    stopTimer();

    const question = currentQuiz[currentQuestionIndex];
    const buttons = optionsElement.querySelectorAll('.option-button');

    // Store user's answer
    userAnswers[currentQuestionIndex] = index;

    // Disable all buttons
    buttons.forEach(button => {
        button.disabled = true;
    });

    // Check if answer is correct
    if (index === question.correct) {
        buttons[index].classList.add('correct');
        correctAnswers++;

        // Calculate points
        const basePoints = SCORING.BASE_POINTS;
        let timeBonus = 0;

        // Calculate time bonus
        if (timeLeft >= SCORING.MIN_TIME_FOR_BONUS) {
            const timeRatio = (timeLeft - SCORING.MIN_TIME_FOR_BONUS) / (15 - SCORING.MIN_TIME_FOR_BONUS);
            timeBonus = Math.floor(basePoints * SCORING.TIME_BONUS_MULTIPLIER * timeRatio);
        }
        
        // Calculate streak bonus
        let streakBonus = 0;
        streak++; // Increment streak before checking for bonus
        
        // Check for streak bonuses
        if (streak === 3) {
            streakBonus = SCORING.STREAK_BONUS[3];
            totalStreakBonus += streakBonus;
        } else if (streak === 5) {
            streakBonus = SCORING.STREAK_BONUS[5];
            totalStreakBonus += streakBonus;
        }
        
        const pointsEarned = basePoints + timeBonus + streakBonus;
        
        score += pointsEarned;
        totalTimeBonus += timeBonus;
        
        // Update score display
        if (scoreElement) {
            scoreElement.textContent = `🏆 Score: ${score} (+${pointsEarned})`;
        }
        
        sounds.correct.play();
        
        if (streak >= 3) {
            showStreakMessage(streak);
        }
    } else {
        buttons[index].classList.add('wrong');
             buttons[question.correct].classList.add('correct');
        incorrectAnswers++;
        streak = 0;
        sounds.wrong.play();
    }
    
    // Show next button
        if (nextButton) {
            nextButton.classList.remove('hidden');
        }
}

function showNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuiz.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

function updateProgressBar() {
         const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function startTimer() {
    // Clear any existing timer
    if (timer) {
        clearInterval(timer);
    }

    timeLeft = 15;
    if (timerElement) {
        timerElement.textContent = `⏱️ Time: ${timeLeft}s`;
    }

    timer = setInterval(() => {
        timeLeft--;
        if (timerElement) {
            timerElement.textContent = `⏱️ Time: ${timeLeft}s`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            sounds.timeup.play();
            handleTimeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function handleTimeUp() {
    const buttons = optionsElement.querySelectorAll('.option-button');
    buttons.forEach(button => {
        button.disabled = true;
    });
    
    const question = currentQuiz[currentQuestionIndex];
    const correctButton = buttons[question.correct];
    correctButton.classList.add('correct');
    
    if (nextButton) {
        nextButton.classList.remove('hidden');
    }
}

function endQuiz() {
    clearInterval(timer);
    
    // Calculate final score and stats
    const finalScore = score;
    const accuracy = (correctAnswers / currentQuiz.length) * 100;
    const timeTaken = 15 * currentQuiz.length - totalTimeBonus;
    
    // Update profile with quiz results
    const username = document.getElementById('username').value.trim();
    const theme = themeSelect.value;
    const level = levelSelect.value;
    
    // Update user profile
    updateProfile(finalScore, theme, level);
    
    // Show results page
    const resultsPage = document.getElementById('results-page');
    if (resultsPage) {
        resultsPage.classList.remove('hidden');
        quizContainer.classList.add('hidden');
        
        // Update results display
        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('correct-answers').textContent = correctAnswers;
        document.getElementById('time-taken').textContent = `${timeTaken}s`;
        document.getElementById('accuracy').textContent = `${Math.round(accuracy)}%`;
        
        // Add event listener for restart button
        const restartBtn = document.getElementById('restart-quiz');
        if (restartBtn) {
            restartBtn.onclick = () => {
                resultsPage.classList.add('hidden');
                showContainer(landingPage);
                resetQuizState();
            };
        }
    }
}

// Add streak message function
function showStreakMessage(streak) {
    const streakMessages = {
        3: "Good!",
        5: "Great!",
        7: "Excellent!",
        10: "Unstoppable!"
    };
    
    if (streakMessages[streak]) {
        const streakDiv = document.createElement('div');
        streakDiv.className = 'streak-message fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce';
        streakDiv.textContent = `${streakMessages[streak]} ${streak} in a row!`;
        document.body.appendChild(streakDiv);
        
        setTimeout(() => {
            streakDiv.remove();
        }, 2000);
    }
}

// Add power-up functions
function useHint() {
    if (hintsAvailable === 0) return;

    const question = currentQuiz[currentQuestionIndex];
    const options = optionsElement.querySelectorAll('.option-button');
    const wrongOptions = Array.from(options)
        .map((option, index) => ({ option, index }))
        .filter(({ index }) => index !== question.correct);
    
    // Remove two wrong options
    const optionsToRemove = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    optionsToRemove.forEach(({ option }) => {
        option.style.opacity = '0.5';
        option.disabled = true;
    });
    
    hintsAvailable--;
    hintsUsed++;
    score = Math.max(0, score - PENALTIES.HINT); // Apply penalty
    scoreElement.textContent = `Score: ${score} (-${PENALTIES.HINT} hint penalty)`;
    updatePowerUpsUI();
}

function useSkip() {
    if (powerUps.skip === 0) return;
    
    powerUps.skip--;
    powerUpsUsed++;
    skippedQuestions++;
    score = Math.max(0, score - PENALTIES.SKIP); // Apply penalty
    scoreElement.textContent = `Score: ${score} (-${PENALTIES.SKIP} skip penalty)`;
    
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
        showQuestion();
    } else {
        endQuiz();
    }
    updatePowerUpsUI();
}

function useTimeFreeze() {
    if (powerUps.timeFreeze === 0) return;
    
    powerUps.timeFreeze--;
    powerUpsUsed++;
    timeLeft += 10;
    score = Math.max(0, score - PENALTIES.TIME_FREEZE); // Apply penalty
    scoreElement.textContent = `Score: ${score} (-${PENALTIES.TIME_FREEZE} time freeze penalty)`;
    timerElement.textContent = `Time: ${timeLeft}s`;
    updatePowerUpsUI();
}

function useDoublePoints() {
    if (powerUps.doublePoints === 0) return;
    
    powerUps.doublePoints--;
    powerUpsUsed++;
    score = Math.max(0, score - PENALTIES.DOUBLE_POINTS); // Apply penalty
    scoreElement.textContent = `Score: ${score} (-${PENALTIES.DOUBLE_POINTS} double points penalty)`;
    
    // Double points for the next correct answer
    const originalSelectAnswer = selectAnswer;
    selectAnswer = function(index) {
        const question = currentQuiz[currentQuestionIndex];
        if (index === question.correct) {
            score *= 2;
        }
        originalSelectAnswer(index);
        selectAnswer = originalSelectAnswer;
    };
    updatePowerUpsUI();
}

function updatePowerUpsUI() {
    const hintButton = document.getElementById('hint-button');
    const skipButton = document.getElementById('skip-button');
    const timeFreezeButton = document.getElementById('time-freeze-button');
    const doublePointsButton = document.getElementById('double-points-button');

    if (hintButton) {
        hintButton.textContent = `Hint (${hintsAvailable})`;
        hintButton.disabled = hintsAvailable === 0;
        hintButton.classList.toggle('opacity-50', hintsAvailable === 0);
    }
    if (skipButton) {
        skipButton.textContent = `Skip (${powerUps.skip})`;
        skipButton.disabled = powerUps.skip === 0;
        skipButton.classList.toggle('opacity-50', powerUps.skip === 0);
    }
    if (timeFreezeButton) {
        timeFreezeButton.textContent = `Time Freeze (${powerUps.timeFreeze})`;
        timeFreezeButton.disabled = powerUps.timeFreeze === 0;
        timeFreezeButton.classList.toggle('opacity-50', powerUps.timeFreeze === 0);
    }
    if (doublePointsButton) {
        doublePointsButton.textContent = `Double Points (${powerUps.doublePoints})`;
        doublePointsButton.disabled = powerUps.doublePoints === 0;
        doublePointsButton.classList.toggle('opacity-50', powerUps.doublePoints === 0);
    }
}

// Reset leaderboard data
function resetLeaderboard() {
    if (confirm('Are you sure you want to reset the leaderboard? This action cannot be undone.')) {
        leaderboardData = {
            scores: [],
            lastUpdated: null
        };
        saveLeaderboard();
        updateLeaderboardDisplay();
    }
}

// Initialize profile from localStorage
function initializeProfile() {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
    }
}

// Save profile to localStorage
function saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Update profile with new quiz data
function updateProfile(score, theme, level) {
    const username = document.getElementById('username').value.trim();
    if (!username) return;

    // Initialize profile if it's a new user
    if (!userProfile.username) {
        userProfile = {
            username: username,
            memberSince: new Date().toISOString(),
            totalQuizzes: 0,
            highestScore: 0,
            averageScore: 0,
            totalScore: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            totalStreakBonus: 0,
            totalHintsUsed: 0,
            totalPowerUpsUsed: 0,
            achievements: [],
            recentActivity: [],
            lastQuiz: null
        };
    } else {
        // Always update username and memberSince if missing
        if (!userProfile.username) userProfile.username = username;
        if (!userProfile.memberSince) userProfile.memberSince = new Date().toISOString();
    }

    // Update profile data
    userProfile.totalQuizzes = (userProfile.totalQuizzes || 0) + 1;
    userProfile.highestScore = Math.max(userProfile.highestScore || 0, score);
    userProfile.totalScore = (userProfile.totalScore || 0) + score;
    userProfile.averageScore = userProfile.totalScore / userProfile.totalQuizzes;
    userProfile.lastQuiz = new Date().toISOString();
    userProfile.totalCorrect = (userProfile.totalCorrect || 0) + correctAnswers;
    userProfile.totalIncorrect = (userProfile.totalIncorrect || 0) + incorrectAnswers;
    userProfile.totalStreakBonus = (userProfile.totalStreakBonus || 0) + totalStreakBonus;
    userProfile.totalHintsUsed = (userProfile.totalHintsUsed || 0) + hintsUsed;
    userProfile.totalPowerUpsUsed = (userProfile.totalPowerUpsUsed || 0) + powerUpsUsed;

    // Achievements logic
    if (!userProfile.achievements.includes('first_quiz') && userProfile.totalQuizzes === 1) {
        userProfile.achievements.push('first_quiz');
    }
    if (!userProfile.achievements.includes('streak_master') && streak >= 5) {
        userProfile.achievements.push('streak_master');
    }
    // Top 10 achievement (check leaderboard)
    const leaderboard = JSON.parse(localStorage.getItem('leaderboardData') || '{"scores":[]}');
    const sorted = leaderboard.scores.sort((a, b) => b.score - a.score);
    const top10 = sorted.slice(0, 10).map(e => e.username);
    if (!userProfile.achievements.includes('top_10') && top10.includes(username)) {
        userProfile.achievements.push('top_10');
    }

    // Add to recent activity
    userProfile.recentActivity.unshift({
        type: 'quiz',
        score: score,
        theme: theme,
        level: level,
        timestamp: new Date().toISOString(),
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        totalQuestions: currentQuiz.length,
        timeTaken: 15 * currentQuiz.length - totalTimeBonus,
        streak: streak,
        hintsUsed: hintsUsed,
        powerUpsUsed: powerUpsUsed
    });

    // Keep only last 5 activities
    if (userProfile.recentActivity.length > 5) {
        userProfile.recentActivity = userProfile.recentActivity.slice(0, 5);
    }

    // Save profile to localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Update profile display
function updateProfileDisplay() {
    const profilePage = document.getElementById('profile-page');
    if (!profilePage) return;

    // Update profile header
    document.getElementById('profile-initial').textContent = userProfile.username.charAt(0).toUpperCase();
    document.getElementById('profile-username').textContent = userProfile.username;
    document.getElementById('profile-username-detail').textContent = userProfile.username;

    // Update stats
    document.getElementById('total-quizzes').textContent = userProfile.totalQuizzes;
    document.getElementById('highest-score').textContent = userProfile.highestScore;
    document.getElementById('average-score').textContent = Math.round(userProfile.averageScore);

    // Update member since
    const memberSince = new Date(userProfile.memberSince);
    document.getElementById('member-since').textContent = memberSince.toLocaleDateString();

    // Update last quiz
    if (userProfile.lastQuiz) {
        const lastQuiz = new Date(userProfile.lastQuiz);
        document.getElementById('last-quiz').textContent = lastQuiz.toLocaleDateString();
    }

    // Update recent activity
    const activityList = document.getElementById('recent-activity-list');
    activityList.innerHTML = userProfile.recentActivity.map(activity => `
        <div class="activity-item bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transform hover:scale-105 transition-transform duration-300">
            <div class="flex justify-between items-center">
                <div>
                    <span class="font-semibold text-indigo-600 dark:text-indigo-400">${activity.theme} Quiz</span>
                    <span class="text-gray-500 dark:text-gray-400"> (${activity.level})</span>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-green-600">${activity.score} points</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        ${new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Add 3D hover effects to cards
function add3DEffects() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    hideAllContainers();
    showContainer(landingPage);
    add3DEffects();
    initializeTheme();

    // Add theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Theme toggle functionality
function toggleTheme() {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    
    // Update theme toggle icon
    if (themeToggle) {
        const icon = themeToggle.querySelector('svg');
        if (icon) {
            if (isDarkTheme) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />';
            } else {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
            }
        }
    }
}

// Initialize theme on page load
function initializeTheme() {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        if (themeToggle) {
            const icon = themeToggle.querySelector('svg');
            if (icon) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />';
            }
        }
    }
}

// Add function to show rules
function showRules(theme, level) {
    const rulesContainer = document.getElementById('rules-container');
    if (rulesContainer) {
        hideAllContainers();
        rulesContainer.classList.remove('hidden');
        
        // Add animation class
        rulesContainer.classList.add('animate-fade-in');
    } else {
        // If rules container is not found, create a simple modal with rules
     const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const content = document.createElement('div');
        content.className = 'bg-white dark:bg-gray-800 p-8 rounded-lg max-w-lg w-full';
        content.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Quiz Rules</h2>
            <ul class="list-disc pl-5 mb-4">
                <li>You will have 15 seconds to answer each question</li>
                <li>Correct answers earn you points</li>
                <li>Answering quickly gives you bonus points</li>
                <li>Use powerups wisely to improve your score</li>
            </ul>
            <button id="modal-start-button" class="w-full bg-indigo-600 text-white py-2 px-4 rounded">
                Start Quiz
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        document.getElementById('modal-start-button').addEventListener('click', () => {
            document.body.removeChild(modal);
            startQuiz(theme, level);
        });
    }
}

function showResultsPage(finalScore) {
    // Hide quiz container
    quizContainer.classList.add('hidden');
    // Show results page
    const resultsPage = document.getElementById('results-page');
    if (resultsPage) {
        resultsPage.classList.remove('hidden');
        // Update results
        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('correct-answers').textContent = correctAnswers;
        document.getElementById('time-taken').textContent = `${15 * currentQuiz.length - totalTimeBonus}s`;
        document.getElementById('accuracy').textContent = `${Math.round((correctAnswers / currentQuiz.length) * 100)}%`;
    }
    // Add event listener for restart
    const restartBtn = document.getElementById('restart-quiz');
    if (restartBtn) {
        restartBtn.onclick = () => {
            resultsPage.classList.add('hidden');
            showContainer(landingPage);
        };
    }
 }