// music-core.js - ฟังก์ชันหลักสำหรับสร้างเพลง (เวอร์ชันย่อ)
console.log('🎵 Music Core Module v1.0');

// ========== CONFIGURATION ==========
const MUSIC_CONFIG = {
    scales: {
        'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
        'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
        'Am': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        'Em': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
        'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']
    },
    
    styles: {
        'lofi': {
            name: 'Lo-fi Beats',
            tempoRange: { min: 70, max: 100 },
            chords: ['Am', 'F', 'C', 'G'],
            pattern: 'jazzy'
        },
        'chill': {
            name: 'Chill / Ambient',
            tempoRange: { min: 60, max: 80 },
            chords: ['Am', 'Dm', 'F', 'C'],
            pattern: 'ambient'
        },
        'study': {
            name: 'Study / Focus',
            tempoRange: { min: 80, max: 100 },
            chords: ['C', 'G', 'Am', 'F'],
            pattern: 'minimal'
        },
        'relax': {
            name: 'Relax / Meditation',
            tempoRange: { min: 50, max: 70 },
            chords: ['Am', 'F', 'C', 'Em'],
            pattern: 'pad'
        }
    }
};



// ========== UTILITY FUNCTIONS ==========
function getLofiScale(key = 'Am') {
    return MUSIC_CONFIG.scales[key] || MUSIC_CONFIG.scales['Am'];
}

function calculateLifePathNumber(birthDate) {
    // แปลงวันที่เป็นตัวเลขชีวิตแบบง่ายๆ
    const dateStr = birthDate.replace(/\D/g, '');
    let sum = 0;
    
    for (let char of dateStr) {
        sum += parseInt(char);
    }
    
    // Reduce to single digit (1-9)
    while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }
    
    return sum;
}

function extractNumbersFromName(name) {
    const numberMap = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
    };
    
    const numbers = [];
    const upperName = name.toUpperCase();
    
    for (let char of upperName) {
        if (numberMap[char] !== undefined) {
            numbers.push(numberMap[char]);
        }
    }
    
    return numbers;
}

// ========== MUSIC GENERATION ==========
function generateSimpleMelody(seedNumbers, scale, length = 8) {
    const melody = [];
    
    for (let i = 0; i < length; i++) {
        const seedIndex = i % seedNumbers.length;
        const seedValue = seedNumbers[seedIndex] || 1;
        const noteIndex = (seedValue + i) % scale.length;
        const octave = 4 + Math.floor((seedValue + i) / scale.length) % 2;
        
        melody.push(scale[noteIndex] + octave);
    }
    
    return melody;
}

function generateChords(style, key) {
    const styleConfig = MUSIC_CONFIG.styles[style] || MUSIC_CONFIG.styles.lofi;
    return styleConfig.chords.map(chord => {
        // Simple chord transposition (basic implementation)
        return chord;
    });
}

function generateMusicData(userData) {
    console.log('🎵 Generating music for:', userData);
    
    try {
        // Calculate seed numbers
        const lifePath = calculateLifePathNumber(userData.birthDate);
        const nameNumbers = extractNumbersFromName(userData.fullName);
        const seedNumbers = [lifePath, ...nameNumbers.slice(0, 3)];
        
        // Get scale based on style
        const style = userData.musicStyle || 'lofi';
        const key = style === 'lofi' ? 'Am' : 'C';
        const scale = getLofiScale(key);
        
        // Generate components
        const melody = generateSimpleMelody(seedNumbers, scale, 8);
        const chords = generateChords(style, key);
        
        // Calculate tempo based on style and birth date
        const styleConfig = MUSIC_CONFIG.styles[style];
        const tempo = styleConfig.tempoRange.min + (lifePath % (styleConfig.tempoRange.max - styleConfig.tempoRange.min));
        
        // Create unique ID
        const uniqueId = 'MUSIC-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
        
        // Build result
        const result = {
            title: `เพลงของ ${userData.fullName.split(' ')[0]}`,
            key: key,
            tempo: tempo,
            pattern: styleConfig.name,
            style: style,
            melody: melody,
            chords: chords,
            lifePathNumber: lifePath,
            seedNumbers: seedNumbers,
            uniqueId: uniqueId,
            generatedAt: new Date().toISOString(),
            generatorVersion: '1.0-core'
        };
        
        console.log('✅ Music generated:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Music generation failed:', error);
        return generateFallbackMusic(userData);
    }
}

function generateFallbackMusic(userData) {
    console.log('🎵 Using fallback music generation');
    
    return {
        title: `เพลงของ ${userData.fullName.split(' ')[0]}`,
        key: 'Am',
        tempo: 85,
        pattern: 'Lo-fi Beats',
        style: userData.musicStyle || 'lofi',
        melody: ['A4', 'C4', 'E4', 'G4', 'F4', 'A4', 'C4', 'E4'],
        chords: ['Am', 'F', 'C', 'G'],
        lifePathNumber: 1,
        seedNumbers: [1, 2, 3],
        uniqueId: 'FB-' + Date.now().toString().slice(-8),
        generatedAt: new Date().toISOString(),
        generatorVersion: '1.0-fallback'
    };
}

// ========== AUDIO PLAYBACK (Basic) ==========
let audioContext = null;
let oscillator = null;

function playSimpleNote(frequency, duration = 0.5) {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Create oscillator
        oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        // Configure gain (volume)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play note
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
        
    } catch (error) {
        console.error('❌ Audio playback failed:', error);
    }
}


// เพิ่มฟังก์ชันใหม่สำหรับเล่นเพลงจริง

// ========== AUDIO CONTEXT MANAGEMENT ==========
let globalAudioContext = null;
let isAudioContextReady = false;

// Initialize audio context on user interaction
function initializeAudioContext() {
    if (!globalAudioContext) {
        try {
            globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 AudioContext created');
            isAudioContextReady = true;
            return globalAudioContext;
        } catch (error) {
            console.error('❌ Failed to create AudioContext:', error);
            return null;
        }
    }
    return globalAudioContext;
}

// Request audio permission on first user interaction
function requestAudioPermission() {
    if (!globalAudioContext) {
        globalAudioContext = initializeAudioContext();
    }
    
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
        return globalAudioContext.resume().then(() => {
            console.log('🔊 AudioContext resumed');
            isAudioContextReady = true;
            return true;
        }).catch(error => {
            console.error('❌ Failed to resume AudioContext:', error);
            return false;
        });
    }
    
    return Promise.resolve(true);
}

// ========== SIMPLE TONE PLAYER ==========
function playTone(frequency, duration = 0.5, type = 'sine') {
    if (!isAudioContextReady || !globalAudioContext) {
        console.warn('⚠️ Audio not ready. Initializing...');
        if (!initializeAudioContext()) {
            console.error('❌ Cannot play tone: AudioContext not available');
            return;
        }
    }
    
    try {
        const oscillator = globalAudioContext.createOscillator();
        const gainNode = globalAudioContext.createGain();
        
        // Configure oscillator
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, globalAudioContext.currentTime);
        
        // Configure gain (volume) - ADSR envelope
        gainNode.gain.setValueAtTime(0, globalAudioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, globalAudioContext.currentTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.1, globalAudioContext.currentTime + duration - 0.1); // Decay
        gainNode.gain.linearRampToValueAtTime(0, globalAudioContext.currentTime + duration); // Release
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(globalAudioContext.destination);
        
        // Play and schedule stop
        oscillator.start();
        oscillator.stop(globalAudioContext.currentTime + duration);
        
        console.log(`🎵 Playing tone: ${frequency}Hz for ${duration}s`);
        
    } catch (error) {
        console.error('❌ Error playing tone:', error);
    }
}

// ========== NOTE TO FREQUENCY ==========
function noteToFrequency(note) {
    // Note format: "C4", "A4", etc.
    const noteMap = {
        'C': 261.63,  // C4
        'C#': 277.18,
        'D': 293.66,
        'D#': 311.13,
        'E': 329.63,
        'F': 349.23,
        'F#': 369.99,
        'G': 392.00,
        'G#': 415.30,
        'A': 440.00,  // A4
        'A#': 466.16,
        'B': 493.88
    };
    
    // Extract note name and octave
    let noteName = '';
    let octave = 4; // default octave
    
    if (note.length >= 2) {
        if (note[1] === '#' || note[1] === 'b') {
            noteName = note.substring(0, 2);
            octave = parseInt(note.substring(2)) || 4;
        } else {
            noteName = note[0];
            octave = parseInt(note.substring(1)) || 4;
        }
    }
    
    // Get base frequency
    let baseFreq = noteMap[noteName];
    if (!baseFreq) {
        console.warn(`⚠️ Unknown note: ${noteName}, using A4 (440Hz)`);
        baseFreq = 440;
        octave = 4;
    }
    
    // Calculate frequency based on octave
    return baseFreq * Math.pow(2, octave - 4);
}

// ========== PLAY MELODY FUNCTION ==========
let currentSequence = null;

function playMelody(melody, tempo = 120) {
    if (!melody || melody.length === 0) {
        console.error('❌ No melody to play');
        return;
    }
    
    // Stop any existing playback
    stopAudio();
    
    // Initialize audio
    if (!initializeAudioContext()) {
        console.error('❌ Cannot play melody: AudioContext not available');
        return;
    }
    
    // Request permission
    requestAudioPermission().then(success => {
        if (!success) {
            console.error('❌ Audio permission denied');
            return;
        }
        
        console.log(`🎵 Playing melody at ${tempo} BPM:`, melody);
        
        // Calculate note duration in seconds (quarter note = 60/tempo seconds)
        const noteDuration = (60 / tempo) / 2; // eighth notes
        
        // Play each note in sequence
        let currentTime = globalAudioContext.currentTime;
        const notes = [];
        
        melody.forEach((note, index) => {
            if (note && typeof note === 'string') {
                const frequency = noteToFrequency(note);
                if (frequency) {
                    notes.push({
                        time: currentTime + (index * noteDuration),
                        frequency: frequency
                    });
                }
            }
        });
        
        // Schedule notes
        notes.forEach(note => {
            const oscillator = globalAudioContext.createOscillator();
            const gainNode = globalAudioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(globalAudioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(note.frequency, note.time);
            
            // ADSR envelope
            gainNode.gain.setValueAtTime(0, note.time);
            gainNode.gain.linearRampToValueAtTime(0.2, note.time + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.05, note.time + noteDuration - 0.1);
            gainNode.gain.linearRampToValueAtTime(0, note.time + noteDuration);
            
            oscillator.start(note.time);
            oscillator.stop(note.time + noteDuration);
        });
        
        // Set current sequence for stopping
        currentSequence = {
            startTime: currentTime,
            duration: notes.length * noteDuration,
            notes: notes
        };
        
        console.log(`✅ Melody scheduled. Duration: ${currentSequence.duration.toFixed(2)}s`);
        
    }).catch(error => {
        console.error('❌ Error playing melody:', error);
    });
}

function stopAudio() {
    if (currentSequence) {
        console.log('⏹ Stopping audio playback');
        currentSequence = null;
    }
    
    // We can't stop individual oscillators easily, but we can stop the context
    if (globalAudioContext && globalAudioContext.state === 'running') {
        globalAudioContext.suspend().then(() => {
            console.log('🔊 AudioContext suspended');
        });
    }
}

// ========== UPDATE EXPORTS ==========
window.MusicCore = {
    generateMusicData,
    generateFallbackMusic,
    getLofiScale,
    calculateLifePathNumber,
    extractNumbersFromName,
    
    // Audio functions
    initializeAudioContext,
    requestAudioPermission,
    playTone,
    playMelody,
    stopAudio,
    noteToFrequency,
    
    MUSIC_CONFIG
};


console.log('✅ Music Core Module loaded');
