import { quizQuestions, getRandomQuestions } from './questions.js';
import achievementManager from './achievements.js';

// Sound effects
const sounds = {
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'),
    wrong: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    start: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
    timeup: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
    badge: new Audio('images/opening-144757.mp3')
};

// Quiz state variables
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let timer = null; // Explicitly initialize timer as null
let timeLeft = 15;
let userAnswers = [];
let streak = 0;
let timeBonus = 0;
let totalTimeBonus = 0;
let hintsAvailable = 3;
let powerUps = { skip: 1, timeFreeze: 1, doublePoints: 1 };
let correctAnswers = 0;
let incorrectAnswers = 0;
let skippedQuestions = 0;
let hintsUsed = 0;
let powerUpsUsed = 0;
let totalStreakBonus = 0;
let currentQuizIsChallenge = false; // Added for tracking challenge state

// Add scoring constants
const SCORING = {
    BASE_POINTS: 10,
    TIME_BONUS_MULTIPLIER: 0.67,
    STREAK_BONUS: {
        3: 5,
        5: 10
    },
    MIN_TIME_FOR_BONUS: 5
};

// Define badge categories and achievement badges
const BADGES = {
    QUIZ_COUNT: {
        first_quiz: { emoji: '🎯', title: 'First Steps', description: 'Complete your first quiz' },
        quiz_5: { emoji: '🏆', title: 'Quiz Enthusiast', description: 'Complete 5 quizzes' },
        quiz_10: { emoji: '🎖️', title: 'Quiz Master', description: 'Complete 10 quizzes' },
        quiz_25: { emoji: '👑', title: 'Quiz Champion', description: 'Complete 25 quizzes' }
    },
    SCORE_TOTAL: {
        score_100: { emoji: '💯', title: 'Century', description: 'Reach 100 total points' },
        score_500: { emoji: '🌟', title: 'Rising Star', description: 'Reach 500 total points' },
        score_1000: { emoji: '✨', title: 'Superstar', description: 'Reach 1,000 total points' }
    },
    SCORE_SINGLE: {
        perfect_quiz: { emoji: '🎯', title: 'Perfectionist', description: 'Score 100% on a quiz' },
        high_score_50: { emoji: '🚀', title: 'High Flyer', description: 'Score 50+ points in a single quiz' }
    },
    STREAK: {
        streak_3: { emoji: '🔥', title: 'Spark', description: 'Maintain a 3-day streak' },
        streak_7: { emoji: '🔥', title: 'Ignite', description: 'Maintain a 7-day streak' },
        streak_14: { emoji: '🔥', title: 'Blaze', description: 'Maintain a 14-day streak' },
        streak_30: { emoji: '🔥', title: 'Inferno', description: 'Maintain a 30-day streak' }
    },
    SPECIAL: {
        speed_demon: { emoji: '⚡', title: 'Speed Demon', description: 'Complete a quiz with at least 30 seconds left' },
        comeback_kid: { emoji: '🔄', title: 'Comeback Kid', description: 'Win after being behind' }
    }
};

// Export BADGES for other modules
export { BADGES };

// Add to quiz state variables
let userProfile = {
    username: '',
    email: '',
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
    achievements: [],
    recentActivity: [],
    lastQuiz: null
};

// Update penalty constants
const PENALTIES = {
    HINT: 5,
    SKIP: 10,
    TIME_FREEZE: 10,
    DOUBLE_POINTS: 10
};

// DOM Elements
let landingPage;
let quizContainer;
let rulesContainer;
let resultsPage;
let profileModal;
let registrationModal;

let themeSelect;
let levelSelect;
let usernameInput;

// Buttons
let startQuizButton;
let understandButton;
let viewProfileButton;
let closeProfileModalButton;
let playAgainButtonResults;
let closeRegistrationModalButton;
let registrationForm;
let themeToggle;

// Input fields for registration
let usernameRegistrationInput;
let emailRegistrationInput;

// Display elements for results
let finalScoreDisplay;
let correctAnswersDisplayResults;
let incorrectAnswersDisplayResults;
let accuracyDisplayResults;
let totalTimeBonusDisplayResults;

// Display elements for profile modal
let profileUsernameDisplay;
let profileMemberSinceDisplay;
let profileTotalQuizzesDisplay;
let profileHighestScoreDisplay;
let profileAverageScoreDisplay;

let isDoublePointsActive = false;

// Initialize DOM elements
function initializeDOMElements() {
    landingPage = document.getElementById('landing-page');
    quizContainer = document.getElementById('quiz-container');
    rulesContainer = document.getElementById('rules-container');
    resultsPage = document.getElementById('results-page');
    profileModal = document.getElementById('profile-page');
    registrationModal = document.getElementById('registration-modal');

    themeSelect = document.getElementById('theme');
    levelSelect = document.getElementById('level');
    usernameInput = document.getElementById('username');
    startQuizButton = document.getElementById('start-quiz');
    themeToggle = document.getElementById('theme-toggle');

    understandButton = document.getElementById('understand-button');
    viewProfileButton = document.getElementById('view-profile-btn');
    closeProfileModalButton = document.getElementById('close-profile-modal-button');
    playAgainButtonResults = document.getElementById('restart-quiz');
    closeRegistrationModalButton = document.getElementById('close-modal');
    registrationForm = document.getElementById('registration-form');
    usernameRegistrationInput = document.getElementById('reg-username');
    emailRegistrationInput = document.getElementById('reg-email');

    finalScoreDisplay = document.getElementById('final-score');
    correctAnswersDisplayResults = document.getElementById('correct-answers');
    accuracyDisplayResults = document.getElementById('accuracy');
    totalTimeBonusDisplayResults = document.getElementById('time-taken');

    profileUsernameDisplay = document.getElementById('profile-username-display');
    profileMemberSinceDisplay = document.getElementById('profile-member-since-display');
    profileTotalQuizzesDisplay = document.getElementById('profile-total-quizzes-display');
    profileHighestScoreDisplay = document.getElementById('profile-highest-score-display');
    profileAverageScoreDisplay = document.getElementById('profile-average-score-display');

    if (startQuizButton) {
        startQuizButton.addEventListener('click', showRulesBeforeQuiz);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (viewProfileButton) {
        viewProfileButton.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
    if (closeProfileModalButton) {
        closeProfileModalButton.addEventListener('click', () => {
            if (profileModal) {
                profileModal.classList.add('hidden');
            }
        });
    }
    if (playAgainButtonResults) {
        playAgainButtonResults.addEventListener('click', () => {
            resetQuizState();
            showContainer(landingPage);
        });
    }

    const registerButton = document.getElementById('register-button');
    if (registerButton) {
        registerButton.addEventListener('click', handleUserRegistration);
    }

    if (closeRegistrationModalButton) {
        closeRegistrationModalButton.addEventListener('click', () => {
            if (registrationModal) registrationModal.style.display = 'none';
        });
    }
}

// Hide all main page containers
function hideAllContainers() {
    if (landingPage) landingPage.classList.add('hidden');
    if (quizContainer) quizContainer.classList.add('hidden');
    if (rulesContainer) rulesContainer.classList.add('hidden');
    if (resultsPage) resultsPage.classList.add('hidden');
}

// Show a specific main page container
function showContainer(container) {
    hideAllContainers();
    if (container) {
        container.classList.remove('hidden');
    } else {
        console.error("showContainer: Target container is null or undefined.");
        if (landingPage) landingPage.classList.remove('hidden');
    }
}

function loadUserProfile() {
    const storedProfile = localStorage.getItem('userProfile');
    const navbarUsernameElement = document.getElementById('navbar-username');

    if (storedProfile) {
        userProfile = JSON.parse(storedProfile);
        if (usernameInput && userProfile.username) {
            usernameInput.value = userProfile.username;
        }
        if (navbarUsernameElement && userProfile.username) {
            navbarUsernameElement.textContent = userProfile.username;
            navbarUsernameElement.classList.remove('hidden');
        } else if (navbarUsernameElement) {
            navbarUsernameElement.classList.add('hidden');
        }
    } else {
        if (registrationModal) {
            registrationModal.style.display = 'block';
        }
        if (navbarUsernameElement) {
            navbarUsernameElement.classList.add('hidden');
        }
    }
}

function handleUserRegistration(event) {
    const username = usernameRegistrationInput.value.trim();
    const email = emailRegistrationInput.value.trim();

    if (username && email) {
        userProfile = {
            username: username,
            email: email,
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
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        if (usernameInput) usernameInput.value = username;
        const navbarUsernameElement = document.getElementById('navbar-username');
        if (navbarUsernameElement) {
            navbarUsernameElement.textContent = username;
            navbarUsernameElement.classList.remove('hidden');
        }

        if (registrationModal) registrationModal.style.display = 'none';
        achievementManager.checkAllAchievements(); // General check after registration
        alert('Welcome, ' + username + '!');
    } else {
        alert('Please enter both username and email.');
    }
}

function showRulesBeforeQuiz() {
    const theme = themeSelect.value;
    const level = levelSelect.value;

    if (rulesContainer) {
        hideAllContainers();
        rulesContainer.classList.remove('hidden');

        if (understandButton) {
            const newUnderstandButton = understandButton.cloneNode(true);
            understandButton.parentNode.replaceChild(newUnderstandButton, understandButton);
            understandButton = newUnderstandButton;

            understandButton.onclick = () => {
                if (rulesContainer) rulesContainer.classList.add('hidden');
                startQuizCore(theme, level);
            };
        }
    } else {
        startQuizCore(theme, level);
    }
}

function startQuizCore(theme, level, isChallenge = false) { // Modified signature
    currentQuizIsChallenge = isChallenge; // Added to set challenge state
    if (!theme && themeSelect) theme = themeSelect.value;
    if (!level && levelSelect) level = levelSelect.value;

    let currentUsername = usernameInput ? usernameInput.value.trim() : "";

    if (!currentUsername && userProfile.username) {
        currentUsername = userProfile.username;
        if (usernameInput) usernameInput.value = currentUsername;
    }

    if (!currentUsername) {
        alert('Please register or enter a username to start the quiz.');
        if (registrationModal && !localStorage.getItem('userProfile')) {
            registrationModal.style.display = 'block';
        } else if (usernameInput) {
            usernameInput.focus();
        }
        return;
    }

    if (userProfile.username !== currentUsername || !userProfile.email) {
        userProfile.username = currentUsername;
        if (!userProfile.memberSince) userProfile.memberSince = new Date().toISOString();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        const navbarUsernameElement = document.getElementById('navbar-username');
        if (navbarUsernameElement) {
            navbarUsernameElement.textContent = currentUsername;
            navbarUsernameElement.classList.remove('hidden');
        }
    }

    resetQuizState();
    showContainer(quizContainer);

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto my-8';
    if (quizContainer) quizContainer.innerHTML = '';
    if (quizContainer) quizContainer.appendChild(loadingSpinner);

    setTimeout(() => {
        if (quizContainer && quizContainer.contains(loadingSpinner)) {
            quizContainer.removeChild(loadingSpinner);
        }
        if (typeof getRandomQuestions !== 'function') {
            alert("Error: Question generation function is not available. Quiz cannot start.");
            showContainer(landingPage);
            return;
        }
        currentQuiz = getRandomQuestions(theme, level, 5);

        if (!currentQuiz || currentQuiz.length === 0) {
            alert("No questions available for this theme/level. Please try different options.");
            showContainer(landingPage);
            return;
        }
        showQuestion();
    }, 1000);
}

function showQuestion() {
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.length || !currentQuiz[currentQuestionIndex]) {
        endQuiz();
        return;
    }

    const question = currentQuiz[currentQuestionIndex];
    if (!quizContainer) {
        return;
    }
    stopTimer();

    const escapeHTML = (str) => String(str).replace(/[&<>"']/g, match => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[match]);

    let optionsHTML = '';
    question.options.forEach((option) => {
        optionsHTML += `
            <button class="option-button w-full bg-white text-gray-800 py-3 px-5 rounded-lg border-2 border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md">
                ${escapeHTML(option)}
            </button>
        `;
    });

    const hintButtonDisabled = hintsAvailable === 0 ? 'opacity-50 cursor-not-allowed' : '';
    const skipButtonDisabled = (powerUps.skip || 0) === 0 ? 'opacity-50 cursor-not-allowed' : '';
    const timeFreezeButtonDisabled = (powerUps.timeFreeze || 0) === 0 ? 'opacity-50 cursor-not-allowed' : '';
    const doublePointsButtonDisabled = (powerUps.doublePoints || 0) === 0 ? 'opacity-50 cursor-not-allowed' : '';

    quizContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div id="timer" class="timer text-xl font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">⏱️ Time: ${timeLeft}s</div>
            <div id="score" class="score text-xl font-semibold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-sm">🏆 Score: ${score}</div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
            <div id="progress-bar-inner" class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style="width: 0%;"></div>
        </div>
        <div class="power-ups-section mb-6">
            <h3 class="text-lg font-semibold mb-3 text-center text-gray-700 dark:text-gray-300">Power-ups & Hints</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button id="hint-button" class="power-up-button bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-1 ${hintButtonDisabled}">
                    <span>💡</span><span>Hint (${hintsAvailable})</span>
                </button>
                <button id="skip-button" class="power-up-button bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 flex items-center justify-center space-x-1 ${skipButtonDisabled}">
                    <span>⏩</span><span>Skip (${powerUps.skip || 0})</span>
                </button>
                <button id="time-freeze-button" class="power-up-button bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-1 ${timeFreezeButtonDisabled}">
                    <span>⏸️</span><span>Freeze (${powerUps.timeFreeze || 0})</span>
                </button>
                <button id="double-points-button" class="power-up-button bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center space-x-1 ${doublePointsButtonDisabled}">
                    <span>2️⃣</span><span>2x Pts (${powerUps.doublePoints || 0})</span>
                </button>
            </div>
        </div>
        <div class="question-section mb-6 p-5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
            <div id="question-text-element" class="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">
                ${escapeHTML(question.question)}
            </div>
        </div>
        <div id="options-container-element" class="options-section grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            ${optionsHTML}
        </div>
        <button id="next-question-button-element" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 hidden">
            Next Question
        </button>
    `;

    const optionButtons = quizContainer.querySelectorAll('.option-button');
    optionButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectAnswer(index));
    });

    const hintBtn = document.getElementById('hint-button');
    if (hintBtn && hintsAvailable > 0) hintBtn.addEventListener('click', useHint);
    else if (hintBtn) hintBtn.disabled = true;

    const skipBtn = document.getElementById('skip-button');
    if (skipBtn && (powerUps.skip || 0) > 0) skipBtn.addEventListener('click', useSkip);
    else if (skipBtn) skipBtn.disabled = true;

    const freezeBtn = document.getElementById('time-freeze-button');
    if (freezeBtn && (powerUps.timeFreeze || 0) > 0) freezeBtn.addEventListener('click', useTimeFreeze);
    else if (freezeBtn) freezeBtn.disabled = true;

    const doublePtsBtn = document.getElementById('double-points-button');
    if (doublePtsBtn && (powerUps.doublePoints || 0) > 0) doublePtsBtn.addEventListener('click', useDoublePoints);
    else if (doublePtsBtn) doublePtsBtn.disabled = true;

    const nextBtn = document.getElementById('next-question-button-element');
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', showNextQuestion);
    }

    updateProgressBar();
    startTimer();
}

function updateProgressBar() {
    const progressBarInner = document.getElementById('progress-bar-inner');
    if (progressBarInner && currentQuiz && currentQuiz.length > 0) {
        const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
        progressBarInner.style.width = progress + '%';
    } else if (progressBarInner) {
        progressBarInner.style.width = '0%';
    }
}

function selectAnswer(index) {
    stopTimer();
    const question = currentQuiz[currentQuestionIndex];
    const quizOptionsContainer = document.getElementById('options-container-element');
    if (!quizOptionsContainer) return;
    const buttons = quizOptionsContainer.querySelectorAll('.option-button');

    userAnswers[currentQuestionIndex] = index;
    buttons.forEach(button => button.disabled = true);

    const scoreDisplay = document.getElementById('score');

    if (index === question.correct) {
        buttons[index].classList.add('correct', 'border-green-500', 'ring-green-500');
        buttons[index].classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-800');
        correctAnswers++;

        let pointsEarned = (SCORING && SCORING.BASE_POINTS) || 10;
        let currentQuestionTimeBonus = 0;

        if (SCORING && timeLeft >= SCORING.MIN_TIME_FOR_BONUS) {
            const timeRatio = (timeLeft - SCORING.MIN_TIME_FOR_BONUS) / (15 - SCORING.MIN_TIME_FOR_BONUS);
            currentQuestionTimeBonus = Math.floor(pointsEarned * (SCORING.TIME_BONUS_MULTIPLIER || 0.5) * timeRatio);
        }
        pointsEarned += currentQuestionTimeBonus;
        totalTimeBonus += currentQuestionTimeBonus;

        streak++;
        let currentQuestionStreakBonus = 0;
        if (SCORING && SCORING.STREAK_BONUS) {
            if (streak === 3 && SCORING.STREAK_BONUS[3]) currentQuestionStreakBonus = SCORING.STREAK_BONUS[3];
            else if (streak === 5 && SCORING.STREAK_BONUS[5]) currentQuestionStreakBonus = SCORING.STREAK_BONUS[5];
        }
        pointsEarned += currentQuestionStreakBonus;
        totalStreakBonus += currentQuestionStreakBonus;

        if (isDoublePointsActive) {
            pointsEarned *= 2;
            isDoublePointsActive = false;
            const doublePtsBtn = document.getElementById('double-points-button');
            if (doublePtsBtn) {
                doublePtsBtn.innerHTML = `<span>2️⃣</span><span>2x Pts (${powerUps.doublePoints || 0})</span>`;
                if ((powerUps.doublePoints || 0) === 0) doublePtsBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }

        score += pointsEarned;
        if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score} (+${pointsEarned})`;
        if (sounds && sounds.correct) sounds.correct.play();
        if (streak >= 3) showStreakMessage(streak);

    } else {
        buttons[index].classList.add('wrong', 'border-red-500', 'ring-red-500');
        buttons[index].classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-800');
        if (buttons[question.correct]) {
            buttons[question.correct].classList.add('correct', 'border-green-500');
            buttons[question.correct].classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-800');
        }
        incorrectAnswers++;
        streak = 0;
        if (sounds && sounds.wrong) sounds.wrong.play();
        if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
    }

    const nextBtn = document.getElementById('next-question-button-element');
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', showNextQuestion);
        newNextBtn.classList.remove('hidden');
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

function endQuiz() {
    stopTimer();
    const finalScore = score;
    const accuracy = currentQuiz.length > 0 ? Math.round((correctAnswers / currentQuiz.length) * 100) : 0;
    const timeTakenValue = (currentQuiz.length * 15) - (userAnswers.reduce((acc, _, idx) => acc + (15 - (userAnswers[idx] !== undefined ? timeLeft : 0)), 0));

    if (userProfile.username) {
        userProfile.totalQuizzes = (userProfile.totalQuizzes || 0) + 1;
        userProfile.totalScore = (userProfile.totalScore || 0) + finalScore;
        userProfile.highestScore = Math.max(userProfile.highestScore || 0, finalScore);
        userProfile.averageScore = userProfile.totalQuizzes > 0 ? Math.round(userProfile.totalScore / userProfile.totalQuizzes) : 0;
        userProfile.totalCorrect = (userProfile.totalCorrect || 0) + correctAnswers;
        userProfile.totalIncorrect = (userProfile.totalIncorrect || 0) + incorrectAnswers;
        userProfile.totalStreakBonus = (userProfile.totalStreakBonus || 0) + totalStreakBonus;
        userProfile.totalHintsUsed = (userProfile.totalHintsUsed || 0) + hintsUsed;
        userProfile.totalPowerUpsUsed = (userProfile.totalPowerUpsUsed || 0) + powerUpsUsed;

        const quizTheme = themeSelect ? themeSelect.value : 'unknown';
        const quizLevel = levelSelect ? levelSelect.value : 'unknown';

        userProfile.lastQuiz = {
            score: finalScore,
            correct: correctAnswers,
            incorrect: incorrectAnswers,
            accuracy: accuracy,
            theme: quizTheme,
            level: quizLevel,
            timeTaken: timeTakenValue,
            date: new Date().toISOString()
        };
        userProfile.recentActivity = userProfile.recentActivity || [];
        userProfile.recentActivity.unshift({ type: 'quiz', score: finalScore, theme: quizTheme, level: quizLevel, date: new Date().toISOString() });
        if (userProfile.recentActivity.length > 10) userProfile.recentActivity = userProfile.recentActivity.slice(0, 10);

        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        checkForBadges();
        achievementManager.checkAllAchievements({ 
            type: 'quiz_completed', 
            quizResult: { 
                score: finalScore, 
                correctAnswers: correctAnswers, 
                totalQuestions: currentQuiz.length, 
                accuracy: accuracy 
            }, 
            quizDifficulty: quizLevel.toLowerCase(), 
            quizCategory: quizTheme 
        });

        if (!currentQuizIsChallenge && window.streakManager) { // Modified to use currentQuizIsChallenge
            window.streakManager.incrementStreak();
        }

        if (currentQuizIsChallenge) { // Modified to use currentQuizIsChallenge
            if (window.streakManager) {
                window.streakManager.completeChallenge({
                    score: finalScore,
                    correctAnswers: correctAnswers,
                    incorrectAnswers: incorrectAnswers,
                    accuracy: accuracy,
                    theme: quizTheme,
                    level: quizLevel
                });
            } else {
                console.error('streakManager not available for challenge completion');
            }
        }
    }

    showResultsPage(finalScore, correctAnswers, incorrectAnswers, accuracy, totalTimeBonus, timeTakenValue);
}

function showResultsPage(finalScoreVal, correct, incorrect, acc, timeBonusVal, timeTakenVal) {
    if (finalScoreDisplay) finalScoreDisplay.textContent = String(finalScoreVal);
    if (correctAnswersDisplayResults) correctAnswersDisplayResults.textContent = `${correct}/${currentQuiz.length}`;
    if (accuracyDisplayResults) accuracyDisplayResults.textContent = String(acc) + '%';
    if (totalTimeBonusDisplayResults) totalTimeBonusDisplayResults.textContent = `${timeTakenVal}s`;

    const resultsUsernameSpan = document.getElementById('results-username');
    if (resultsUsernameSpan && userProfile && userProfile.username) {
        resultsUsernameSpan.textContent = userProfile.username;
    } else if (resultsUsernameSpan) {
        resultsUsernameSpan.textContent = "Guest";
    }

    showContainer(resultsPage);
}

function checkForBadges() {
    if (!userProfile || !userProfile.username) return;

    if (!userProfile.achievements) {
        userProfile.achievements = [];
    }

    checkQuizCountBadges();
    checkScoreTotalBadges();
    checkSingleScoreBadges();
    checkSpecialBadges();

    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function checkQuizCountBadges() {
    const quizCount = userProfile.totalQuizzes;

    if (quizCount >= 1 && !userHasBadge('first_quiz')) {
        awardBadge('first_quiz');
    }

    if (quizCount >= 5 && !userHasBadge('quiz_5')) {
        awardBadge('quiz_5');
    }

    if (quizCount >= 10 && !userHasBadge('quiz_10')) {
        awardBadge('quiz_10');
    }

    if (quizCount >= 25 && !userHasBadge('quiz_25')) {
        awardBadge('quiz_25');
    }
}

function checkScoreTotalBadges() {
    const totalScore = userProfile.totalScore;

    if (totalScore >= 100 && !userHasBadge('score_100')) {
        awardBadge('score_100');
    }

    if (totalScore >= 500 && !userHasBadge('score_500')) {
        awardBadge('score_500');
    }

    if (totalScore >= 1000 && !userHasBadge('score_1000')) {
        awardBadge('score_1000');
    }
}

function checkSingleScoreBadges() {
    if (!userProfile.lastQuiz) return;

    const lastQuizScore = userProfile.lastQuiz.score;
    const lastQuizAccuracy = userProfile.lastQuiz.accuracy;

    if (lastQuizAccuracy === 100 && !userHasBadge('perfect_quiz')) {
        awardBadge('perfect_quiz');
    }

    if (lastQuizScore >= 50 && !userHasBadge('high_score_50')) {
        awardBadge(audioWorkletNode('high_score_50'));
    }
}

function checkSpecialBadges() {
    if (!userProfile.lastQuiz) return;

    if (userProfile.lastQuiz.timeTaken && userProfile.lastQuiz.timeTaken <= 270) {
        if (!userHasBadge('speed_demon')) {
            awardBadge('speed_demon');
        }
    }
}

function userHasBadge(badgeId) {
    return userProfile.achievements && userProfile.achievements.includes(badgeId);
}

function awardBadge(badgeId) {
    userProfile.achievements.push(badgeId);

    let badge = null;

    for (const category in BADGES) {
        if (BADGES[category][badgeId]) {
            badge = BADGES[category][badgeId];
            break;
        }
    }

    if (!badge) return;

    userProfile.recentActivity.unshift({
        type: 'achievement',
        date: new Date().toISOString(),
        description: `Earned "${badge.title}" badge!`,
        achievementName: badge.title
    });

    if (userProfile.recentActivity.length > 10) {
        userProfile.recentActivity = userProfile.recentActivity.slice(0, 10);
    }

    showBadgeNotification(badge);
}

function showBadgeNotification(badge) {
    const badgeNotification = document.getElementById('badge-notification');
    if (!badgeNotification) return;

    const badgeEmoji = document.getElementById('badge-emoji');
    const badgeTitle = document.getElementById('badge-title');
    const badgeDescription = document.getElementById('badge-description');    // Play badge sound
    sounds.badge.play().catch(error => console.error("Error playing badge sound:", error));

    badgeEmoji.textContent = badge.emoji;
    badgeTitle.textContent = `New Badge: ${badge.title}`;
    badgeDescription.textContent = badge.description;

    badgeNotification.classList.remove('translate-x-full');

    setTimeout(() => {
        badgeNotification.classList.add('translate-x-full');
    }, 5000);
}

function initializeTheme() {
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const sunIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-15.66l-.707.707M4.04 19.96l-.707.707M21 12h-1M4 12H3m15.66 8.66l-.707-.707M4.04 4.04l-.707-.707" />`;
    const moonIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;

    if (localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-theme');
        if (themeToggleIcon) themeToggleIcon.innerHTML = sunIcon;
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-theme');
        if (themeToggleIcon) themeToggleIcon.innerHTML = moonIcon;
    }
}

function toggleTheme() {
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const sunIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-15.66l-.707.707M4.04 19.96l-.707.707M21 12h-1M4 12H3m15.66 8.66l-.707-.707M4.04 4.04l-.707-.707" />`;
    const moonIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;

    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        if (themeToggleIcon) themeToggleIcon.innerHTML = moonIcon;
    } else {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        if (themeToggleIcon) themeToggleIcon.innerHTML = sunIcon;
    }
    achievementManager.checkAllAchievements({ type: 'theme_changed' });
}

function initializeTabSystem() {
    const quizTabBtn = document.getElementById('quiz-tab-btn');
    const dailyTabBtn = document.getElementById('daily-tab-btn');
    const streakTabBtn = document.getElementById('streak-tab-btn');

    const quizTabContent = document.getElementById('quiz-tab-content');
    const dailyTabContent = document.getElementById('daily-tab-content');
    const streakTabContent = document.getElementById('streak-tab-content');

    if (!quizTabBtn || !dailyTabBtn || !streakTabBtn) return;

    const switchTab = (activeTab, activeContent) => {
        [quizTabBtn, dailyTabBtn, streakTabBtn].forEach(tab => {
            tab.classList.remove('active');
        });

        [quizTabContent, dailyTabContent, streakTabContent].forEach(content => {
            content.classList.add('hidden');
        });

        activeTab.classList.add('active');
        activeContent.classList.remove('hidden');
    };

    quizTabBtn.addEventListener('click', () => switchTab(quizTabBtn, quizTabContent));
    dailyTabBtn.addEventListener('click', () => switchTab(dailyTabBtn, dailyTabContent));
    streakTabBtn.addEventListener('click', () => switchTab(streakTabBtn, streakTabContent));
}

function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 15;
    userAnswers = [];
    streak = 0;
    totalTimeBonus = 0;
    hintsAvailable = 3;
    powerUps = { skip: 1, timeFreeze: 1, doublePoints: 1 };
    correctAnswers = 0;
    incorrectAnswers = 0;
    skippedQuestions = 0;
    hintsUsed = 0;
    powerUpsUsed = 0;
    totalStreakBonus = 0;
    isDoublePointsActive = false;
    stopTimer();
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: 0`;
    const timerDisplay = document.getElementById('timer');
    if(timerDisplay) timerDisplay.textContent = `⏱️ Time: 15s`;
    updateProgressBar();
}

function startTimer() {
    timeLeft = 15;
    const timerDisplay = document.getElementById('timer');
    if (timerDisplay) timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;

    stopTimer(); // Ensure no existing timers are running

    timer = setInterval(() => {
        timeLeft--;
        if (timerDisplay) {
            timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;
            timerDisplay.classList.toggle('text-red-500', timeLeft <= 5); // Visual cue for low time
        }
        if (timeLeft <= 0) {
            stopTimer();
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
    if (sounds && sounds.timeup) sounds.timeup.play();

    incorrectAnswers++;
    streak = 0;

    userAnswers[currentQuestionIndex] = undefined;

    const quizOptionsContainer = document.getElementById('options-container-element');
    if (quizOptionsContainer) {
        const buttons = quizOptionsContainer.querySelectorAll('.option-button');
        buttons.forEach(button => button.disabled = true);

        const question = currentQuiz[currentQuestionIndex];
        if (question && buttons[question.correct]) {
            buttons[question.correct].classList.add('correct', 'border-green-500');
            buttons[question.correct].classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-800');
        }
    }

    const questionElement = document.getElementById('question-text-element');
    if (questionElement) {
        const timeUpMessage = document.createElement('div');
        timeUpMessage.textContent = "Time's up!";
        timeUpMessage.className = 'text-red-500 font-bold mb-2 text-center';
        questionElement.parentNode.insertBefore(timeUpMessage, questionElement);
    }

    const nextBtn = document.getElementById('next-question-button-element');
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', showNextQuestion);
        newNextBtn.classList.remove('hidden');
    }
}

function showStreakMessage(streakCount) {
    const streakElement = document.createElement('div');
    streakElement.textContent = `${streakCount} in a row! Streak bonus!`;
    streakElement.className = 'streak-message fixed top-20 right-5 bg-green-500 text-white p-3 rounded-lg shadow-lg animate-pulse';
    document.body.appendChild(streakElement);
    setTimeout(() => {
        if (document.body.contains(streakElement)) {
            document.body.removeChild(streakElement);
        }
    }, 3000);
}

function useHint() {
    if (hintsAvailable <= 0) return;

    const question = currentQuiz[currentQuestionIndex];
    const incorrectOptions = question.options
        .map((option, index) => ({ option, index }))
        .filter((_, index) => index !== question.correct);

    const optionsToRemove = incorrectOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(item => item.index);

    const buttons = document.querySelectorAll('.option-button');
    buttons.forEach((button, index) => {
        if (optionsToRemove.includes(index)) {
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    hintsAvailable--;
    hintsUsed++;
    score = Math.max(0, score - PENALTIES.HINT);

    const hintBtn = document.getElementById('hint-button');
    if (hintBtn) {
        hintBtn.innerHTML = `<span>💡</span><span>Hint (${hintsAvailable})</span>`;
        if (hintsAvailable === 0) {
            hintBtn.disabled = true;
            hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
}

function useSkip() {
    if (powerUps.skip <= 0) return;

    powerUps.skip--;
    powerUpsUsed++;
    skippedQuestions++;
    score = Math.max(0, score - PENALTIES.SKIP);

    const skipBtn = document.getElementById('skip-button');
    if (skipBtn) {
        skipBtn.innerHTML = `<span>⏩</span><span>Skip (${powerUps.skip})</span>`;
        if (powerUps.skip === 0) {
            skipBtn.disabled = true;
            skipBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;

    showNextQuestion();
}

function useTimeFreeze() {
    if (powerUps.timeFreeze <= 0) return;

    powerUps.timeFreeze--;
    powerUpsUsed++;
    score = Math.max(0, score - PENALTIES.TIME_FREEZE);

    timeLeft += 10;
    const timerDisplay = document.getElementById('timer');
    if (timerDisplay) timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;

    const freezeBtn = document.getElementById('time-freeze-button');
    if (freezeBtn) {
        freezeBtn.innerHTML = `<span>⏸️</span><span>Freeze (${powerUps.timeFreeze})</span>`;
        if (powerUps.timeFreeze === 0) {
            freezeBtn.disabled = true;
            freezeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
}

function useDoublePoints() {
    if (powerUps.doublePoints <= 0) return;

    powerUps.doublePoints--;
    powerUpsUsed++;
    score = Math.max(0, score - PENALTIES.DOUBLE_POINTS);
    isDoublePointsActive = true;

    const doublePtsBtn = document.getElementById('double-points-button');
    if (doublePtsBtn) {
        doublePtsBtn.innerHTML = `<span>2️⃣</span><span>2x Pts (${powerUps.doublePoints})</span>`;
        if (powerUps.doublePoints === 0) {
            doublePtsBtn.disabled = true;
            doublePtsBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    initializeTheme();
    loadUserProfile();
    initializeTabSystem();

    // Check for challenge parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isChallenge = urlParams.get('challenge') === 'true';
    const challengeTheme = urlParams.get('theme');
    const challengeLevel = urlParams.get('level');

    // Function to handle starting a challenge quiz
    const startChallengeQuiz = () => {
        if (isChallenge && challengeTheme && challengeLevel) {
            // Start the daily challenge quiz directly
            console.log("Starting challenge quiz with theme:", challengeTheme, "and level:", challengeLevel);
            
            // Mark the challenge as active in streakManager
            if (window.streakManager && window.streakManager.streakData) {
                window.streakManager.streakData.challengeStatus = 'active';
                window.streakManager.saveStreakData();
            }
            
            startQuizCore(challengeTheme, challengeLevel);
        } else if (landingPage) {
            showContainer(landingPage);
        } else {
            console.error("Landing page element not found. Cannot show initial container.");
            document.body.style.display = 'block';
        }
    };

    // Check if streakManager is already initialized
    if (window.streakManager) {
        startChallengeQuiz();
    } else {
        // Wait for streakManager to be initialized
        let checkCounter = 0;
        const maxChecks = 10;
        const checkInterval = setInterval(() => {
            if (window.streakManager || checkCounter >= maxChecks) {
                clearInterval(checkInterval);
                startChallengeQuiz();
            }
            checkCounter++;
        }, 100);
    }
});