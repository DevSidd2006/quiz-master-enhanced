// Streak and Daily Challenges Management
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
        this.generateDailyChallenge(); // Ensure challenge is generated on init
        this.initUI();
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
                challengeStatus: 'pending'
            };
            this.saveStreakData();
        }
    }

    saveStreakData() {
        localStorage.setItem('streakData', JSON.stringify(this.streakData));
    }

    initUI() {
        console.log('Initializing UI for StreakManager');
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

        const startChallengeBtn = document.getElementById('start-challenge-btn');
        if (startChallengeBtn) {
            const newStartChallengeBtn = startChallengeBtn.cloneNode(true);
            startChallengeBtn.parentNode.replaceChild(newStartChallengeBtn, startChallengeBtn);
            newStartChallengeBtn.addEventListener('click', () => {
                console.log('Challenge button clicked on challenges page');
                this.startChallenge();
            });
        }

        const startChallengeFromHomeBtn = document.getElementById('start-challenge-from-home');
        if (startChallengeFromHomeBtn) {
            console.log('Attaching listener to start-challenge-from-home');
            const newStartChallengeBtn = startChallengeFromHomeBtn.cloneNode(true);
            startChallengeFromHomeBtn.parentNode.replaceChild(newStartChallengeBtn, startChallengeFromHomeBtn);
            newStartChallengeBtn.addEventListener('click', () => {
                console.log('Challenge button clicked from home page');
                this.startChallenge();
            });
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
            console.log('Streak already incremented for today:', today);
            return;
        }

        this.streakData.currentStreak++;
        this.streakData.streakDates.push(today);
        this.streakData.lastActivity = new Date().toISOString();

        if (this.streakData.currentStreak > this.streakData.highestStreak) {
            this.streakData.highestStreak = this.streakData.currentStreak;
        }

        this.saveStreakData();
        this.checkForStreakBadges();

        this.updateAllUI();
        console.log('Streak incremented:', this.streakData.currentStreak);
    }

    generateDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        console.log('Generating daily challenge for:', today);

        // Avoid overwriting an existing challenge for today
        if (this.streakData.currentChallenge && this.streakData.currentChallenge.date === today) {
            console.log('Existing challenge found for today:', this.streakData.currentChallenge);
            return;
        }

        const difficulty = this.getRandomDifficulty();
        const category = this.getRandomCategory();
        const threshold = this.getDifficultyThreshold(difficulty);

        this.streakData.currentChallenge = {
            id: `challenge-${today}-${Math.floor(Math.random() * 1000)}`,
            date: today,
            type: Math.random() > 0.5 ? 'accuracy' : 'score',
            category: category,
            difficulty: difficulty,
            threshold: threshold,
            description: this.generateChallengeDescription(category, difficulty, threshold)
        };

        this.streakData.challengeStatus = 'pending';
        this.saveStreakData();
        console.log('New challenge generated:', this.streakData.currentChallenge);

        if (document.getElementById('challenge-description')) {
            this.updateChallengeUI();
        }
    }

    generateChallengeDescription(category, difficulty, threshold) {
        const challenge = this.streakData.currentChallenge || { type: 'accuracy' };
        const type = challenge.type || (Math.random() > 0.5 ? 'accuracy' : 'score');

        if (type === 'accuracy') {
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

        // Ensure a challenge exists
        if (!this.streakData.currentChallenge) {
            console.warn("No current challenge, regenerating...");
            this.generateDailyChallenge();
        }

        if (!this.streakData.currentChallenge) {
            console.error("Failed to create a challenge");
            alert("Could not start challenge. Please try again later.");
            return;
        }

        this.streakData.challengeStatus = 'active';
        this.saveStreakData();

        const challenge = this.streakData.currentChallenge;
        console.log("Challenge details:", {
            id: challenge.id,
            category: challenge.category,
            difficulty: challenge.difficulty,
            type: challenge.type,
            threshold: challenge.threshold
        });

        // Redirect to quiz with challenge parameters
        window.location.href = `index.html?challenge=true&theme=${encodeURIComponent(challenge.category)}&level=${encodeURIComponent(challenge.difficulty.toLowerCase())}`;
    }

    completeChallenge(result) {
        console.log("Completing challenge with result:", result);
        const challenge = this.streakData.currentChallenge;

        if (!challenge || this.streakData.challengeStatus !== 'active') {
            console.error("No active challenge to complete", {
                challenge: challenge,
                status: this.streakData.challengeStatus
            });
            return false;
        }

        let success = false;

        if (challenge.type === 'accuracy') {
            const accuracy = result.correctAnswers > 0 ?
                Math.round((result.correctAnswers / (result.correctAnswers + result.incorrectAnswers)) * 100) : 0;
            success = accuracy >= challenge.threshold;
            console.log(`Accuracy challenge: ${accuracy}% vs threshold ${challenge.threshold}%, success: ${success}`);
        } else {
            success = result.score >= challenge.threshold;
            console.log(`Score challenge: ${result.score} vs threshold ${challenge.threshold}, success: ${success}`);
        }

        if (success) {
            console.log("Challenge completed successfully!");
            this.streakData.challengeStatus = 'completed';

            if (!this.streakData.completedChallenges) {
                this.streakData.completedChallenges = [];
            }
            this.streakData.completedChallenges.push(challenge.id);

            if (!this.streakData.challengeHistory) {
                this.streakData.challengeHistory = [];
            }
            this.streakData.challengeHistory.push({
                ...challenge,
                completed: true,
                result: {
                    score: result.score,
                    accuracy: result.accuracy
                }
            });

            this.awardChallengePoints();

            this.showChallengeCompletedNotification();
        } else {
            console.log("Challenge failed");
            this.streakData.challengeStatus = 'failed';

            if (!this.streakData.challengeHistory) {
                this.streakData.challengeHistory = [];
            }
            this.streakData.challengeHistory.push({
                ...challenge,
                completed: false,
                result: {
                    score: result.score,
                    accuracy: result.accuracy
                }
            });
        }

        this.saveStreakData();
        return success;
    }

    awardChallengePoints() {
        const userProfileStr = localStorage.getItem('userProfile');
        if (!userProfileStr) return;

        const userProfile = JSON.parse(userProfileStr);

        const pointsAwarded = STREAK_CONFIG.DAILY_CHALLENGE_POINTS;
        userProfile.totalScore += pointsAwarded;

        userProfile.recentActivity.unshift({
            type: 'challenge',
            date: new Date().toISOString(),
            description: 'Completed daily challenge',
            points: pointsAwarded
        });

        if (userProfile.recentActivity.length > 10) {
            userProfile.recentActivity = userProfile.recentActivity.slice(0, 10);
        }

        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    renderStreakCalendar() {
        const calendarEl = document.getElementById('streak-calendar');
        if (!calendarEl) return;

        calendarEl.innerHTML = '';

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarEl.appendChild(dayHeader);
        });

        const today = new Date();
        const dates = [];

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 21);

        for (let i = 0; i < 28; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push(date);
        }

        dates.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            const isStreakDay = this.streakData.streakDates.includes(dateStr);
            const isCompleted = this.isDateChallengeCompleted(dateStr);

            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = date.getDate();

            if (isToday) dayEl.classList.add('today');
            if (isStreakDay) dayEl.classList.add('streak');
            if (isCompleted) dayEl.classList.add('completed');

            calendarEl.appendChild(dayEl);
        });
    }

    isDateChallengeCompleted(dateStr) {
        const challengeForDate = this.streakData.challengeHistory.find(ch => ch.date === dateStr);
        return challengeForDate && challengeForDate.completed;
    }

    updateChallengeUI() {
        console.log('Updating challenge UI');
        const descriptionEl = document.getElementById('challenge-description');
        const statusEl = document.getElementById('challenge-status');
        const difficultyEl = document.getElementById('challenge-difficulty');
        const rewardEl = document.getElementById('challenge-reward');
        const startBtn = document.getElementById('start-challenge-btn');

        const tabDescriptionEl = document.getElementById('challenge-tab-description');
        const tabStatusEl = document.getElementById('challenge-tab-status');
        const tabDifficultyEl = document.getElementById('challenge-tab-difficulty');
        const tabRewardEl = document.getElementById('challenge-tab-reward');
        const startChallengeFromHomeBtn = document.getElementById('start-challenge-from-home');

        // Ensure a challenge exists before updating UI
        if (!this.streakData.currentChallenge) {
            console.warn("No current challenge for UI, regenerating...");
            this.generateDailyChallenge();
        }

        if (!this.streakData.currentChallenge) {
            console.error("Failed to generate a challenge for UI update");
            return;
        }

        const challenge = this.streakData.currentChallenge;

        if (descriptionEl) {
            descriptionEl.textContent = challenge.description;
        }

        if (tabDescriptionEl) {
            tabDescriptionEl.textContent = challenge.description;
        }

        if (difficultyEl) {
            difficultyEl.textContent = challenge.difficulty;
        }

        if (tabDifficultyEl) {
            tabDifficultyEl.textContent = challenge.difficulty;
        }

        if (rewardEl) {
            rewardEl.textContent = `+${STREAK_CONFIG.DAILY_CHALLENGE_POINTS} points`;
        }

        if (tabRewardEl) {
            tabRewardEl.textContent = `+${STREAK_CONFIG.DAILY_CHALLENGE_POINTS} points`;
        }

        if (statusEl) {
            statusEl.textContent = this.getStatusText();
            statusEl.className = this.getStatusClass();
        }

        if (tabStatusEl) {
            tabStatusEl.textContent = this.getStatusText();
            tabStatusEl.className = this.getStatusClass();
        }

        if (startBtn) {
            startBtn.textContent = this.getButtonText();
            startBtn.disabled = this.streakData.challengeStatus === 'completed';

            if (this.streakData.challengeStatus === 'completed') {
                startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                startBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        if (startChallengeFromHomeBtn) {
            startChallengeFromHomeBtn.textContent = this.getButtonText();
            startChallengeFromHomeBtn.disabled = this.streakData.challengeStatus === 'completed';

            if (this.streakData.challengeStatus === 'completed') {
                startChallengeFromHomeBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                startChallengeFromHomeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    getStatusText() {
        switch(this.streakData.challengeStatus) {
            case 'pending':
                return 'Pending';
            case 'active':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return 'Pending';
        }
    }

    getStatusClass() {
        let baseClasses = 'px-3 py-1 rounded-full text-sm font-medium ';

        switch(this.streakData.challengeStatus) {
            case 'pending':
                return baseClasses + 'bg-yellow-100 text-yellow-800';
            case 'active':
                return baseClasses + 'bg-blue-100 text-blue-800 in-progress';
            case 'completed':
                return baseClasses + 'bg-green-100 text-green-800 completed';
            default:
                return baseClasses + 'bg-yellow-100 text-yellow-800';
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
            default:
                return 'Accept Challenge';
        }
    }

    updateStreakTabUI() {
        const streakTab = document.getElementById('streak-tab');
        if (!streakTab) return;

        const streakCountEl = document.getElementById('streak-count');
        if (streakCountEl) {
            streakCountEl.textContent = this.streakData.currentStreak;
        }

        const challengeStatusEl = document.getElementById('challenge-tab-status');
        if (challengeStatusEl) {
            if (this.streakData.challengeStatus === 'completed') {
                challengeStatusEl.textContent = '✓ Completed';
                challengeStatusEl.className = 'text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full';
            } else {
                challengeStatusEl.textContent = 'Pending';
                challengeStatusEl.className = 'text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full';
            }
        }
    }

    updateAllUI() {
        const currentStreakEl = document.getElementById('current-streak');
        if (currentStreakEl) {
            currentStreakEl.textContent = this.streakData.currentStreak;
        }

        this.updateChallengeUI();

        if (document.getElementById('streak-calendar')) {
            this.renderStreakCalendar();
        }

        if (document.getElementById('streak-tab')) {
            this.updateStreakTabUI();
        }
    }

    checkForStreakBadges() {
        const streakMilestones = [3, 7, 14, 30];
        const currentStreak = this.streakData.currentStreak;

        for (const milestone of streakMilestones) {
            if (currentStreak >= milestone) {
                this.awardStreakBadge(milestone);
            }
        }
    }

    awardStreakBadge(milestone) {
        const userProfileStr = localStorage.getItem('userProfile');
        if (!userProfileStr) return;

        const userProfile = JSON.parse(userProfileStr);

        const badgeId = `streak_${milestone}`;
        if (userProfile.achievements && userProfile.achievements.includes(badgeId)) {
            return;
        }

        if (!userProfile.achievements) {
            userProfile.achievements = [];
        }
        userProfile.achievements.push(badgeId);

        userProfile.recentActivity.unshift({
            type: 'achievement',
            date: new Date().toISOString(),
            description: `Earned ${milestone}-day streak badge!`,
            achievementName: this.getStreakBadgeName(milestone)
        });

        if (userProfile.recentActivity.length > 10) {
            userProfile.recentActivity = userProfile.recentActivity.slice(0, 10);
        }

        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        this.showBadgeNotification(milestone);
    }

    getStreakBadgeName(milestone) {
        switch(milestone) {
            case 3:
                return 'Spark (3-day streak)';
            case 7:
                return 'Ignite (7-day streak)';
            case 14:
                return 'Blaze (14-day streak)';
            case 30:
                return 'Inferno (30-day streak)';
            default:
                return `${milestone}-day streak`;
        }
    }

    showBadgeNotification(milestone) {
        const badgeNotification = document.getElementById('badge-notification');
        if (!badgeNotification) return;

        const badgeEmoji = document.getElementById('badge-emoji');
        const badgeTitle = document.getElementById('badge-title');
        const badgeDescription = document.getElementById('badge-description');

        badgeEmoji.textContent = '🔥';
        badgeTitle.textContent = 'New Streak Badge!';
        badgeDescription.textContent = `You've maintained a ${milestone}-day streak!`;

        badgeNotification.classList.remove('translate-x-full');

        setTimeout(() => {
            badgeNotification.classList.add('translate-x-full');
        }, 5000);
    }

    showChallengeCompletedNotification() {
        const badgeNotification = document.getElementById('badge-notification');
        if (!badgeNotification) return;

        const badgeEmoji = document.getElementById('badge-emoji');
        const badgeTitle = document.getElementById('badge-title');
        const badgeDescription = document.getElementById('badge-description');

        badgeEmoji.textContent = '🎉';
        badgeTitle.textContent = 'Challenge Completed!';
        badgeDescription.textContent = `You earned ${STREAK_CONFIG.DAILY_CHALLENGE_POINTS} points!`;

        badgeNotification.classList.remove('translate-x-full');

        setTimeout(() => {
            badgeNotification.classList.add('translate-x-full');
        }, 5000);
    }
}

// Initialize streak manager
let streakManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing StreakManager');
    streakManager = new StreakManager();

    window.streakManager = streakManager;

    const startChallengeFromHomeBtn = document.getElementById('start-challenge-from-home');
    if (startChallengeFromHomeBtn) {
        console.log('Re-attaching listener to start-challenge-from-home in DOMContentLoaded');
        const newStartChallengeBtn = startChallengeFromHomeBtn.cloneNode(true);
        startChallengeFromHomeBtn.parentNode.replaceChild(newStartChallengeBtn, startChallengeFromHomeBtn);

        newStartChallengeBtn.addEventListener('click', () => {
            console.log("Challenge button clicked from home (DOMContentLoaded)");
            window.streakManager.startChallenge();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isChallenge = urlParams.get('challenge') === 'true';

    if (isChallenge) {
        streakManager.streakData.challengeStatus = 'active';
        streakManager.saveStreakData();
    }
});

// Export for other modules
export { streakManager, StreakManager, STREAK_CONFIG };
