// Badge Manager Class
class BadgeManager {
    constructor() {
        this.loadBadgeData();
    }

    loadBadgeData() {
        const savedData = localStorage.getItem('badgeData');
        if (savedData) {
            this.badgeData = JSON.parse(savedData);
        } else {
            this.badgeData = {
                earnedBadges: [],
                badgeProgress: {}
            };
            this.saveBadgeData();
        }
    }

    saveBadgeData() {
        localStorage.setItem('badgeData', JSON.stringify(this.badgeData));
    }

    checkForStreakBadges(streakLength) {
        const badgeThresholds = [3, 7, 14, 30, 60, 90];
        const newBadges = [];

        badgeThresholds.forEach(threshold => {
            if (streakLength >= threshold && !this.badgeData.earnedBadges.includes(`streak-${threshold}`)) {
                this.badgeData.earnedBadges.push(`streak-${threshold}`);
                newBadges.push({
                    id: `streak-${threshold}`,
                    name: this.getBadgeName(threshold),
                    description: `Maintained a streak of ${threshold} days`
                });
            }
        });

        if (newBadges.length > 0) {
            this.saveBadgeData();
            this.showBadgeNotification(newBadges);
        }
    }

    getBadgeName(streakLength) {
        switch(streakLength) {
            case 3: return 'Spark';
            case 7: return 'Flame';
            case 14: return 'Blaze';
            case 30: return 'Inferno';
            case 60: return 'Phoenix';
            case 90: return 'Legend';
            default: return 'Unknown';
        }
    }

    showBadgeNotification(badges) {
        const badgeNotification = document.getElementById('badge-notification');
        if (!badgeNotification) return;

        badges.forEach(badge => {
            document.getElementById('badge-emoji').textContent = '🏆';
            document.getElementById('badge-title').textContent = `New Badge: ${badge.name}`;
            document.getElementById('badge-description').textContent = badge.description;
            badgeNotification.classList.remove('translate-x-full');
            badgeNotification.classList.add('translate-x-0');

            setTimeout(() => {
                badgeNotification.classList.remove('translate-x-0');
                badgeNotification.classList.add('translate-x-full');
            }, 5000);
        });
    }
}

// Initialize badge manager
const badgeManagerInstance = new BadgeManager();

export function showCustomNotification(title, message, emoji = 'ℹ️', duration = 3000) {
    const notificationElement = document.getElementById('badge-notification');
    const emojiElement = document.getElementById('badge-emoji');
    const titleElement = document.getElementById('badge-title');
    const descriptionElement = document.getElementById('badge-description');

    if (!notificationElement || !emojiElement || !titleElement || !descriptionElement) {
        console.warn('Notification elements not found. Cannot display custom notification.');
        // Fallback to alert if elements are missing
        alert(`${emoji} ${title}\n${message}`);
        return;
    }

    emojiElement.textContent = emoji;
    titleElement.textContent = title;
    descriptionElement.textContent = message;

    // Show notification
    notificationElement.classList.remove('translate-x-full');
    notificationElement.classList.add('translate-x-0');

    // Hide after duration
    setTimeout(() => {
        notificationElement.classList.remove('translate-x-0');
        notificationElement.classList.add('translate-x-full');
    }, duration);
}

export default badgeManagerInstance;