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

function stopAudio() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
}

// ========== EXPORTS ==========
window.MusicCore = {
    generateMusicData,
    generateFallbackMusic,
    getLofiScale,
    calculateLifePathNumber,
    extractNumbersFromName,
    playSimpleNote,
    stopAudio,
    MUSIC_CONFIG
};

console.log('✅ Music Core Module loaded');
