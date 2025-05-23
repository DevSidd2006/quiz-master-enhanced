// Profile Management
import achievementManager from './achievements.js';

class ProfileManager {
    constructor() {
        this.profileData = this.loadProfileData();
        this.initializeProfile();
        this.setupThemeToggle();
    }

    loadProfileData() {
        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            return JSON.parse(savedData);
        }
        // Default structure matches script.js
        return {
            username: 'Guest',
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
    }

    saveProfileData() {
        localStorage.setItem('userProfile', JSON.stringify(this.profileData));
    }

    initializeProfile() {
        this.setupAvatarUpload();
        this.updateProfileDisplay();
    }

    setupAvatarUpload() {
        const avatarImg = document.getElementById('profile-avatar');
        const uploadBtn = document.getElementById('avatar-upload-btn');
        const uploadInput = document.getElementById('avatar-upload-input');
        // Display stored avatar if present
        if (this.profileData.avatar) {
            avatarImg.src = this.profileData.avatar;
        }
        // Button triggers file input
        if (uploadBtn && uploadInput) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                uploadInput.click();
            });
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        this.profileData.avatar = ev.target.result;
                        avatarImg.src = ev.target.result;
                        this.saveProfileData();
                        achievementManager.checkAllAchievements({ type: 'avatar_changed' });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }    updateProfileDisplay() {
        // Profile header
        const profile = this.profileData;
        
        // Safely update text elements by checking if they exist first
        const usernameElement = document.getElementById('profile-username');
        if (usernameElement) {
            usernameElement.textContent = profile.username || 'Guest User';
        }
        
        // Safely update join date
        const joinDateElement = document.getElementById('profile-join-date');
        if (joinDateElement && profile.memberSince) {
            try {
                const date = new Date(profile.memberSince);
                const options = { year: 'numeric', month: 'long' };
                joinDateElement.textContent = date.toLocaleDateString(undefined, options);
            } catch (e) {
                joinDateElement.textContent = 'May 2025';
            }
        }
        
        // Update statistics
        const totalScoreElement = document.getElementById('profile-total-score');
        if (totalScoreElement) {
            totalScoreElement.textContent = profile.totalScore || '0';
        }
        
        const quizzesCompletedElement = document.getElementById('profile-quizzes-completed');
        if (quizzesCompletedElement) {
            quizzesCompletedElement.textContent = profile.totalQuizzes || '0';
        }
        
        const averageScoreElement = document.getElementById('profile-average-score');
        if (averageScoreElement) {
            averageScoreElement.textContent = profile.averageScore || '0';
        }
        
        // Update avatar
        const avatarImg = document.getElementById('profile-avatar');
        if (this.profileData.avatar && avatarImg) {
            avatarImg.src = this.profileData.avatar;
        } else if (avatarImg) {
            avatarImg.src = 'images/default-avatar.png';
        }
        // Update join date
        const joinDate = new Date(this.profileData.memberSince);
        document.getElementById('profile-join-date').textContent = joinDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        // Optionally update level (simple example: 1 + every 5 quizzes)
        const level = 1 + Math.floor((this.profileData.totalQuizzes || 0) / 5);
        document.getElementById('profile-level').textContent = `Level ${level}`;

        // Stats
        document.getElementById('profile-total-score').textContent = this.profileData.totalScore || 0;
        document.getElementById('profile-quizzes-completed').textContent = this.profileData.totalQuizzes || 0;
        document.getElementById('profile-average-score').textContent = Math.round(this.profileData.averageScore) || 0;

        // Achievements are now rendered by achievementManager in profile.html

        // Recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = '';
        if (!this.profileData.recentActivity || this.profileData.recentActivity.length === 0) {
            activityList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No recent activity</p>';
            return;
        }
        this.profileData.recentActivity.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item flex items-center gap-4 bg-white rounded-lg p-4 shadow-sm';
            let label = 'Quiz';
            let desc = `Completed a quiz (${activity.theme || ''} - ${activity.level || ''})`;
            if (activity.type === 'quiz') {
                label = 'Quiz';
                desc = `Completed "${activity.theme || 'Quiz'}" quiz`;
            }
            // Add achievement activity if present
            if (activity.type === 'achievement') {
                label = 'Achievement';
                desc = `Unlocked "${activity.achievementName || ''}"`;
            }
            const date = new Date(activity.timestamp || activity.date);
            const formattedDate = date.toLocaleDateString();
            activityElement.innerHTML = `
                <span class="bg-indigo-100 text-indigo-600 rounded-full px-3 py-1 text-xs font-semibold">${label}</span>
                <span class="flex-1 text-gray-700">${desc}</span>
                <span class="text-xs text-gray-400">${formattedDate}</span>
            `;
            activityList.appendChild(activityElement);
        });
    }

    setupThemeToggle() {
        // No-op: theme handled by floating button in profile.html
    }
}

// Initialize profile manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if profile exists
    const profileData = localStorage.getItem('userProfile');
    let profile = null;
    
    if (profileData) {
        try {
            profile = JSON.parse(profileData);
        } catch (e) {
            console.error('Error parsing profile data:', e);
        }
    }
    
    // Only redirect if there's definitely no profile
    if (!profile) {
        console.log('No profile found, creating default profile');
        // Instead of redirecting, create a default profile
        const defaultProfile = {
            username: 'Guest User',
            email: 'guest@example.com',
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
        localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    }
    
    // Initialize profile manager regardless
    window.profileManager = new ProfileManager();
});