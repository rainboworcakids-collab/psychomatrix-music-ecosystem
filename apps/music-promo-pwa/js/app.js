// app.js - ไฟล์หลักสำหรับ Psychomatrix Music PWA
console.log('🎵 Psychomatrix Music PWA - Starting...');

// ========== GLOBAL STATE ==========
window.AppState = {
    isPlaying: false,
    currentMusic: null,
    dailyCounter: 3,
    userData: null,
    theme: 'light'
};

// ========== DOM ELEMENTS ==========
const elements = {
    // Form elements
    musicForm: null,
    fullName: null,
    birthDate: null,
    birthTime: null,
    musicStyle: null,
    agreeTerms: null,
    generateBtn: null,
    
    // Result elements
    resultSection: null,
    songTitle: null,
    songKey: null,
    songTempo: null,
    songPattern: null,
    visualizer: null,
    visualizerBars: null,
    melodyNotes: null,
    
    // Player controls
    playBtn: null,
    stopBtn: null,
    saveBtn: null,
    
    // UI elements
    dailyCounter: null,
    themeToggle: null,
    installBtn: null,
    installBanner: null,
    installButton: null,
    loadingModal: null,
    successToast: null,
    errorToast: null
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 DOM Content Loaded');
    
    try {
        // Initialize elements
        initializeElements();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Initialize app state
        initializeAppState();
        
        // Initialize PWA
        initializePWA();
        
        console.log('✅ App initialized successfully');
        
        // Show welcome message
        setTimeout(() => {
            showToast('ยินดีต้อนรับสู่ Psychomatrix Music!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showError('เกิดข้อผิดพลาดในการเริ่มต้นแอป');
    }
});

function initializeElements() {
    console.log('🔧 Initializing DOM elements...');
    
    // Form elements
    elements.musicForm = document.getElementById('musicForm');
    elements.fullName = document.getElementById('fullName');
    elements.birthDate = document.getElementById('birthDate');
    elements.birthTime = document.getElementById('birthTime');
    elements.musicStyle = document.getElementById('musicStyle');
    elements.agreeTerms = document.getElementById('agreeTerms');
    elements.generateBtn = document.getElementById('generateBtn');
    
    // Result elements
    elements.resultSection = document.getElementById('resultSection');
    elements.songTitle = document.getElementById('songTitle');
    elements.songKey = document.getElementById('songKey');
    elements.songTempo = document.getElementById('songTempo');
    elements.songPattern = document.getElementById('songPattern');
    elements.visualizer = document.getElementById('visualizer');
    elements.visualizerBars = document.getElementById('visualizerBars');
    elements.melodyNotes = document.getElementById('melodyNotes');
    
    // Player controls
    elements.playBtn = document.getElementById('playBtn');
    elements.stopBtn = document.getElementById('stopBtn');
    elements.saveBtn = document.getElementById('saveBtn');
    
    // UI elements
    elements.dailyCounter = document.getElementById('dailyCounter');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.installBtn = document.getElementById('installBtn');
    elements.installBanner = document.getElementById('installBanner');
    elements.installButton = document.getElementById('installButton');
    elements.loadingModal = document.getElementById('loadingModal');
    elements.successToast = document.getElementById('successToast');
    elements.errorToast = document.getElementById('errorToast');
    
    console.log(`✅ Found ${Object.keys(elements).length} elements`);
}

function initializeEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Form submission
    if (elements.musicForm) {
        elements.musicForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Player controls
    if (elements.playBtn) {
        elements.playBtn.addEventListener('click', handlePlayMusic);
    }
    
    if (elements.stopBtn) {
        elements.stopBtn.addEventListener('click', handleStopMusic);
    }
    
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', handleSaveMusic);
    }
    
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Install buttons (สองตำแหน่ง)
    if (elements.installBtn) {
        console.log('🔧 Adding install listener to header button');
        elements.installBtn.addEventListener('click', handleInstall);
    }
    
    if (elements.installButton) {
        console.log('🔧 Adding install listener to banner button');
        elements.installButton.addEventListener('click', handleInstall);
    }
    
    // Dismiss install banner
    const dismissBanner = document.getElementById('dismissBanner');
    if (dismissBanner) {
        dismissBanner.addEventListener('click', () => {
            if (elements.installBanner) {
                elements.installBanner.classList.remove('show');
                localStorage.setItem('hideInstallBanner', 'true');
            }
        });
    }
    
    // Copy link button
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', handleCopyLink);
    }
    
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }
    
    // Upgrade buttons
    const upgradeButtons = document.querySelectorAll('.upgrade-btn');
    upgradeButtons.forEach(button => {
        button.addEventListener('click', handleUpgrade);
    });
    
    console.log('✅ Event listeners set up');
}

function initializeAppState() {
    console.log('🔧 Initializing app state...');
    
    // Load saved state from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedCounter = localStorage.getItem('dailyCounter');
    const savedUserData = localStorage.getItem('userData');
    
    // Get today's date
    const today = new Date().toDateString();
    const lastResetDate = localStorage.getItem('lastResetDate');
    
    // Reset counter if it's a new day
    if (lastResetDate !== today) {
        AppState.dailyCounter = 3;
        localStorage.setItem('dailyCounter', AppState.dailyCounter);
        localStorage.setItem('lastResetDate', today);
        console.log('🔄 Daily counter reset to 3 for new day');
    } else if (savedCounter) {
        AppState.dailyCounter = parseInt(savedCounter);
    } else {
        AppState.dailyCounter = 3;
        localStorage.setItem('dailyCounter', AppState.dailyCounter);
    }
    
    // Apply saved theme
    if (savedTheme) {
        AppState.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    // Apply user data
    if (savedUserData) {
        AppState.userData = JSON.parse(savedUserData);
    }
    
    // Set today's date as default for birth date
    if (elements.birthDate) {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setFullYear(today.getFullYear() - 5);
        elements.birthDate.max = today.toISOString().split('T')[0];
        elements.birthDate.value = maxDate.toISOString().split('T')[0];
    }
    
    console.log('✅ App state initialized');
}

function initializePWA() {
    console.log('📱 Initializing PWA features...');
    
    // Check if install banner should be shown
    const hideBanner = localStorage.getItem('hideInstallBanner');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!hideBanner && !isStandalone && elements.installBanner) {
        // Show banner after delay
        setTimeout(() => {
            elements.installBanner.classList.add('show');
        }, 3000);
    }
    
    // Initialize service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    }
}

// ========== PWA INSTALLATION ==========
window.deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 beforeinstallprompt event fired');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    window.deferredPrompt = e;
    
    // Update UI to show install buttons
    if (elements.installBtn) {
        elements.installBtn.style.display = 'flex';
    }
    
    if (elements.installBanner) {
        elements.installBanner.classList.add('show');
    }
    
    console.log('✅ Deferred prompt saved');
});

window.addEventListener('appinstalled', (evt) => {
    console.log('🎉 PWA installed successfully');
    window.deferredPrompt = null;
    
    // Hide install banner
    if (elements.installBanner) {
        elements.installBanner.classList.remove('show');
    }
    
    // Save install status
    localStorage.setItem('pwa_installed', 'true');
    localStorage.setItem('pwa_install_date', new Date().toISOString());
    
    // Show success message
    showToast('ติดตั้งแอปสำเร็จ!', 'success');
});

async function handleInstall() {
    console.log('📲 handleInstall() called');
    console.log('deferredPrompt exists:', !!window.deferredPrompt);
    
    if (!window.deferredPrompt) {
        console.warn('⚠️ No deferred prompt available');
        showError('ไม่พบปุ่มติดตั้งแอป กรุณาคลิก "จำลอง Install Prompt" ก่อน');
        return;
    }
    
    // ตรวจสอบว่าเป็น mock object หรือไม่
    if (window.deferredPrompt._isMock) {
        console.log('📱 Using mock installation flow');
        
        try {
            // เรียกใช้ mock prompt
            console.log('📲 Calling mock prompt...');
            const result = await window.deferredPrompt.prompt();
            console.log('✅ Mock installation result:', result);
            
            // ไม่ต้องทำอะไรเพิ่มเติม เพราะ mock prompt จะจัดการเอง
            return;
            
        } catch (error) {
            console.error('❌ Error in mock installation:', error);
            
            // ถ้า mock prompt ไม่ทำงาน ให้ใช้ manual fallback
            simulateMockInstallation();
        }
    } else {
        // กรณีเป็น real PWA installation
        try {
            console.log('📲 Calling real deferredPrompt.prompt()...');
            const result = await window.deferredPrompt.prompt();
            console.log('📲 User responded:', result);
            
            if (result.outcome === 'accepted') {
                console.log('✅ User accepted installation');
                showToast('กำลังติดตั้งแอป...', 'success');
            } else {
                console.log('❌ User dismissed installation');
                showToast('ยกเลิกการติดตั้ง', 'info');
            }
            
            window.deferredPrompt = null;
            
        } catch (error) {
            console.error('❌ Error during installation:', error);
            showError('เกิดข้อผิดพลาดในการติดตั้ง: ' + error.message);
            showManualInstallInstructions();
        }
    }
}

// เพิ่มฟังก์ชันช่วยสำหรับ simulate การติดตั้ง
function simulateMockInstallation() {
    console.log('🔄 Simulating mock installation...');
    
    // Update localStorage
    localStorage.setItem('pwa_installed', 'true');
    localStorage.setItem('pwa_install_date', new Date().toISOString());
    
    // Hide install UI
    if (elements.installBanner) {
        elements.installBanner.classList.remove('show');
        localStorage.setItem('hideInstallBanner', 'true');
    }
    
    if (elements.installBtn) {
        elements.installBtn.style.display = 'none';
    }
    
    // Show success message
    showToast('ติดตั้งแอปจำลองสำเร็จ!', 'success');
    
    // Update debug panel
    if (typeof updatePWAStatus === 'function') {
        updatePWAStatus();
    }
    
    console.log('✅ Mock installation completed');
}

function showManualInstallInstructions() {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = '';
    
    if (isiOS) {
        message = 'สำหรับ iOS: แตะปุ่ม Share (📤) แล้วเลือก "เพิ่มไปที่หน้าจอหลัก"';
    } else if (isAndroid) {
        message = 'สำหรับ Android: แตะเมนู (⋮) แล้วเลือก "ติดตั้งแอป" หรือ "เพิ่มไปที่หน้าจอหลัก"';
    } else {
        message = 'สำหรับเดสก์ท็อป: คลิกที่ปุ่มติดตั้งแอป (📥) ในแถบที่อยู่หรือเมนูเบราว์เซอร์';
    }
    
    showToast(message, 'info', 5000);
}

// ========== SIMULATE INSTALL PROMPT ==========
window.simulateInstallPrompt = function() {
    console.log('🧪 Simulating install prompt...');
    
    // สร้าง mock deferred prompt
    const mockPrompt = {
        preventDefault: () => console.log('Mock: preventDefault()'),
        prompt: () => {
            console.log('Mock: prompt() called');
            
            // Simulate installation after 1 second
            setTimeout(() => {
                console.log('🎉 Mock: App installed!');
                const installedEvent = new Event('appinstalled');
                window.dispatchEvent(installedEvent);
                
                // Update localStorage
                localStorage.setItem('pwa_installed', 'true');
                localStorage.setItem('pwa_install_date', new Date().toISOString());
                
                // Hide install UI
                const banner = document.getElementById('installBanner');
                const installBtn = document.getElementById('installBtn');
                
                if (banner) {
                    banner.classList.remove('show');
                    localStorage.setItem('hideInstallBanner', 'true');
                }
                if (installBtn) {
                    installBtn.style.display = 'none';
                }
                
                // Show success message
                if (typeof showToast === 'function') {
                    showToast('ติดตั้งแอปจำลองสำเร็จ!', 'success');
                }
            }, 1000);
            
            return Promise.resolve({ outcome: 'accepted' });
        },
        userChoice: Promise.resolve({ outcome: 'accepted' }),
        _isMock: true  // ตัวบ่งชี้ว่าเป็น mock object
    };
    
    // Store it
    window.deferredPrompt = mockPrompt;
    
    // Show install UI
    const banner = document.getElementById('installBanner');
    const installBtn = document.getElementById('installBtn');
    
    if (banner) {
        banner.classList.add('show');
        localStorage.removeItem('hideInstallBanner'); // ล้างค่าเพื่อให้แสดง banner
    }
    
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
    
    console.log('✅ Mock deferred prompt created');
    
    // Show toast
    if (typeof showToast === 'function') {
        showToast('สร้าง Install Prompt จำลองสำเร็จ!', 'success');
    }
    
    // Update debug panel
    if (typeof updatePWAStatus === 'function') {
        updatePWAStatus();
    }
    
    return mockPrompt;
};

// ========== FORM HANDLING ==========
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('📝 Form submitted');
    
    // Check daily limit
    if (AppState.dailyCounter <= 0) {
        showError('คุณสร้างเพลงครบกำหนดวันนี้แล้ว กรุณาลองใหม่พรุ่งนี้');
        return;
    }
    
    // Validate form
    if (!validateForm()) {
        showError('กรุณากรอกข้อมูลให้ครบถ้วนและยอมรับเงื่อนไข');
        return;
    }
    
    try {
        // Show loading
        showLoading('กำลังสร้างเพลง...');
        
        // Collect form data
        const formData = {
            fullName: elements.fullName.value.trim(),
            birthDate: elements.birthDate.value,
            birthTime: elements.birthTime.value || '12:00',
            musicStyle: elements.musicStyle.value,
            timestamp: new Date().toISOString()
        };
        
        // Save user data
        AppState.userData = formData;
        localStorage.setItem('userData', JSON.stringify(formData));
        
        // Generate music
        const music = await generateMusic(formData);
        
        // Update app state
        AppState.currentMusic = music;
        AppState.dailyCounter--;
        
        // Save to localStorage
        localStorage.setItem('dailyCounter', AppState.dailyCounter.toString());
        
        // Hide loading
        hideLoading();
        
        // Display result
        displayMusicResult(music);
        
        // Show success message
        showToast('สร้างเพลงสำเร็จ! 🎵', 'success');
        
        // Update counter display
        updateDailyCounter();
        
        console.log('✅ Music generated successfully');
        
    } catch (error) {
        console.error('❌ Music generation failed:', error);
        hideLoading();
        showError('ไม่สามารถสร้างเพลงได้: ' + error.message);
    }
}

function validateForm() {
    if (!elements.fullName.value.trim()) return false;
    if (!elements.birthDate.value) return false;
    if (!elements.agreeTerms.checked) return false;
    return true;
}

// ========== MUSIC GENERATION ==========
async function generateMusic(formData) {
    console.log('🎵 Generating music...');
    
    return {
        title: `เพลงของ ${formData.fullName.split(' ')[0]}`,
        key: 'Am',
        tempo: 85,
        pattern: 'Lo-fi Beats',
        melody: ['A4', 'C4', 'E4', 'G4', 'F4', 'A4', 'C4', 'E4'],
        chords: ['Am', 'F', 'C', 'G'],
        style: formData.musicStyle,
        uniqueId: 'MUSIC-' + Date.now().toString().slice(-8),
        generatedAt: new Date().toISOString()
    };
}

// ========== RESULT DISPLAY ==========
function displayMusicResult(music) {
    console.log('🎼 Displaying music result...');
    
    if (!music || !elements.resultSection) return;
    
    // Update UI with music data
    elements.songTitle.textContent = music.title;
    elements.songKey.textContent = music.key;
    elements.songTempo.textContent = `${music.tempo} BPM`;
    elements.songPattern.textContent = music.pattern;
    
    // Create visualizer bars
    createVisualizerBars(music.melody.length);
    
    // Display melody notes
    displayMelodyNotes(music.melody);
    
    // Show result section
    elements.resultSection.classList.remove('hidden');
    
    // Scroll to result
    elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

function createVisualizerBars(count = 16) {
    if (!elements.visualizerBars) return;
    
    elements.visualizerBars.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.height = `${20 + Math.random() * 80}px`;
        elements.visualizerBars.appendChild(bar);
    }
}

function displayMelodyNotes(melody) {
    if (!elements.melodyNotes || !melody) return;
    
    elements.melodyNotes.innerHTML = '';
    
    melody.forEach(note => {
        const noteElement = document.createElement('span');
        noteElement.className = 'note';
        noteElement.textContent = note;
        elements.melodyNotes.appendChild(noteElement);
    });
}

// ========== PLAYER CONTROLS ==========
function handlePlayMusic() {
    console.log('▶ Playing music...');
    
    if (!AppState.currentMusic) {
        showError('ไม่มีเพลงที่จะเล่น');
        return;
    }
    
    if (AppState.isPlaying) {
        handleStopMusic();
        return;
    }
    
    // Request audio permission first
    if (window.MusicCore && window.MusicCore.requestAudioPermission) {
        window.MusicCore.requestAudioPermission().then(success => {
            if (success) {
                // Play the melody
                window.MusicCore.playMelody(AppState.currentMusic.melody, AppState.currentMusic.tempo);
                
                // Update UI
                AppState.isPlaying = true;
                elements.playBtn.innerHTML = '<i class="fas fa-pause"></i> หยุดชั่วคราว';
                elements.playBtn.classList.add('playing');
                
                // Show playback status
                const playbackStatus = document.getElementById('playbackStatus');
                if (playbackStatus) {
                    playbackStatus.classList.remove('hidden');
                }
                
                // Start visualizer animation
                startVisualizerAnimation();
                
                // Auto-stop after melody duration
                const melodyDuration = (AppState.currentMusic.melody.length * 60 / AppState.currentMusic.tempo) * 1000;
                setTimeout(() => {
                    if (AppState.isPlaying) {
                        handleStopMusic();
                    }
                }, melodyDuration);
                
                showToast('กำลังเล่นเพลง...', 'info');
                
            } else {
                showError('ไม่ได้รับอนุญาตให้เล่นเสียง กรุณาคลิกที่ปุ่มเล่นอีกครั้ง');
            }
        });
    } else {
        // Fallback to simple note
        if (AppState.currentMusic.melody && AppState.currentMusic.melody.length > 0) {
            const frequency = window.MusicCore.noteToFrequency(AppState.currentMusic.melody[0]);
            window.MusicCore.playTone(frequency, 1);
            
            // Update UI
            AppState.isPlaying = true;
            elements.playBtn.innerHTML = '<i class="fas fa-pause"></i> หยุดชั่วคราว';
            elements.playBtn.classList.add('playing');
            
            // Show playback status
            const playbackStatus = document.getElementById('playbackStatus');
            if (playbackStatus) {
                playbackStatus.classList.remove('hidden');
            }
            
            showToast('กำลังเล่นโน้ตแรก...', 'info');
        }
    }
}

function handleStopMusic() {
    console.log('⏹ Stopping music...');
    
    // Update UI
    AppState.isPlaying = false;
    elements.playBtn.innerHTML = '<i class="fas fa-play"></i> เล่นเพลง';
    elements.playBtn.classList.remove('playing');
    
    // Hide playback status
    const playbackStatus = document.getElementById('playbackStatus');
    if (playbackStatus) {
        playbackStatus.classList.add('hidden');
    }
    
    // Stop audio
    if (window.MusicCore && window.MusicCore.stopAudio) {
        window.MusicCore.stopAudio();
    }
    
    // Stop visualizer animation
    stopVisualizerAnimation();
    
    console.log('🎧 Playback stopped');
}

function startVisualizerAnimation() {
    if (!AppState.isPlaying || !elements.visualizerBars) return;
    
    const bars = elements.visualizerBars.querySelectorAll('.visualizer-bar');
    
    bars.forEach(bar => {
        const animate = () => {
            if (!AppState.isPlaying) return;
            
            const randomHeight = 20 + Math.random() * 80;
            bar.style.height = `${randomHeight}px`;
            
            setTimeout(() => {
                animate();
            }, 100 + Math.random() * 200);
        };
        
        animate();
    });
}

function stopVisualizerAnimation() {
    if (!elements.visualizerBars) return;
    
    const bars = elements.visualizerBars.querySelectorAll('.visualizer-bar');
    bars.forEach(bar => {
        bar.style.height = '20px';
    });
}

// ========== MUSIC SAVING ==========
function handleSaveMusic() {
    console.log('💾 Saving music...');
    
    if (!AppState.currentMusic) {
        showError('ไม่มีเพลงที่จะบันทึก');
        return;
    }
    
    try {
        // Create music data to save
        const musicData = {
            ...AppState.currentMusic,
            savedAt: new Date().toISOString(),
            userData: AppState.userData
        };
        
        // Convert to JSON and create download
        const blob = new Blob([JSON.stringify(musicData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `psychomatrix-music-${musicData.uniqueId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('บันทึกเพลงสำเร็จ!', 'success');
        
        console.log('✅ Music saved');
        
    } catch (error) {
        console.error('❌ Failed to save music:', error);
        showError('ไม่สามารถบันทึกเพลงได้');
    }
}

// ========== SHARE FUNCTIONS ==========
async function handleCopyLink() {
    try {
        const musicId = AppState.currentMusic?.uniqueId;
        const shareUrl = `${window.location.origin}/?music=${musicId}`;
        
        await navigator.clipboard.writeText(shareUrl);
        showToast('คัดลอกลิงก์เพลงแล้ว!', 'success');
    } catch (error) {
        console.error('❌ Copy failed:', error);
        showError('ไม่สามารถคัดลอกลิงก์ได้');
    }
}

async function handleShare() {
    if (!AppState.currentMusic) {
        showError('ไม่มีเพลงที่จะแชร์');
        return;
    }
    
    try {
        const shareData = {
            title: AppState.currentMusic.title,
            text: `เพลงของฉันจาก Psychomatrix Music: ${AppState.currentMusic.title}`,
            url: window.location.href
        };
        
        if (navigator.share && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            // Fallback to copy link
            await handleCopyLink();
        }
    } catch (error) {
        console.error('❌ Share failed:', error);
        showError('ไม่สามารถแชร์เพลงได้');
    }
}

// ========== THEME MANAGEMENT ==========
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update DOM
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update state
    AppState.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    updateThemeIcon(newTheme);
    
    console.log(`🎨 Theme changed to ${newTheme}`);
}

function updateThemeIcon(theme) {
    if (!elements.themeToggle) return;
    
    const icon = elements.themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ========== UPGRADE HANDLING ==========
function handleUpgrade(event) {
    const tier = event.target.closest('.pricing-tier');
    const tierName = tier.querySelector('h4')?.textContent || 'Unknown';
    
    console.log(`💎 Upgrade requested: ${tierName}`);
    
    showToast(`อัพเกรดเป็น ${tierName} - ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้!`, 'info');
    
    // Scroll to top for demo purposes
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== UTILITY FUNCTIONS ==========
function showLoading(message) {
    if (!elements.loadingModal) return;
    
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage && message) {
        loadingMessage.textContent = message;
    }
    
    elements.loadingModal.classList.remove('hidden');
}

function hideLoading() {
    if (!elements.loadingModal) return;
    elements.loadingModal.classList.add('hidden');
}

function showToast(message, type = 'success', duration = 3000) {
    if (!elements.successToast || !elements.errorToast) return;
    
    const toast = type === 'error' ? elements.errorToast : elements.successToast;
    const messageElement = toast.querySelector('span');
    
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    toast.classList.add('show');
    
    // Auto hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function showError(message) {
    showToast(message, 'error');
}

function updateDailyCounter() {
    if (!elements.dailyCounter) return;
    elements.dailyCounter.textContent = AppState.dailyCounter;
}

// ========== EXPORT FOR DEBUGGING ==========
window.showToast = showToast;
window.showError = showError;
window.updateDailyCounter = updateDailyCounter;

console.log('🎵 Psychomatrix Music PWA - Ready!');

// ========== PWA DEBUG FUNCTIONS ==========
function showPWAStatus() {
    console.log('📱 PWA Status:');
    console.log('- deferredPrompt:', !!window.deferredPrompt);
    console.log('- isStandalone:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('- localStorage pwa_installed:', localStorage.getItem('pwa_installed'));
    console.log('- userAgent:', navigator.userAgent);
}

// เรียกใช้ showPWAStatus เมื่อโหลดแอป
window.showPWAStatus = showPWAStatus;