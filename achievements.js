// achievements.js
import { showCustomNotification } from './badges.js';

export const ALL_ACHIEVEMENTS = [
    // Quiz Completion Achievements
    { id: 'novice_quizer', name: 'Novice Quizzer', description: 'Complete your first quiz.', icon: '🎓', unlocked: false, group: 'Quiz Completion' },
    { id: 'apprentice_quizer', name: 'Apprentice Quizzer', description: 'Complete 5 quizzes.', icon: '📚', unlocked: false, group: 'Quiz Completion' },
    { id: 'journeyman_quizer', name: 'Journeyman Quizzer', description: 'Complete 10 quizzes.', icon: '📜', unlocked: false, group: 'Quiz Completion' },
    { id: 'expert_quizer', name: 'Expert Quizzer', description: 'Complete 25 quizzes.', icon: '🌟', unlocked: false, group: 'Quiz Completion' },
    { id: 'master_quizer', name: 'Master Quizzer', description: 'Complete 50 quizzes.', icon: '🏆', unlocked: false, group: 'Quiz Completion' },

    // Score-Based Achievements
    { id: 'high_scorer_1', name: 'High Scorer I', description: 'Score 100 total points.', icon: '🎯', unlocked: false, group: 'Scoring' },
    { id: 'high_scorer_2', name: 'High Scorer II', description: 'Score 500 total points.', icon: '🚀', unlocked: false, group: 'Scoring' },
    { id: 'high_scorer_3', name: 'High Scorer III', description: 'Score 1000 total points.', icon: '🌠', unlocked: false, group: 'Scoring' },
    { id: 'perfect_easy', name: 'Easy Peasy Perfect', description: 'Get a perfect score on an Easy quiz.', icon: '👌', unlocked: false, group: 'Perfection' },
    { id: 'perfect_medium', name: 'Medium Well Done', description: 'Get a perfect score on a Medium quiz.', icon: '👍', unlocked: false, group: 'Perfection' },
    // { id: 'perfect_hard', name: 'Hardcore Perfect', description: 'Get a perfect score on a Hard quiz.', icon: '💯', unlocked: false, group: 'Perfection' }, // Potentially too hard initially

    // Streak-Based Achievements (can complement badges.js or be separate)
    { id: 'streak_starter', name: 'Streak Starter', description: 'Achieve a 3-day streak.', icon: '🔥', unlocked: false, group: 'Streaks' }, // Matches badge
    { id: 'streak_holder', name: 'Streak Holder', description: 'Achieve a 7-day streak.', icon: '🔥🔥', unlocked: false, group: 'Streaks' }, // Matches badge

    // Category-Specific Achievements
    { id: 'science_buff', name: 'Science Buff', description: 'Complete 5 Science quizzes.', icon: '🔬', unlocked: false, group: 'Categories' },
    { id: 'history_scholar', name: 'History Scholar', description: 'Complete 5 History quizzes.', icon: '🏛️', unlocked: false, group: 'Categories' },
    { id: 'geo_explorer', name: 'Geography Explorer', description: 'Complete 5 Geography quizzes.', icon: '🌍', unlocked: false, group: 'Categories' },

    // Challenge Achievements
    { id: 'challenge_accepted', name: 'Challenge Accepted', description: 'Complete your first Daily Challenge.', icon: '⚔️', unlocked: false, group: 'Challenges' },
    { id: 'challenge_conqueror', name: 'Challenge Conqueror', description: 'Complete 5 Daily Challenges successfully.', icon: '🛡️', unlocked: false, group: 'Challenges' },

    // Miscellaneous Achievements
    { id: 'theme_enthusiast', name: 'Theme Enthusiast', description: 'Change the theme.', icon: '🎨', unlocked: false, group: 'Miscellaneous' },
    { id: 'profile_customizer', name: 'Profile Customizer', description: 'Upload a custom avatar.', icon: '🖼️', unlocked: false, group: 'Miscellaneous' },
    { id: 'knowledge_seeker', name: 'Knowledge Seeker', description: 'Explore 3 different quiz categories.', icon: '💡', unlocked: false, group: 'Miscellaneous' }
];

class AchievementManager {
    constructor() {
        this.achievements = this.loadAchievements();
    }

    loadAchievements() {
        const savedAchievements = localStorage.getItem('userAchievements');
        if (savedAchievements) {
            const parsedAchievements = JSON.parse(savedAchievements);
            // Merge with ALL_ACHIEVEMENTS to ensure new achievements are added
            // and existing ones retain their unlocked status.
            return ALL_ACHIEVEMENTS.map(defaultAch => {
                const savedAch = parsedAchievements.find(sa => sa.id === defaultAch.id);
                return savedAch ? { ...defaultAch, ...savedAch } : { ...defaultAch }; // Ensure all properties from default are present
            });
        } else {
            return ALL_ACHIEVEMENTS.map(ach => ({ ...ach })); // Return a copy
        }
    }

    saveAchievements() {
        localStorage.setItem('userAchievements', JSON.stringify(this.achievements));
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(ach => ach.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            console.log(`Achievement unlocked: ${achievement.name}`);
            // Display notification with animation
            showCustomNotification(
                `Achievement Unlocked! ${achievement.icon}`,
                `You've earned: ${achievement.name} - ${achievement.description}`,
                achievement.icon, // Use achievement icon for notification
                'success' // A type for styling if your notification supports it
            );
            // Potentially trigger UI update for profile page if it's open
            if (document.getElementById('achievements-grid')) {
                this.renderAchievements(); // Re-render if on profile page
            }
            return true;
        }
        return false;
    }

    getUnlockedAchievements() {
        return this.achievements.filter(ach => ach.unlocked);
    }

    getAllAchievements() {
        return [...this.achievements]; // Return a copy
    }

    // --- Check functions for different achievement types ---
    checkQuizCompletionAchievements(userProfile) {
        if (!userProfile || typeof userProfile.quizzesCompleted === 'undefined') return;
        const quizzesDone = userProfile.quizzesCompleted;

        if (quizzesDone >= 1) this.unlockAchievement('novice_quizer');
        if (quizzesDone >= 5) this.unlockAchievement('apprentice_quizer');
        if (quizzesDone >= 10) this.unlockAchievement('journeyman_quizer');
        if (quizzesDone >= 25) this.unlockAchievement('expert_quizer');
        if (quizzesDone >= 50) this.unlockAchievement('master_quizer');
    }

    checkScoreAchievements(userProfile) {
        if (!userProfile || typeof userProfile.totalScore === 'undefined') return;
        const totalScore = userProfile.totalScore;

        if (totalScore >= 100) this.unlockAchievement('high_scorer_1');
        if (totalScore >= 500) this.unlockAchievement('high_scorer_2');
        if (totalScore >= 1000) this.unlockAchievement('high_scorer_3');
    }

    checkPerfectScoreAchievements(quizResult, quizDifficulty) {
        if (!quizResult || typeof quizResult.score === 'undefined' || typeof quizResult.totalQuestions === 'undefined') return;
        
        const isPerfect = quizResult.score === quizResult.totalQuestions * 10; // Assuming 10 points per question
        if (isPerfect) {
            if (quizDifficulty === 'easy') this.unlockAchievement('perfect_easy');
            if (quizDifficulty === 'medium') this.unlockAchievement('perfect_medium');
            // if (quizDifficulty === 'hard') this.unlockAchievement('perfect_hard');
        }
    }

    checkStreakAchievements(streakData) {
        if (!streakData || typeof streakData.currentStreak === 'undefined') return;
        const currentStreak = streakData.currentStreak;

        if (currentStreak >= 3) this.unlockAchievement('streak_starter');
        if (currentStreak >= 7) this.unlockAchievement('streak_holder');
    }

    checkCategoryAchievements(userProfile, completedQuizCategory) {
        if (!userProfile || !userProfile.categoryCounts || !completedQuizCategory) return;
        // Ensure categoryCounts is an object
        if (typeof userProfile.categoryCounts !== 'object' || userProfile.categoryCounts === null) {
            userProfile.categoryCounts = {};
        }

        // Increment count for the completed category
        userProfile.categoryCounts[completedQuizCategory] = (userProfile.categoryCounts[completedQuizCategory] || 0) + 1;
        // Save updated profile (important!)
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        if (userProfile.categoryCounts['Science'] >= 5) this.unlockAchievement('science_buff');
        if (userProfile.categoryCounts['History'] >= 5) this.unlockAchievement('history_scholar');
        if (userProfile.categoryCounts['Geography'] >= 5) this.unlockAchievement('geo_explorer');

        // Check for Knowledge Seeker (3 different categories)
        const distinctCategoriesCompleted = Object.keys(userProfile.categoryCounts).filter(cat => userProfile.categoryCounts[cat] > 0).length;
        if (distinctCategoriesCompleted >= 3) this.unlockAchievement('knowledge_seeker');
    }

    checkChallengeAchievements(streakData) {
        if (!streakData || !streakData.challengeHistory) return;

        const completedChallenges = streakData.challengeHistory.filter(ch => ch.completed);
        if (completedChallenges.length >= 1) this.unlockAchievement('challenge_accepted');
        if (completedChallenges.length >= 5) this.unlockAchievement('challenge_conqueror');
    }

    // Call this after specific actions
    checkThemeChangeAchievement() {
        this.unlockAchievement('theme_enthusiast');
    }

    checkAvatarUploadAchievement() {
        this.unlockAchievement('profile_customizer');
    }

    // Centralized check after relevant game events
    checkAllAchievements(eventData) {
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        const streakData = JSON.parse(localStorage.getItem('streakData')) || {};

        this.checkQuizCompletionAchievements(userProfile);
        this.checkScoreAchievements(userProfile);
        this.checkStreakAchievements(streakData);
        this.checkChallengeAchievements(streakData);

        if (eventData) {
            if (eventData.type === 'quiz_completed') {
                this.checkPerfectScoreAchievements(eventData.quizResult, eventData.quizDifficulty);
                this.checkCategoryAchievements(userProfile, eventData.quizCategory); // Pass userProfile to be updated
            }
            if (eventData.type === 'theme_changed') {
                this.checkThemeChangeAchievement();
            }
            if (eventData.type === 'avatar_changed') {
                this.checkAvatarUploadAchievement();
            }
        }
    }

    // --- UI Rendering for Profile Page ---
    renderAchievements() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear existing achievements
        this.achievements.forEach(ach => {
            const card = document.createElement('div');
            card.className = 'achievement-card p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition-all duration-300';
            if (ach.unlocked) {
                card.classList.add('bg-green-100', 'dark:bg-green-700', 'border-green-500');
            } else {
                card.classList.add('bg-gray-100', 'dark:bg-gray-700', 'border-gray-300', 'opacity-60', 'filter', 'grayscale');
                card.title = 'Locked: ' + ach.description;
            }

            const iconEl = document.createElement('div');
            iconEl.className = 'text-4xl mb-2';
            iconEl.textContent = ach.icon;

            const nameEl = document.createElement('h4');
            nameEl.className = 'font-semibold text-md mb-1 text-gray-800 dark:text-gray-100';
            nameEl.textContent = ach.name;

            const descEl = document.createElement('p');
            descEl.className = 'text-xs text-gray-600 dark:text-gray-300';
            descEl.textContent = ach.description;

            card.appendChild(iconEl);
            card.appendChild(nameEl);
            if (ach.unlocked) { // Only show full description if unlocked, or make it part of a tooltip for locked
                card.appendChild(descEl);
            }

            grid.appendChild(card);
        });
    }
}

const achievementManager = new AchievementManager();
export default achievementManager;

// Example of how to call checkAllAchievements after a quiz:
// import achievementManager from './achievements.js';
// achievementManager.checkAllAchievements({ 
//   type: 'quiz_completed', 
//   quizResult: { score: 70, totalQuestions: 10 }, 
//   quizDifficulty: 'medium',
//   quizCategory: 'Science'
// });

// Example for theme change:
// achievementManager.checkAllAchievements({ type: 'theme_changed' });

// Example for avatar change:
// achievementManager.checkAllAchievements({ type: 'avatar_changed' });