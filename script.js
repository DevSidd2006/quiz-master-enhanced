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
let timeBonus = 0; // This seems to be for a single question
let totalTimeBonus = 0; // Accumulates timeBonus over the quiz
let hintsAvailable = 3;
let powerUps = { skip: 1, timeFreeze: 1, doublePoints: 1 };
let correctAnswers = 0;
let incorrectAnswers = 0;
let skippedQuestions = 0;
let hintsUsed = 0;
let powerUpsUsed = 0;
let totalStreakBonus = 0;

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
let userProfile = {
    username: '',
    email: '', // Added for registration
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
    HINT: 5,     // 5 points penalty per hint used
    SKIP: 10,    // 10 points penalty per skip
    TIME_FREEZE: 10, // 10 points penalty per time freeze
    DOUBLE_POINTS: 10 // 10 points penalty per double points used
};

// DOM Elements
let landingPage;
let quizContainer;
let rulesContainer;
let resultsPage;
let profileModal; // Was profilePage, renamed for clarity as it's a modal in index.html
let registrationModal;

let themeSelect; // Existing
let levelSelect; // Existing
let usernameInput; // For landing page username

// Buttons
let startQuizButton; // Existing
let understandButton; // For rules page
let viewProfileButton; // Navbar profile button
let closeProfileModalButton;
let playAgainButtonResults;
let closeRegistrationModalButton;
let registrationForm;
let themeToggle; // Existing

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

// Elements dynamically created/referenced within showQuestion
// let questionElement;
// let optionsElement;
// let nextButton;
// let scoreElement; // For quiz score display
// let timerElement; // For quiz timer display

let isDoublePointsActive = false; // Flag for double points power-up

// Initialize DOM elements
function initializeDOMElements() {
    landingPage = document.getElementById('landing-page');
    quizContainer = document.getElementById('quiz-container');
    rulesContainer = document.getElementById('rules-container');
    resultsPage = document.getElementById('results-page');
    profileModal = document.getElementById('profile-page'); // This is the modal container
    registrationModal = document.getElementById('registration-modal');

    themeSelect = document.getElementById('theme');
    levelSelect = document.getElementById('level');
    usernameInput = document.getElementById('username');
    startQuizButton = document.getElementById('start-quiz');
    themeToggle = document.getElementById('theme-toggle');

    understandButton = document.getElementById('understand-button');
    viewProfileButton = document.getElementById('view-profile-btn'); // This ID should match the one in results page if it's the same button
    closeProfileModalButton = document.getElementById('close-profile-modal-button');
    playAgainButtonResults = document.getElementById('restart-quiz'); // Corrected ID from HTML
    closeRegistrationModalButton = document.getElementById('close-modal'); // Corrected ID from HTML for registration modal close
    registrationForm = document.getElementById('registration-form');
    usernameRegistrationInput = document.getElementById('reg-username'); // Corrected ID from HTML
    emailRegistrationInput = document.getElementById('reg-email'); // Corrected ID from HTML

    finalScoreDisplay = document.getElementById('final-score'); // Corrected ID from HTML
    correctAnswersDisplayResults = document.getElementById('correct-answers'); // Corrected ID from HTML
    accuracyDisplayResults = document.getElementById('accuracy'); // Corrected ID from HTML
    totalTimeBonusDisplayResults = document.getElementById('time-taken'); // This was time-taken, assuming it's for time bonus or total time

    // Profile modal elements might need to be re-verified if profile.html was changed significantly
    // For now, assuming these IDs are within a modal structure in index.html if profile page is merged
    profileUsernameDisplay = document.getElementById('profile-username-display'); // Example ID, ensure it exists
    profileMemberSinceDisplay = document.getElementById('profile-member-since-display'); // Example ID
    profileTotalQuizzesDisplay = document.getElementById('profile-total-quizzes-display'); // Example ID
    profileHighestScoreDisplay = document.getElementById('profile-highest-score-display'); // Example ID
    profileAverageScoreDisplay = document.getElementById('profile-average-score-display'); // Example ID

    if (startQuizButton) {
        startQuizButton.addEventListener('click', showRulesBeforeQuiz);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme); 
    }
    if (viewProfileButton) { // This button is on the results page
        viewProfileButton.addEventListener('click', () => {
            // Assuming profile.html is a separate page, redirect
            window.location.href = 'profile.html'; 
            // If profile is a modal within index.html, use loadAndShowProfileModal();
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

    const registerButton = document.getElementById('register-button'); // Get register button from modal
    if (registerButton) {
        registerButton.addEventListener('click', handleUserRegistration); // Changed form submit to button click
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
    // Modals (profileModal, registrationModal) are handled separately
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
    const navbarUsernameElement = document.getElementById('navbar-username'); // Corrected ID from HTML

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
            registrationModal.style.display = 'block'; // Show modal using style.display
        }
        if (navbarUsernameElement) {
            navbarUsernameElement.classList.add('hidden');
        }
    }
}

function handleUserRegistration(event) {
    // event.preventDefault(); // Not needed if not a form submit event
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
        const navbarUsernameElement = document.getElementById('navbar-username'); // Corrected ID
        if (navbarUsernameElement) {
            navbarUsernameElement.textContent = username;
            navbarUsernameElement.classList.remove('hidden');
        }

        if (registrationModal) registrationModal.style.display = 'none';
        alert('Welcome, ' + username + '!');
    } else {
        alert('Please enter both username and email.');
    }
}

// Removed loadAndShowProfileModal and updateProfileModalDisplay as profile is a separate page

// Removed all Leaderboard Functions (initializeLeaderboard, saveLeaderboard, addScoreToLeaderboard, updateLeaderboardDisplay, resetLeaderboard)

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

function startQuizCore(theme, level) {
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
        
        const navbarUsernameElement = document.getElementById('navbar-username'); // Corrected ID
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

// ... (showQuestion function remains largely the same, ensure power-up button IDs match if changed)
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
    if (nextBtn) nextBtn.addEventListener('click', showNextQuestion);

    updateProgressBar();
    startTimer(); 
}

// ... (updateProgressBar function remains the same)
function updateProgressBar() {
    const progressBarInner = document.getElementById('progress-bar-inner');
    if (progressBarInner && currentQuiz && currentQuiz.length > 0) {
        const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
        progressBarInner.style.width = progress + '%';
    } else if (progressBarInner) {
        progressBarInner.style.width = '0%';
    }
}

// ... (selectAnswer function remains largely the same)
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
    if (nextBtn) nextBtn.classList.remove('hidden');
}

// ... (showNextQuestion function remains the same)
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
    const timeTakenValue = (currentQuiz.length * 15) - (userAnswers.reduce((acc, _, idx) => acc + (15 - (userAnswers[idx] !== undefined ? timeLeft : 0)), 0)); // Simplified time taken, needs refinement

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
            date: new Date().toISOString()
        };
        userProfile.recentActivity = userProfile.recentActivity || [];
        userProfile.recentActivity.unshift({ type: 'quiz', score: finalScore, theme: quizTheme, level: quizLevel, date: new Date().toISOString() });
        if (userProfile.recentActivity.length > 20) userProfile.recentActivity = userProfile.recentActivity.slice(0, 20);
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    showResultsPage(finalScore, correctAnswers, incorrectAnswers, accuracy, totalTimeBonus, timeTakenValue);
}

function showResultsPage(finalScoreVal, correct, incorrect, acc, timeBonusVal, timeTakenVal) {
    if (finalScoreDisplay) finalScoreDisplay.textContent = String(finalScoreVal);
    if (correctAnswersDisplayResults) correctAnswersDisplayResults.textContent = `${correct}/${currentQuiz.length}`; // Show as X/Y
    // incorrectAnswersDisplayResults is not a separate element in the current HTML structure for results
    if (accuracyDisplayResults) accuracyDisplayResults.textContent = String(acc) + '%';
    // The element 'time-taken' was used for totalTimeBonusDisplayResults. Assuming it should show time taken.
    if (totalTimeBonusDisplayResults) totalTimeBonusDisplayResults.textContent = `${timeTakenVal}s`; // Display time taken
    // If you want to show time bonus separately, you'll need another element in HTML and update here.

    const resultsUsernameSpan = document.getElementById('results-username');
    if (resultsUsernameSpan && userProfile && userProfile.username) {
        resultsUsernameSpan.textContent = userProfile.username;
    } else if (resultsUsernameSpan) {
        resultsUsernameSpan.textContent = "Guest"; // Fallback if username is not found
    }

    showContainer(resultsPage);
}

// ... (Power-up functions useHint, useSkip, useTimeFreeze, useDoublePoints remain largely the same)
function useHint() {
    if (hintsAvailable > 0) {
        hintsAvailable--;
        hintsUsed++;
        if (PENALTIES && PENALTIES.HINT) score -= PENALTIES.HINT;
        
        const scoreDisplay = document.getElementById('score');
        if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
        
        const question = currentQuiz[currentQuestionIndex];
        const optionsContainer = document.getElementById('options-container-element');
        if (optionsContainer) {
            const optionButtons = optionsContainer.querySelectorAll('.option-button:not(:disabled)');
            let wrongOptions = [];
            optionButtons.forEach((btn, idx) => {
                // Assuming options are indexed 0, 1, 2, 3 and question.correct is the index of correct answer
                const optionText = btn.textContent.trim();
                if (optionText !== question.options[question.correct]) wrongOptions.push(btn);
            });

            // Remove two wrong options
            let removedCount = 0;
            while(removedCount < 2 && wrongOptions.length > 0){
                const randomIndex = Math.floor(Math.random() * wrongOptions.length);
                const btnToDisable = wrongOptions.splice(randomIndex, 1)[0];
                if(btnToDisable){ // Check if button exists
                    btnToDisable.classList.add('opacity-50', 'pointer-events-none', 'bg-gray-300', 'dark:bg-gray-600');
                    btnToDisable.disabled = true;
                    removedCount++;
                }
            }
        }
        
        const hintBtn = document.getElementById('hint-button');
        if (hintBtn) {
            hintBtn.innerHTML = `<span>💡</span><span>Hint (${hintsAvailable})</span>`;
            if (hintsAvailable === 0) {
                hintBtn.classList.add('opacity-50', 'cursor-not-allowed');
                hintBtn.disabled = true;
            }
        }
    }
}

function useSkip() {
    if (powerUps.skip > 0) {
        powerUps.skip--;
        powerUpsUsed++;
        skippedQuestions++;
        if (PENALTIES && PENALTIES.SKIP) score -= PENALTIES.SKIP;

        const scoreDisplay = document.getElementById('score');
        if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
        
        stopTimer();
        showNextQuestion();
        
        const skipBtn = document.getElementById('skip-button');
        if (skipBtn) {
            skipBtn.innerHTML = `<span>⏩</span><span>Skip (${powerUps.skip})</span>`;
            if (powerUps.skip === 0) {
                skipBtn.classList.add('opacity-50', 'cursor-not-allowed');
                skipBtn.disabled = true;
            }
        }
    }
}

function useTimeFreeze() {
    if (powerUps.timeFreeze > 0) {
        powerUps.timeFreeze--;
        powerUpsUsed++;
        if (PENALTIES && PENALTIES.TIME_FREEZE) score -= PENALTIES.TIME_FREEZE;
        
        const scoreDisplay = document.getElementById('score');
        if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
        
        timeLeft += 10; // Add 10 seconds to the current timer
        const timerDisplay = document.getElementById('timer');
        if(timerDisplay) timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;
        // Timer continues, just with more time. No need to stop and restart unless specific behavior is desired.
        alert("10 seconds added to the timer!");

        const freezeBtn = document.getElementById('time-freeze-button');
        if (freezeBtn) {
            freezeBtn.innerHTML = `<span>⏸️</span><span>Freeze (${powerUps.timeFreeze})</span>`;
            if (powerUps.timeFreeze === 0) {
                freezeBtn.classList.add('opacity-50', 'cursor-not-allowed');
                freezeBtn.disabled = true;
            }
        }
    }
}

function useDoublePoints() {
     if (powerUps.doublePoints > 0) {
        powerUps.doublePoints--;
        powerUpsUsed++;
        if (PENALTIES && PENALTIES.DOUBLE_POINTS) score -= PENALTIES.DOUBLE_POINTS; 
        
        const scoreDisplay = document.getElementById('score');
        if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: ${score}`;
        
        isDoublePointsActive = true;
        alert("Double Points activated for the next correct answer!");

        const doublePtsBtn = document.getElementById('double-points-button');
        if (doublePtsBtn) {
            doublePtsBtn.innerHTML = `<span>2️⃣</span><span>2x Pts (${powerUps.doublePoints})</span>`;
            if (powerUps.doublePoints === 0) {
                doublePtsBtn.classList.add('opacity-50', 'cursor-not-allowed');
                doublePtsBtn.disabled = true;
            }
        }
    }
}

// Theme toggle functions
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
}

// Utility functions (resetQuizState, startTimer, stopTimer, handleTimeUp, showStreakMessage)
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
    // Reset UI elements if necessary (e.g., progress bar, score display on quiz page)
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.textContent = `🏆 Score: 0`;
    const timerDisplay = document.getElementById('timer');
    if(timerDisplay) timerDisplay.textContent = `⏱️ Time: 15s`;
    updateProgressBar(); 
}

function startTimer() {
    timeLeft = 15;
    const timerDisplay = document.getElementById('timer');
    if(timerDisplay) timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.textContent = `⏱️ Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            stopTimer();
            handleTimeUp();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function handleTimeUp() {
    if (sounds && sounds.timeup) sounds.timeup.play();
    // Mark question as incorrect or skipped due to time up
    incorrectAnswers++; // Or a new category like timeOutAnswers
    streak = 0;
    
    const quizOptionsContainer = document.getElementById('options-container-element');
    if (quizOptionsContainer) {
        const buttons = quizOptionsContainer.querySelectorAll('.option-button');
        buttons.forEach(button => button.disabled = true);
        // Optionally show correct answer
        const question = currentQuiz[currentQuestionIndex];
        if (buttons[question.correct]) {
            buttons[question.correct].classList.add('correct', 'border-green-500');
        }
    }
    
    const nextBtn = document.getElementById('next-question-button-element');
    if (nextBtn) nextBtn.classList.remove('hidden');
    // alert("Time's up!"); // Optional alert
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


document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    initializeTheme(); 
    loadUserProfile(); 
    // Removed initializeLeaderboard call
    
    if (landingPage) {
        showContainer(landingPage);
    } else {
        console.error("Landing page element not found. Cannot show initial container.");
        document.body.style.display = 'block';
    }
});