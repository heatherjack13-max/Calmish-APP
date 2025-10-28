// Calmish App - Main JavaScript Functions
// Shared functionality across all sections

// Global app state
window.CalmishApp = {
    user: {
        name: '',
        lifeStage: '',
        onboardingComplete: false,
        preferences: {
            notifications: true,
            theme: 'default',
            language: 'en'
        }
    },
    
    data: {
        wellness: {
            waterGlasses: 0,
            mood: 3,
            habits: {},
            symptoms: {},
            weeklyData: []
        },
        breathing: {
            sessions: [],
            progress: {
                todaySessions: 0,
                todayMinutes: 0,
                streakDays: 1
            }
        },
        boundaries: {
            profile: null,
            energyLevel: 3,
            recentScripts: []
        },
        conversations: []
    },
    
    utils: {
        // Date formatting
        formatDate: function(date) {
            const now = new Date();
            const messageDate = new Date(date);
            const diffMs = now - messageDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return messageDate.toLocaleDateString();
        },
        
        // Generate unique ID
        generateId: function() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Animate element
        animateElement: function(element, animation = 'pulse') {
            if (typeof anime !== 'undefined') {
                switch(animation) {
                    case 'pulse':
                        anime({
                            targets: element,
                            scale: [1, 1.05, 1],
                            duration: 600,
                            easing: 'easeInOutSine'
                        });
                        break;
                    case 'fadeIn':
                        anime({
                            targets: element,
                            opacity: [0, 1],
                            translateY: [20, 0],
                            duration: 500,
                            easing: 'easeOutQuart'
                        });
                        break;
                    case 'bounce':
                        anime({
                            targets: element,
                            translateY: [0, -10, 0],
                            duration: 1000,
                            easing: 'easeInOutSine'
                        });
                        break;
                }
            }
        },
        
        // Show toast notification
        showToast: function(message, type = 'success', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 px-4 py-3 rounded-xl text-white text-sm z-50 ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 
                type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Animate in
            if (typeof anime !== 'undefined') {
                anime({
                    targets: toast,
                    translateX: [100, 0],
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'easeOutQuart'
                });
            }
            
            // Auto remove
            setTimeout(() => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: toast,
                        translateX: [0, 100],
                        opacity: [1, 0],
                        duration: 300,
                        easing: 'easeInQuart',
                        complete: () => {
                            if (toast.parentNode) {
                                toast.remove();
                            }
                        }
                    });
                } else {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }
            }, duration);
        },
        
        // Local storage helpers
        saveToStorage: function(key, data) {
            try {
                localStorage.setItem(`calmish_${key}`, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Error saving to storage:', error);
                return false;
            }
        },
        
        loadFromStorage: function(key, defaultValue = null) {
            try {
                const data = localStorage.getItem(`calmish_${key}`);
                return data ? JSON.parse(data) : defaultValue;
            } catch (error) {
                console.error('Error loading from storage:', error);
                return defaultValue;
            }
        },
        
        // Clear storage
        clearStorage: function(key) {
            try {
                localStorage.removeItem(`calmish_${key}`);
                return true;
            } catch (error) {
                console.error('Error clearing storage:', error);
                return false;
            }
        }
    },
    
    // Navigation functions
    navigation: {
        // Smooth page transitions
        goTo: function(page) {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: 'body',
                    opacity: [1, 0.8],
                    duration: 200,
                    easing: 'easeOutQuart',
                    complete: function() {
                        window.location.href = page;
                    }
                });
            } else {
                window.location.href = page;
            }
        },
        
        // Update active navigation state
        updateActiveNav: function(currentPage) {
            const navButtons = document.querySelectorAll('.nav-bottom button');
            navButtons.forEach(button => {
                const icon = button.querySelector('div');
                const text = button.querySelector('span');
                
                if (button.onclick && button.onclick.toString().includes(currentPage)) {
                    icon.classList.remove('opacity-30');
                    text.classList.remove('text-gray-400');
                    text.classList.add('text-gray-600');
                } else {
                    icon.classList.add('opacity-30');
                    text.classList.remove('text-gray-600');
                    text.classList.add('text-gray-400');
                }
            });
        }
    },
    
    // Wellness tracking functions
    wellness: {
        // Update water intake
        updateWater: function(glasses) {
            this.data.wellness.waterGlasses = glasses;
            this.utils.saveToStorage('wellness', this.data.wellness);
            this.events.emit('waterUpdated', glasses);
        },
        
        // Update mood
        updateMood: function(mood) {
            this.data.wellness.mood = mood;
            this.utils.saveToStorage('wellness', this.data.wellness);
            this.events.emit('moodUpdated', mood);
        },
        
        // Complete habit
        completeHabit: function(habit) {
            this.data.wellness.habits[habit] = true;
            this.utils.saveToStorage('wellness', this.data.wellness);
            this.events.emit('habitCompleted', habit);
            
            // Show celebration
            this.utils.showToast(`${habit} completed! 🎉`, 'success');
        },
        
        // Add breathing session
        addBreathingSession: function(type, duration) {
            const session = {
                id: this.utils.generateId(),
                type: type,
                duration: duration,
                timestamp: new Date().toISOString()
            };
            
            this.data.breathing.sessions.push(session);
            this.data.breathing.progress.todaySessions++;
            this.data.breathing.progress.todayMinutes += Math.floor(duration / 60);
            
            this.utils.saveToStorage('breathing', this.data.breathing);
            this.events.emit('sessionCompleted', session);
        },
        
        // Update boundary profile
        updateBoundaryProfile: function(profile) {
            this.data.boundaries.profile = profile;
            this.utils.saveToStorage('boundaries', this.data.boundaries);
        }
    },
    
    // Event system
    events: {
        listeners: {},
        
        on: function(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },
        
        off: function(event, callback) {
            if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
            }
        },
        
        emit: function(event, data) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => callback(data));
            }
        }
    },
    
    // Initialize app
    init: function() {
        // Load user data
        const userData = this.utils.loadFromStorage('user', {});
        if (userData) {
            this.user = { ...this.user, ...userData };
        }
        
        // Load wellness data
        const wellnessData = this.utils.loadFromStorage('wellness', {});
        if (wellnessData) {
            this.data.wellness = { ...this.data.wellness, ...wellnessData };
        }
        
        // Load breathing data
        const breathingData = this.utils.loadFromStorage('breathing', {});
        if (breathingData) {
            this.data.breathing = { ...this.data.breathing, ...breathingData };
        }
        
        // Load boundary data
        const boundaryData = this.utils.loadFromStorage('boundaries', {});
        if (boundaryData) {
            this.data.boundaries = { ...this.data.boundaries, ...boundaryData };
        }
        
        // Load conversations
        const conversations = this.utils.loadFromStorage('conversations', []);
        this.data.conversations = conversations;
        
        // Set up global event listeners
        this.setupGlobalEvents();
        
        // Update navigation
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.navigation.updateActiveNav(currentPage);
        
        console.log('Calmish App initialized successfully');
    },
    
    // Setup global event listeners
    setupGlobalEvents: function() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden - save current state
                this.saveAllData();
            }
        });
        
        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveAllData();
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.utils.showToast('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.utils.showToast('Working offline', 'warning');
        });
    },
    
    // Save all data
    saveAllData: function() {
        this.utils.saveToStorage('user', this.user);
        this.utils.saveToStorage('wellness', this.data.wellness);
        this.utils.saveToStorage('breathing', this.data.breathing);
        this.utils.saveToStorage('boundaries', this.data.boundaries);
        this.utils.saveToStorage('conversations', this.data.conversations);
    },
    
    // Utility functions for specific features
    features: {
        // Breathing exercises
        startBreathingSession: function(type, duration) {
            const exercises = {
                '478': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 Breathing' },
                'box': { inhale: 4, hold: 4, exhale: 4, hold2: 4, name: 'Box Breathing' },
                'calm': { inhale: 4, hold: 2, exhale: 6, name: 'Calm Breath' },
                'energy': { inhale: 2, exhale: 2, name: 'Energizing Breath' }
            };
            
            return exercises[type] || exercises['calm'];
        },
        
        // Boundary scripts
        getBoundaryScript: function(category, situation) {
            const scripts = {
                work: [
                    {
                        title: "Setting Workload Boundaries",
                        content: "I appreciate you thinking of me for this project. I'm currently at capacity with my existing commitments, and I want to ensure I can give my best to everything I'm working on. Can we revisit this next week when I have more bandwidth?",
                        context: "When your plate is full"
                    }
                ],
                family: [
                    {
                        title: "Respecting Personal Decisions",
                        content: "I know you care about me and want what's best, which I truly appreciate. I need to make this decision myself, even if it means learning from my own experiences. Your support means everything to me.",
                        context: "When family is overly involved"
                    }
                ],
                friends: [
                    {
                        title: "Social Energy Management",
                        content: "I love spending time with you, and I also need to rest tonight to recharge. Could we plan something for [alternative time] when I can be fully present with you?",
                        context: "When you need to decline plans"
                    }
                ],
                self: [
                    {
                        title: "Personal Time Protection",
                        content: "I've realized I need some quiet time to recharge and reconnect with myself. I'm taking this evening for self-care, and I'll be available to connect tomorrow when I'm feeling more centered.",
                        context: "When you need alone time"
                    }
                ]
            };
            
            return scripts[category] || scripts['self'];
        },
        
        // AI comfort messages
        getComfortMessage: function() {
            const messages = [
                "You are exactly where you need to be in this moment. Your journey is unfolding perfectly, even when it doesn't feel that way.",
                "Your feelings are valid, your experiences are real, and you are worthy of all the care and compassion in the world.",
                "You've survived every difficult day so far, and that strength is still within you. You're more resilient than you know.",
                "It's okay to rest. It's okay to not have all the answers. It's okay to just be where you are right now."
            ];
            
            return messages[Math.floor(Math.random() * messages.length)];
        },
        
        // Wellness insights
        generateInsight: function(data) {
            const insights = [];
            
            if (data.waterGlasses < 6) {
                insights.push("Your energy levels might improve with more hydration. Try adding one extra glass of water today.");
            }
            
            if (data.mood < 3) {
                insights.push("Lower mood days are normal and temporary. Consider reaching out to a friend or practicing a breathing exercise.");
            }
            
            if (Object.values(data.habits).filter(Boolean).length < 2) {
                insights.push("Even small habits create big changes over time. Which habit feels most nourishing to you today?");
            }
            
            return insights;
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.CalmishApp.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CalmishApp;
}