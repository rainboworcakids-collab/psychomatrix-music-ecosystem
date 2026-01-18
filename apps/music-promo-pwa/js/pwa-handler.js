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
        this.setupInstallUI();
    }
    
    setupInstallUI() {
        console.log('🔧 Setting up install UI...');
        
        // Ensure install button exists
        const installBtn = document.getElementById('installBtn');
        const installButtonBanner = document.getElementById('installButton');
        
        if (installBtn) {
            installBtn.style.display = 'none'; // Hide initially
            installBtn.innerHTML = '<i class="fas fa-download"></i>';
            installBtn.title = 'ติดตั้งแอป';
        }
        
        if (installButtonBanner) {
            installButtonBanner.style.display = 'none'; // Hide initially
        }
        
        // Check if already installed
        if (this.getDisplayMode() === 'standalone') {
            console.log('📱 App is already installed');
            this.hideInstallUI();
        }
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // ========== FIX: Before install prompt ==========
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📱 BEFOREINSTALLPROMPT fired!', event);
            
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            event.preventDefault();
            
            // Stash the event so it can be triggered later
            PWAState.deferredPrompt = event;
            
            // Update UI to show install button
            this.showInstallUI();
            
            // Show install banner after delay
            setTimeout(() => {
                const installBanner = document.getElementById('installBanner');
                if (installBanner && !PWAState.isInstalled) {
                    installBanner.classList.add('show');
                    console.log('📱 Showing install banner');
                }
            }, 3000);
            
            // Optional: Log the platforms
            if (event.platforms) {
                console.log('📱 Supported platforms:', event.platforms);
            }
        });
        
        // ========== FIX: App installed ==========
        window.addEventListener('appinstalled', (event) => {
            console.log('📱 APPINSTALLED fired!', event);
            PWAState.isInstalled = true;
            PWAState.deferredPrompt = null;
            this.onAppInstalled();
            
            // Log to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'install', {
                    'event_category': 'PWA',
                    'event_label': 'App Installed'
                });
            }
        });
        
        // Global click handler for install button
        document.addEventListener('click', (event) => {
            if (event.target.id === 'installBtn' || 
                event.target.id === 'installButton' ||
                event.target.closest('#installBtn') ||
                event.target.closest('#installButton')) {
                console.log('📱 Install button clicked');
                this.handleInstallClick();
            }
        });
        
        // Dismiss banner
        const dismissBanner = document.getElementById('dismissBanner');
        if (dismissBanner) {
            dismissBanner.addEventListener('click', () => {
                const installBanner = document.getElementById('installBanner');
                if (installBanner) {
                    installBanner.classList.remove('show');
                    // Save preference
                    localStorage.setItem('hideInstallBanner', 'true');
                }
            });
        }
    }
    
    // ========== FIX: Install button click handler ==========
    async handleInstallClick() {
        console.log('📱 Install button clicked, deferredPrompt:', !!PWAState.deferredPrompt);
        
        if (!PWAState.deferredPrompt) {
            console.warn('📱 No install prompt available');
            this.showInstallError('ไม่สามารถติดตั้งได้ในขณะนี้');
            return;
        }
        
        try {
            // Show the install prompt
            console.log('📱 Showing install prompt...');
            PWAState.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await PWAState.deferredPrompt.userChoice;
            
            console.log(`📱 User response to install prompt: ${outcome}`);
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
                this.showInstallSuccess('กำลังติดตั้งแอป...');
                
                // The prompt has been shown and accepted
                PWAState.deferredPrompt = null;
                
                // Hide install UI
                this.hideInstallUI();
                
            } else {
                console.log('❌ User dismissed the install prompt');
                this.showInstallError('การติดตั้งถูกยกเลิก');
            }
            
        } catch (error) {
            console.error('❌ Error showing install prompt:', error);
            this.showInstallError('เกิดข้อผิดพลาดในการติดตั้ง');
        }
    }
    
    // ========== FIX: Show install UI ==========
    showInstallUI() {
        console.log('📱 Showing install UI');
        
        const installBtn = document.getElementById('installBtn');
        const installButtonBanner = document.getElementById('installButton');
        
        if (installBtn) {
            installBtn.style.display = 'flex';
            installBtn.innerHTML = '<i class="fas fa-download"></i> ติดตั้งแอป';
        }
        
        if (installButtonBanner) {
            installButtonBanner.style.display = 'inline-block';
        }
        
        // Check if banner should be shown
        const hideBanner = localStorage.getItem('hideInstallBanner');
        const installBanner = document.getElementById('installBanner');
        
        if (installBanner && !hideBanner && !PWAState.isInstalled) {
            setTimeout(() => {
                installBanner.classList.add('show');
            }, 2000);
        }
    }
    
    hideInstallUI() {
        console.log('📱 Hiding install UI');
        
        const installBtn = document.getElementById('installBtn');
        const installBanner = document.getElementById('installBanner');
        
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        if (installBanner) {
            installBanner.classList.remove('show');
        }
    }
    
    // ========== FIX: Show install success/error ==========
    showInstallSuccess(message) {
        console.log('✅ ' + message);
        
        // Create success toast
        const toast = document.createElement('div');
        toast.className = 'install-success-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        if (!document.querySelector('#install-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'install-toast-styles';
            style.textContent = `
                .install-success-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                }
                .install-error-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #ef4444;
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    showInstallError(message) {
        console.error('❌ ' + message);
        
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'install-error-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // ========== FIX: Check installation status ==========
    checkInstallation() {
        console.log('📱 Checking installation status...');
        
        // Multiple ways to check if app is installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
        const isInWebView = navigator.userAgent.includes('wv');
        
        PWAState.isInstalled = isStandalone || isFullscreen || isMinimalUI || isInWebView;
        
        if (PWAState.isInstalled) {
            console.log('📱 App appears to be installed');
            this.onAppInstalled();
        } else {
            console.log('📱 App is not installed yet');
        }
    }
    
    // ========== FIX: Get display mode ==========
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        } else if (window.matchMedia('(display-mode: browser)').matches) {
            return 'browser';
        } else if (navigator.standalone) {
            return 'standalone'; // iOS
        } else {
            return 'browser';
        }
    }
    
    // ========== FIX: On app installed ==========
    onAppInstalled() {
        console.log('📱 App installed event handler');
        
        // Update UI
        this.hideInstallUI();
        
        // Update state
        PWAState.isInstalled = true;
        
        // Save to localStorage
        localStorage.setItem('pwa_installed', 'true');
        localStorage.setItem('pwa_install_date', new Date().toISOString());
        
        // Show welcome message
        setTimeout(() => {
            this.showInstallSuccess('แอปติดตั้งสำเร็จแล้ว! 🎉');
        }, 1000);
    }
}

// ========== EXPORTS ==========
window.PWAHandler = new PWAHandler();

// ========== GLOBAL INSTALL HANDLERS ==========
// Keep a global reference to deferredPrompt
window.deferredPrompt = null;

// Global beforeinstallprompt handler (as backup)
window.addEventListener('beforeinstallprompt', (event) => {
    console.log('📱 Global beforeinstallprompt handler fired');
    
    // Store the event
    window.deferredPrompt = event;
    
    // Show debug info
    if (window.AppDebug) {
        window.AppDebug.hasInstallPrompt = true;
        console.log('🔧 AppDebug.hasInstallPrompt set to true');
    }
});

// Global appinstalled handler (as backup)
window.addEventListener('appinstalled', (event) => {
    console.log('📱 Global appinstalled handler fired');
    
    // Clear the deferredPrompt
    window.deferredPrompt = null;
    
    // Update debug info
    if (window.AppDebug) {
        window.AppDebug.isInstalled = true;
        console.log('🔧 AppDebug.isInstalled set to true');
    }
});

console.log('✅ PWA Handler Module loaded with install fixes');
