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

// Export BadgeManager
const badgeManager = new BadgeManager();
export default badgeManager;