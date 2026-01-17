// pwa-handler.js - ฟังก์ชันจัดการ PWA
console.log('📱 PWA Handler Module v1.0');

// ========== PWA STATE ==========
const PWAState = {
    isInstalled: false,
    deferredPrompt: null,
    isOnline: navigator.onLine,
    serviceWorker: null,
    registration: null
};

// ========== INSTALLATION HANDLING ==========
class PWAHandler {
    constructor() {
        console.log('📱 Initializing PWA Handler');
        this.initialize();
    }
    
    initialize() {
        this.checkInstallation();
        this.setupEventListeners();
        this.setupServiceWorker();
        this.setupNetworkDetection();
    }
    
    checkInstallation() {
        // Check if app is running as standalone PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            PWAState.isInstalled = true;
            console.log('📱 App is installed as PWA');
            this.onAppInstalled();
        } else if (window.navigator.standalone) {
            // iOS Safari
            PWAState.isInstalled = true;
            console.log('📱 App is installed on iOS');
            this.onAppInstalled();
        } else {
            console.log('📱 App is running in browser');
        }
    }
    
    setupEventListeners() {
        // Before install prompt
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📱 Before install prompt fired');
            
            // Prevent default browser install prompt
            event.preventDefault();
            
            // Store the event for later use
            PWAState.deferredPrompt = event;
            
            // Show custom install button
            this.showInstallButton();
            
            // Update UI
            this.updateInstallUI();
        });
        
        // App installed
        window.addEventListener('appinstalled', (event) => {
            console.log('📱 App was installed');
            PWAState.isInstalled = true;
            PWAState.deferredPrompt = null;
            this.onAppInstalled();
        });
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
                .then(registration => {
                    PWAState.serviceWorker = registration.active;
                    PWAState.registration = registration;
                    console.log('✅ Service Worker ready:', registration);
                })
                .catch(error => {
                    console.error('❌ Service Worker failed:', error);
                });
        }
    }
    
    setupNetworkDetection() {
        window.addEventListener('online', () => {
            PWAState.isOnline = true;
            this.onNetworkStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            PWAState.isOnline = false;
            this.onNetworkStatusChange(false);
        });
    }
    
    // ========== PUBLIC METHODS ==========
    async installApp() {
        console.log('📱 Requesting app installation...');
        
        if (!PWAState.deferredPrompt) {
            console.warn('📱 No install prompt available');
            return false;
        }
        
        try {
            // Show the install prompt
            PWAState.deferredPrompt.prompt();
            
            // Wait for user response
            const { outcome } = await PWAState.deferredPrompt.userChoice;
            
            console.log(`📱 User response: ${outcome}`);
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted installation');
                return true;
            } else {
                console.log('❌ User declined installation');
                return false;
            }
        } catch (error) {
            console.error('❌ Installation failed:', error);
            return false;
        }
    }
    
    showInstallButton() {
        const installButton = document.getElementById('installBtn');
        const installBanner = document.getElementById('installBanner');
        
        if (installButton) {
            installButton.style.display = 'flex';
        }
        
        if (installBanner && !PWAState.isInstalled) {
            setTimeout(() => {
                installBanner.classList.add('show');
            }, 2000);
        }
    }
    
    hideInstallButton() {
        const installButton = document.getElementById('installBtn');
        const installBanner = document.getElementById('installBanner');
        
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        if (installBanner) {
            installBanner.classList.remove('show');
        }
    }
    
    updateInstallUI() {
        const installButton = document.getElementById('installBtn');
        if (!installButton) return;
        
        if (PWAState.isInstalled) {
            installButton.innerHTML = '<i class="fas fa-check"></i> ติดตั้งแล้ว';
            installButton.disabled = true;
        } else if (PWAState.deferredPrompt) {
            installButton.innerHTML = '<i class="fas fa-download"></i> ติดตั้งแอป';
            installButton.disabled = false;
        } else {
            installButton.innerHTML = '<i class="fas fa-info-circle"></i> ไม่รองรับ';
            installButton.disabled = true;
        }
    }
    
    // ========== OFFLINE FUNCTIONALITY ==========
    async saveDataOffline(key, data) {
        if (!PWAState.isOnline) {
            console.log('📱 Saving data for offline sync...');
            
            try {
                // Save to IndexedDB or localStorage
                localStorage.setItem(`offline_${key}`, JSON.stringify(data));
                localStorage.setItem('offline_queue', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('offline_queue') || '{}'),
                    [key]: Date.now()
                }));
                
                // Register background sync if available
                if ('sync' in PWAState.registration) {
                    await PWAState.registration.sync.register('sync-data');
                }
                
                console.log('✅ Data saved for offline sync');
                return true;
            } catch (error) {
                console.error('❌ Failed to save offline data:', error);
                return false;
            }
        }
        
        return true;
    }
    
    async syncOfflineData() {
        if (!PWAState.isOnline) return;
        
        console.log('📱 Syncing offline data...');
        
        try {
            const queue = JSON.parse(localStorage.getItem('offline_queue') || '{}');
            
            for (const [key, timestamp] of Object.entries(queue)) {
                const data = localStorage.getItem(`offline_${key}`);
                if (data) {
                    // Here you would send data to your server
                    console.log(`Syncing data for key: ${key}`);
                    
                    // Remove from queue after successful sync
                    delete queue[key];
                    localStorage.removeItem(`offline_${key}`);
                }
            }
            
            localStorage.setItem('offline_queue', JSON.stringify(queue));
            console.log('✅ Offline data synced');
            
        } catch (error) {
            console.error('❌ Failed to sync offline data:', error);
        }
    }
    
    // ========== NOTIFICATIONS ==========
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('📱 This browser does not support notifications');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            console.log('✅ Notification permission already granted');
            return true;
        }
        
        if (Notification.permission === 'denied') {
            console.warn('📱 Notification permission denied');
            return false;
        }
        
        try {
            const permission = await Notification.requestPermission();
            console.log(`📱 Notification permission: ${permission}`);
            return permission === 'granted';
        } catch (error) {
            console.error('❌ Failed to request notification permission:', error);
            return false;
        }
    }
    
    showNotification(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return false;
        }
        
        const defaultOptions = {
            body: 'คุณสามารถสร้างเพลงฟรีได้อีกแล้ว!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            tag: 'music-notification'
        };
        
        const notificationOptions = { ...defaultOptions, ...options };
        
        try {
            const notification = new Notification(title, notificationOptions);
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            return notification;
        } catch (error) {
            console.error('❌ Failed to show notification:', error);
            return false;
        }
    }
    
    // ========== BACKGROUND SYNC ==========
    async registerBackgroundSync(tag = 'sync-data') {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
            console.warn('📱 Background sync not supported');
            return false;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log(`✅ Background sync registered: ${tag}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to register background sync: ${tag}`, error);
            return false;
        }
    }
    
    // ========== EVENT HANDLERS ==========
    onAppInstalled() {
        console.log('📱 App installed event handler');
        
        // Update UI
        this.hideInstallButton();
        
        // Show welcome message
        this.showNotification('ยินดีต้อนรับ!', {
            body: 'Psychomatrix Music ติดตั้งสำเร็จแล้ว'
        });
        
        // Update localStorage
        localStorage.setItem('pwa_installed', 'true');
    }
    
    onNetworkStatusChange(isOnline) {
        console.log(`📱 Network status: ${isOnline ? 'Online' : 'Offline'}`);
        
        // Update UI
        const statusIndicator = document.getElementById('networkStatus');
        if (statusIndicator) {
            statusIndicator.textContent = isOnline ? 'ออนไลน์' : 'ออฟไลน์';
            statusIndicator.className = `network-status ${isOnline ? 'online' : 'offline'}`;
        }
        
        // Sync data when coming online
        if (isOnline) {
            this.syncOfflineData();
        }
        
        // Show notification
        if (!isOnline) {
            this.showNotification('คุณกำลังทำงานออฟไลน์', {
                body: 'สามารถสร้างเพลงได้ตามปกติ'
            });
        }
    }
    
    // ========== UTILITY FUNCTIONS ==========
    getInstallationStatus() {
        return PWAState.isInstalled;
    }
    
    getNetworkStatus() {
        return PWAState.isOnline;
    }
    
    getServiceWorker() {
        return PWAState.serviceWorker;
    }
    
    // ========== DEBUG FUNCTIONS ==========
    debugInfo() {
        return {
            installed: PWAState.isInstalled,
            online: PWAState.isOnline,
            deferredPrompt: !!PWAState.deferredPrompt,
            serviceWorker: !!PWAState.serviceWorker,
            displayMode: this.getDisplayMode()
        };
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        } else {
            return 'browser';
        }
    }
}

// ========== EXPORTS ==========
window.PWAHandler = new PWAHandler();

// ========== GLOBAL EVENT HANDLERS ==========
// Handle beforeinstallprompt globally
window.addEventListener('beforeinstallprompt', (event) => {
    // This event is already handled by PWAHandler
    // but we keep it here for compatibility
    console.log('📱 Global beforeinstallprompt handler');
});

// Handle appinstalled globally
window.addEventListener('appinstalled', (event) => {
    console.log('📱 Global appinstalled handler');
    
    // Update analytics or perform other actions
    if (typeof gtag !== 'undefined') {
        gtag('event', 'install', {
            'event_category': 'PWA',
            'event_label': 'App Installed'
        });
    }
});

// Handle service worker messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📱 Message from service worker:', event.data);
        
        // Handle different message types
        switch (event.data.type) {
            case 'SYNC_COMPLETED':
                console.log('✅ Background sync completed');
                break;
            case 'NEW_CONTENT':
                console.log('🆕 New content available');
                // Show update notification
                if (window.PWAHandler) {
                    window.PWAHandler.showNotification('อัพเดทใหม่!', {
                        body: 'มีเนื้อหาใหม่พร้อมใช้งาน'
                    });
                }
                break;
        }
    });
}

console.log('✅ PWA Handler Module loaded');
