// pwa-handler.js - เวอร์ชันอัปเกรด (Handling Install Prompt & Success Status)
console.log('📱 PWA Handler Module - อัปเดตล่าสุดกำลังโหลด...');

class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.checkInstallStatus();
    }
    
    setupEventListeners() {
        // 1. ดักจับ Event ก่อนการติดตั้ง
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 ระบบพร้อมสำหรับการติดตั้ง (beforeinstallprompt captured)');
            // ป้องกันไม่ให้ Browser แสดงหน้าต่างติดตั้งเองโดยอัตโนมัติ
            e.preventDefault();
            // เก็บ Event ไว้เรียกใช้ภายหลัง
            this.deferredPrompt = e;
            window.deferredPrompt = e;
            
            // แสดง UI ปุ่มติดตั้งของคุณ
            this.showInstallUI();
        });
        
        // 2. ดักจับเมื่อการติดตั้งเสร็จสมบูรณ์
        window.addEventListener('appinstalled', (e) => {
            console.log('🎉 ยินดีด้วย! ติดตั้ง PWA สำเร็จ');
            this.isInstalled = true;
            this.deferredPrompt = null;
            window.deferredPrompt = null;
            
            // ซ่อนปุ่มติดตั้ง
            this.hideInstallUI();
            
            // แจ้งเตือนผู้ใช้ว่าสำเร็จ
            if (window.showToast) {
                window.showToast('ติดตั้งแอปสำเร็จ! คุณสามารถเข้าใช้งานได้จากหน้าจอหลัก', 'success');
            } else {
                alert('ติดตั้งแอปสำเร็จ!');
            }
            
            // บันทึกสถานะลง LocalStorage
            localStorage.setItem('pwa_installed', 'true');
        });
    }

    // ฟังก์ชันหลักสำหรับกดปุ่มติดตั้ง
    async install() {
        console.log('📱 กำลังเริ่มกระบวนการติดตั้ง...');

        // ดึง Prompt Event กลับมาเช็ค
        const promptEvent = this.deferredPrompt || window.deferredPrompt;

        if (!promptEvent) {
            console.warn('⚠️ ไม่พบข้อมูลการติดตั้ง (No deferred prompt)');
            if (window.showToast) {
                window.showToast('ระบบยังไม่พร้อมติดตั้ง หรือคุณติดตั้งไปแล้ว', 'error');
            }
            return { success: false, message: 'No prompt available' };
        }

        try {
            // แจ้งผู้ใช้ว่ากำลังเรียกหน้าต่างติดตั้ง
            if (window.showToast) window.showToast('กำลังเตรียมการติดตั้ง...', 'info');

            // แสดงหน้าต่างติดตั้งของระบบ (Native Prompt)
            await promptEvent.prompt();
            
            // รอรับผลการตัดสินใจของผู้ใช้
            const { outcome } = await promptEvent.userChoice;
            console.log(`👤 ผลการตัดสินใจของผู้ใช้: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('✅ ผู้ใช้ตกลงติดตั้ง');
                // หมายเหตุ: ตรงนี้แอปยังติดตั้งไม่เสร็จ 100% 
                // สถานะจบจริงๆ จะไปอยู่ที่ event 'appinstalled' ด้านบน
            } else {
                console.log('❌ ผู้ใช้ปฏิเสธการติดตั้ง');
            }

            // ล้างค่าทิ้งเพราะ Prompt ใช้ซ้ำไม่ได้
            this.deferredPrompt = null;
            window.deferredPrompt = null;
            this.hideInstallUI();

            return { success: outcome === 'accepted' };

        } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดระหว่างติดตั้ง:', error);
            return { success: false, error };
        }
    }

    showInstallUI() {
        const installBtn = document.getElementById('installButton') || document.getElementById('installBtn');
        const installBanner = document.getElementById('installBanner');
        
        if (installBtn) installBtn.style.display = 'block';
        if (installBanner) installBanner.classList.remove('hidden');
        
        // อัปเดตสถานะใน Debug Panel (ถ้ามี)
        this.updateDebugUI();
    }

    hideInstallUI() {
        const installBtn = document.getElementById('installButton') || document.getElementById('installBtn');
        const installBanner = document.getElementById('installBanner');
        
        if (installBtn) installBtn.style.display = 'none';
        if (installBanner) installBanner.classList.add('hidden');
        
        this.updateDebugUI();
    }

    checkInstallStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches || localStorage.getItem('pwa_installed') === 'true') {
            this.isInstalled = true;
            this.hideInstallUI();
        }
    }

    updateDebugUI() {
        const statusEl = document.getElementById('pwaStatus');
        if (statusEl) {
            statusEl.textContent = JSON.stringify(this.getStatus(), null, 2);
        }
    }

    getStatus() {
        return {
            hasDeferredPrompt: !!(this.deferredPrompt || window.deferredPrompt),
            isInstalled: this.isInstalled,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
        };
    }
}

// สร้าง Instance และส่งออกไปที่ Window
window.PWAHandler = new PWAHandler();
