// Streak and Daily Challenges Management
import badgeManager from './badges.js';
import { BADGES } from './script.js';

// Constants for streak and challenges
const STREAK_CONFIG = {
    MIN_DAYS_BETWEEN_ACTIVITIES: 20,
    MAX_DAYS_MISSED: 1,
    STREAK_EXPIRY: 48,
    POINTS_PER_STREAK_DAY: 5,
    DAILY_CHALLENGE_POINTS: 50
};

// Challenge difficulty levels
const DIFFICULTY_LEVELS = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard'
};

// Challenge categories (matching quiz themes)
const CHALLENGE_CATEGORIES = [
    'Science',
    'History',
    'Geography',
    'Entertainment',
    'Sports',
    'Art & Literature',
    'Technology'
];

// Streak Manager Class
class StreakManager {
    constructor() {
        this.loadStreakData();
        this.checkDailyReset();
        this.generateDailyChallenge();
        this.initUI();
        this.updateChallengeUI(); // Ensure UI is updated on init
    }

    loadStreakData() {
        const savedData = localStorage.getItem('streakData');
        if (savedData) {
            this.streakData = JSON.parse(savedData);
        } else {
            this.streakData = {
                currentStreak: 0,
                highestStreak: 0,
                lastActivity: null,
                challengeHistory: [],
                streakDates: [],
                completedChallenges: [],
                currentChallenge: null,
                challengeStatus: 'pending',
                lastChallengeStartDate: null // Track last attempt date
            };
            this.saveStreakData();
        }
    }

    saveStreakData() {
        localStorage.setItem('streakData', JSON.stringify(this.streakData));
    }

    initUI() {
        const currentStreakEl = document.getElementById('current-streak');
        if (currentStreakEl) {
            currentStreakEl.textContent = this.streakData.currentStreak;
        }

        if (document.getElementById('streak-calendar')) {
            this.renderStreakCalendar();
        }

        if (document.getElementById('challenge-status')) {
            this.updateChallengeUI();
        }
        
        // Set up event listeners for challenge buttons with debugging logs
        const startChallengeBtn = document.getElementById('start-challenge-btn');
        if (startChallengeBtn) {
            const newStartChallengeBtn = startChallengeBtn.cloneNode(true);
            startChallengeBtn.parentNode.replaceChild(newStartChallengeBtn, startChallengeBtn);
            
            // Add event listener with debugging
            newStartChallengeBtn.addEventListener('click', () => {
                console.log("Start Challenge button clicked - initiating challenge");
                this.startChallenge();
            });
            
            // Make sure button has necessary classes for animation
            if (!newStartChallengeBtn.classList.contains('transition-all')) {
                newStartChallengeBtn.classList.add('transition-all', 'duration-300', 'transform', 'hover:scale-105');
            }
        }

        const startChallengeFromHomeBtn = document.getElementById('start-challenge-from-home');
        if (startChallengeFromHomeBtn) {
            const newStartChallengeBtn = startChallengeFromHomeBtn.cloneNode(true);
            startChallengeFromHomeBtn.parentNode.replaceChild(newStartChallengeBtn, startChallengeFromHomeBtn);
            
            // Add event listener with debugging
            newStartChallengeBtn.addEventListener('click', () => {
                console.log("Home Challenge button clicked - initiating challenge");
                this.startChallenge();
            });
            
            // Make sure button has necessary classes for animation
            if (!newStartChallengeBtn.classList.contains('transition-all')) {
                newStartChallengeBtn.classList.add('transition-all', 'duration-300', 'transform', 'hover:scale-105');
            }
        }

        const streakTab = document.getElementById('streak-tab');
        if (streakTab) {
            this.updateStreakTabUI();
        }
    }

    checkDailyReset() {
        const now = new Date();
        const lastActivity = this.streakData.lastActivity ? new Date(this.streakData.lastActivity) : null;

        if (!lastActivity) {
            return;
        }

        const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);

        if (hoursSinceLastActivity > STREAK_CONFIG.STREAK_EXPIRY) {
            this.resetStreak();
            return;
        }

        const isNewDay = now.toDateString() !== lastActivity.toDateString();
        if (isNewDay) {
            this.generateDailyChallenge();
        }
    }

    resetStreak() {
        this.streakData.currentStreak = 0;
        this.streakData.streakDates = [];
        this.streakData.challengeStatus = 'pending';
        this.saveStreakData();

        const currentStreakEl = document.getElementById('current-streak');
        if (currentStreakEl) {
            currentStreakEl.textContent = '0';
        }
    }

    incrementStreak() {
        const today = new Date().toISOString().split('T')[0];

        if (this.streakData.streakDates.includes(today)) {
            return;
        }

        this.streakData.currentStreak++;
        this.streakData.streakDates.push(today);
        this.streakData.lastActivity = new Date().toISOString();

        if (this.streakData.currentStreak > this.streakData.highestStreak) {
            this.streakData.highestStreak = this.streakData.currentStreak;
        }

        this.saveStreakData();
        badgeManager.checkForStreakBadges(this.streakData.currentStreak);

        this.updateAllUI();
    }

    generateDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];

        if (this.streakData.currentChallenge &&
            this.streakData.currentChallenge.date === today) {
            return;
        }

        const difficulty = this.getRandomDifficulty();
        const category = this.getRandomCategory();
        const type = Math.random() > 0.5 ? 'accuracy' : 'score';
        let threshold;
        if (type === 'accuracy') {
            threshold = this.getDifficultyThreshold(difficulty);
        } else {
            switch(difficulty) {
                case DIFFICULTY_LEVELS.EASY:
                    threshold = 10;
                    break;
                case DIFFICULTY_LEVELS.MEDIUM:
                    threshold = 20;
                    break;
                case DIFFICULTY_LEVELS.HARD:
                    threshold = 30;
                    break;
                default:
                    threshold = 10;
            }
        }

        this.streakData.currentChallenge = {
            id: `challenge-${today}-${Math.floor(Math.random() * 1000)}`,
            date: today,
            type: type,
            category: category,
            difficulty: difficulty,
            threshold: threshold,
            description: this.generateChallengeDescription(category, difficulty, threshold)
        };

        this.streakData.challengeStatus = 'pending';
        this.saveStreakData();
    }

    generateChallengeDescription(category, difficulty, threshold) {
        const challenge = this.streakData.currentChallenge;
        if (challenge.type === 'accuracy') {
            return `Complete a quiz in the "${category}" category with at least ${threshold}% accuracy.`;
        } else {
            return `Score at least ${threshold} points in a "${category}" ${difficulty} quiz.`;
        }
    }

    getRandomDifficulty() {
        const difficulties = [
            DIFFICULTY_LEVELS.EASY,
            DIFFICULTY_LEVELS.MEDIUM,
            DIFFICULTY_LEVELS.HARD
        ];
        return difficulties[Math.floor(Math.random() * difficulties.length)];
    }

    getRandomCategory() {
        return CHALLENGE_CATEGORIES[Math.floor(Math.random() * CHALLENGE_CATEGORIES.length)];
    }

    getDifficultyThreshold(difficulty) {
        switch(difficulty) {
            case DIFFICULTY_LEVELS.EASY:
                return Math.floor(Math.random() * 10) + 70;
            case DIFFICULTY_LEVELS.MEDIUM:
                return Math.floor(Math.random() * 10) + 80;
            case DIFFICULTY_LEVELS.HARD:
                return Math.floor(Math.random() * 10) + 90;
            default:
                return 80;
        }
    }

    startChallenge() {
        console.log("Starting challenge...");
        const today = new Date().toISOString().split('T')[0];
        if (this.streakData.lastChallengeStartDate === today) {
            alert("You can only attempt the daily challenge once per day.");
            return;
        }
        if (!this.streakData.currentChallenge) {
            this.generateDailyChallenge();
        }
        if (!this.streakData.currentChallenge) {
            console.error("Failed to create a challenge");
            alert("Could not start challenge. Please try again later.");
            return;
        }
        this.streakData.lastChallengeStartDate = today;
        this.streakData.challengeStatus = 'active';
        this.saveStreakData();
        console.log("Challenge details:", this.streakData.currentChallenge);
        const challenge = this.streakData.currentChallenge;
        window.location.href = `index.html?challenge=true&theme=${encodeURIComponent(challenge.category)}&level=${encodeURIComponent(challenge.difficulty.toLowerCase())}`;
    }

    completeChallenge(result) {
        console.log("Completing challenge with result:", result);
        const challenge = this.streakData.currentChallenge;

        if (!challenge || this.streakData.challengeStatus !== 'active') {
            console.error("No active challenge to complete");
            return false;
        }

        let success = false;
        if (challenge.type === 'accuracy') {
            const accuracy = result.accuracy; // Percentage from script.js
            success = accuracy >= challenge.threshold;
        } else {
            success = result.score >= challenge.threshold;
        }

        // Award points for attempting the daily quiz
        const pointsForAttempt = STREAK_CONFIG.DAILY_CHALLENGE_POINTS;
        const userProfileStr = localStorage.getItem('userProfile');
        if (userProfileStr) {
            const userProfile = JSON.parse(userProfileStr);
            userProfile.totalScore = (userProfile.totalScore || 0) + pointsForAttempt;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }

        // Record the challenge attempt
        this.streakData.challengeHistory.push({
            ...challenge,
            completed: success,
            result: {
                score: result.score,
                accuracy: result.accuracy
            },
            pointsAwarded: pointsForAttempt
        });

        this.streakData.challengeStatus = success ? 'completed' : 'failed';
        this.saveStreakData();
        this.updateChallengeUI();
        return success;
    }
    
    updateChallengeUI() {
        const startBtn = document.getElementById('start-challenge-btn');
        const startChallengeFromHomeBtn = document.getElementById('start-challenge-from-home');
        const challengeDesc = document.getElementById('challenge-description');
        const challengeTabDesc = document.getElementById('challenge-tab-description');
        const today = new Date().toISOString().split('T')[0];
        const challengeStatus = document.getElementById('challenge-status');
        const challengeTabStatus = document.getElementById('challenge-tab-status');
        const challengeDifficulty = document.getElementById('challenge-difficulty');
        const challengeTabDifficulty = document.getElementById('challenge-tab-difficulty');

        // Update challenge description
        if (this.streakData.currentChallenge) {
            if (challengeDesc) {
                challengeDesc.textContent = this.streakData.currentChallenge.description;
            }
            if (challengeTabDesc) {
                challengeTabDesc.textContent = this.streakData.currentChallenge.description;
            }
            if (challengeDifficulty && this.streakData.currentChallenge.difficulty) {
                challengeDifficulty.textContent = this.streakData.currentChallenge.difficulty;
            }
            if (challengeTabDifficulty && this.streakData.currentChallenge.difficulty) {
                challengeTabDifficulty.textContent = this.streakData.currentChallenge.difficulty;
            }
        }

        if (this.streakData.lastChallengeStartDate === today) {
            if (startBtn) {
                // Update button with icon and text
                startBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Challenge Attempted
                `;
                startBtn.disabled = true;
                startBtn.classList.add('opacity-70', 'cursor-not-allowed', 'bg-gray-500');
                startBtn.classList.remove('from-indigo-500', 'to-purple-500', 'hover:from-indigo-600', 'hover:to-purple-600', 'hover:scale-105');
            }
            if (startChallengeFromHomeBtn) {
                // Update button with icon and text
                startChallengeFromHomeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Challenge Attempted
                `;
                startChallengeFromHomeBtn.disabled = true;
                startChallengeFromHomeBtn.classList.add('opacity-70', 'cursor-not-allowed', 'bg-gray-500');
                startChallengeFromHomeBtn.classList.remove('from-amber-500', 'to-orange-500', 'hover:from-amber-600', 'hover:to-orange-600', 'hover:scale-105');
            }
            
            // Update status indicators if they exist
            if (challengeStatus) {
                challengeStatus.textContent = 'Attempted';
                challengeStatus.classList.remove('bg-yellow-100', 'text-yellow-800');
                challengeStatus.classList.add('bg-blue-100', 'text-blue-800');
            }
            if (challengeTabStatus) {
                challengeTabStatus.textContent = 'Attempted';
                challengeTabStatus.classList.remove('bg-yellow-100', 'text-yellow-800');
                challengeTabStatus.classList.add('bg-blue-100', 'text-blue-800');
            }
        } else {
            const buttonText = this.getButtonText();
            if (startBtn) {
                // Restore button with original styling and icon
                startBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    ${buttonText}
                `;
                startBtn.disabled = false;
                startBtn.classList.remove('opacity-70', 'cursor-not-allowed', 'bg-gray-500');
                startBtn.classList.add('from-indigo-500', 'to-purple-500', 'hover:from-indigo-600', 'hover:to-purple-600', 'hover:scale-105');
            }
            if (startChallengeFromHomeBtn) {
                // Restore button with original styling and icon
                startChallengeFromHomeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    ${buttonText}
                `;
                startChallengeFromHomeBtn.disabled = false;
                startChallengeFromHomeBtn.classList.remove('opacity-70', 'cursor-not-allowed', 'bg-gray-500');
                startChallengeFromHomeBtn.classList.add('from-amber-500', 'to-orange-500', 'hover:from-amber-600', 'hover:to-orange-600', 'hover:scale-105');
            }
            
            // Update status indicators
            if (challengeStatus) {
                challengeStatus.textContent = 'Pending';
                challengeStatus.classList.remove('bg-blue-100', 'text-blue-800');
                challengeStatus.classList.add('bg-yellow-100', 'text-yellow-800');
            }
            if (challengeTabStatus) {
                challengeTabStatus.textContent = 'Pending';
                challengeTabStatus.classList.remove('bg-blue-100', 'text-blue-800');
                challengeTabStatus.classList.add('bg-yellow-100', 'text-yellow-800');
            }
        }
    }

    getButtonText() {
        switch(this.streakData.challengeStatus) {
            case 'pending':
                return 'Accept Challenge';
            case 'active':
                return 'Continue Challenge';
            case 'completed':
                return 'Challenge Completed';
            case 'failed':
                return 'Challenge Failed';
            default:
                return 'Accept Challenge';
        }
    }

    // Placeholder methods assumed from original code
    renderStreakCalendar() {
        // Implementation for rendering streak calendar
        console.log("Rendering streak calendar...");
    }

    updateStreakTabUI() {
        // Implementation for updating streak tab UI
        console.log("Updating streak tab UI...");
    }

    checkForStreakBadges() {
        // Implementation for checking streak badges
        console.log("Checking for streak badges...");
    }

    updateAllUI() {
        this.initUI(); // Simple implementation to update all UI
    }
}

// Initialize streak manager
let streakManager;

document.addEventListener('DOMContentLoaded', () => {
    streakManager = new StreakManager();
    window.streakManager = streakManager;
});
