// pwa-handler.js - ฟังก์ชันจัดการ PWA
console.log('📱 PWA Handler Module - Loading...');

class PWAHandler {
    constructor() {
        console.log('📱 Initializing PWA Handler');
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.checkInstallStatus();
        console.log('✅ PWA Handler initialized');
    }
    
    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 beforeinstallprompt event captured');
            
            // Store the event
            this.deferredPrompt = e;
            window.deferredPrompt = e;
            
            // Update UI
            this.showInstallUI();
        });
        
        // Listen for appinstalled event
        window.addEventListener('appinstalled', (e) => {
            console.log('🎉 PWA installed');
            this.isInstalled = true;
            this.deferredPrompt = null;
            window.deferredPrompt = null;
            
            // Hide install UI
            this.hideInstallUI();
            
            // Save install status
            localStorage.setItem('pwa_installed', 'true');
            localStorage.setItem('pwa_install_date', new Date().toISOString());
        });
    }
    
    checkInstallStatus() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const localStorageInstalled = localStorage.getItem('pwa_installed') === 'true';
        
        this.isInstalled = isStandalone || localStorageInstalled;
        
        if (this.isInstalled) {
            console.log('📱 App is already installed');
            this.hideInstallUI();
        }
        
        return this.isInstalled;
    }
    
    showInstallUI() {
        // Show install button in header
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
        
        // Show banner if not dismissed
        const hideBanner = localStorage.getItem('hideInstallBanner');
        const banner = document.getElementById('installBanner');
        if (banner && !hideBanner && !this.isInstalled) {
            banner.classList.add('show');
        }
    }
    
    hideInstallUI() {
        // Hide install button
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        // Hide banner
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.classList.remove('show');
        }
    }
    
    async install() {
        console.log('📱 PWAHandler.install() called');
        
        if (!this.deferredPrompt) {
            console.warn('⚠️ No deferred prompt available');
            return { success: false, message: 'ไม่สามารถติดตั้งได้ในขณะนี้' };
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`User response: ${outcome}`);
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted installation');
                return { success: true, message: 'กำลังติดตั้งแอป...' };
            } else {
                console.log('❌ User declined installation');
                return { success: false, message: 'ยกเลิกการติดตั้ง' };
            }
        } catch (error) {
            console.error('❌ Installation error:', error);
            return { success: false, message: 'เกิดข้อผิดพลาดในการติดตั้ง' };
        }
    }
    
    simulateInstallPrompt() {
        console.log('🧪 Simulating install prompt...');
    
        // สร้าง mock event
        const mockEvent = {
            preventDefault: () => console.log('Mock preventDefault'),
            prompt: () => {
                console.log('Mock prompt called');
            
                // สร้าง appinstalled event หลังจาก delay
                setTimeout(() => {
                    const appInstalledEvent = new Event('appinstalled');
                    window.dispatchEvent(appInstalledEvent);
                    console.log('✅ appinstalled event dispatched');
                }, 1000);
            
                return Promise.resolve({ outcome: 'accepted' });
            },
            userChoice: Promise.resolve({ outcome: 'accepted' }),
            platforms: ['web', 'android', 'windows']
        };
    
        // Store in handler
        this.deferredPrompt = mockEvent;
        window.deferredPrompt = mockEvent;
    
        // Update UI
        this.showInstallUI();
    
        console.log('✅ Mock install prompt created');
    
        // Trigger beforeinstallprompt event
        const event = new Event('beforeinstallprompt');
        window.dispatchEvent(event);
    
        const result = { success: true, message: 'สร้าง Install Prompt จำลองสำเร็จ' };
    
        if (window.showToast) {
            window.showToast(result.message, 'success');
        }
    
        return result;
    }

    getStatus() {
        return {
            hasDeferredPrompt: !!this.deferredPrompt,
            isInstalled: this.isInstalled,
            displayMode: this.getDisplayMode(),
            localStorage: {
                pwa_installed: localStorage.getItem('pwa_installed'),
                hideInstallBanner: localStorage.getItem('hideInstallBanner'),
                pwa_install_date: localStorage.getItem('pwa_install_date')
            },
            userAgent: navigator.userAgent.substring(0, 100)
        };
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        return 'browser';
    }
    
    getInstallationStatus() {
        return this.isInstalled;
    }
}

// Initialize PWAHandler
window.PWAHandler = new PWAHandler();

console.log('✅ PWA Handler loaded successfully');