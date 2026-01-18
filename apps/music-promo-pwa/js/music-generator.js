// music-generator.js - ฟังก์ชันสร้างเพลงขั้นสูง (เวอร์ชันย่อ)
console.log('🎵 Music Generator Module v1.0');

// ========== CONSTANTS ==========
const CHORD_PROGRESSIONS = {
    lofi: [
        ['Am', 'F', 'C', 'G'],
        ['Am', 'C', 'G', 'F'],
        ['C', 'G', 'Am', 'F'],
        ['F', 'C', 'G', 'Am']
    ],
    chill: [
        ['Am', 'Dm', 'F', 'C'],
        ['C', 'Am', 'F', 'G'],
        ['Em', 'C', 'G', 'D']
    ],
    study: [
        ['C', 'G', 'Am', 'F'],
        ['G', 'Em', 'C', 'D'],
        ['Am', 'F', 'C', 'G']
    ],
    relax: [
        ['Am', 'F', 'C', 'G'],
        ['C', 'G', 'Am', 'Em'],
        ['Dm', 'Am', 'C', 'F']
    ]
};

const NOTE_VALUES = {
    'C': 1, 'C#': 2, 'D': 3, 'D#': 4, 'E': 5, 'F': 6,
    'F#': 7, 'G': 8, 'G#': 9, 'A': 10, 'A#': 11, 'B': 12
};

// ========== PERSONALIZED MUSIC GENERATION ==========
class MusicGenerator {
    constructor() {
        this.version = '1.0';
        console.log('🎵 Initializing Music Generator v' + this.version);
    }
    
    // สร้าง unique seed จากข้อมูลผู้ใช้
    createUniqueSeed(userData) {
        const seedString = [
            userData.fullName,
            userData.birthDate,
            userData.birthTime
        ].join('').toLowerCase();
        
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
            hash = hash & hash;
        }
        
        return Math.abs(hash);
    }
    
    // แปลงตัวเลขเป็นโน้ต
    numberToNote(number, scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], baseOctave = 4) {
        const noteIndex = (number - 1) % scale.length;
        const octaveShift = Math.floor((number - 1) / scale.length);
        const octave = baseOctave + octaveShift;
        
        return scale[noteIndex] + octave;
    }
    
    // สร้างเมโลดี้จากตัวเลข
    createMelodyFromNumbers(numbers, style = 'lofi', length = 16) {
        const scale = this.getScaleForStyle(style);
        const melody = [];
        
        for (let i = 0; i < length; i++) {
            const numIndex = i % numbers.length;
            const note = this.numberToNote(numbers[numIndex], scale, 4);
            melody.push(note);
        }
        
        return melody;
    }
    
    // สร้างคอร์ดจากตัวเลข
    createChordsFromNumbers(numbers, style = 'lofi') {
        const progression = this.getChordProgression(style);
        const chords = [];
        
        for (let i = 0; i < Math.min(4, numbers.length); i++) {
            const chordIndex = numbers[i] % progression.length;
            chords.push(progression[chordIndex]);
        }
        
        return chords;
    }
    
    createPlayableMelody(numbers, style = 'lofi', length = 8) {
        const scale = this.getScaleForStyle(style);
        const melody = [];
    
        for (let i = 0; i < length; i++) {
            const numIndex = i % numbers.length;
            const noteValue = numbers[numIndex] || 1;
            const noteIndex = noteValue % scale.length;
        
            // Use different octaves for variety (4-5)
            const octave = 4 + (i % 2);
            melody.push(scale[noteIndex] + octave);
        }
    
        return melody;
    }

    // สร้างเพลงที่ personal
    createPersonalizedMusic(userData) {
        console.log('🎵 Creating personalized music for:', userData);
        
        
        try {
            // ดึงข้อมูลพื้นฐาน
            const style = userData.musicStyle || 'lofi';
            const lifePath = this.calculateLifePath(userData.birthDate);
            const nameNumbers = this.extractNameNumbers(userData.fullName);
            
            // รวมตัวเลข seed
            const seedNumbers = [lifePath, ...nameNumbers.slice(0, 3)];
            
            // สร้าง unique ID
            const uniqueSeed = this.createUniqueSeed(userData);
            const uniqueId = 'PM-' + uniqueSeed.toString(36).slice(0, 8).toUpperCase();
            
            // สร้างส่วนประกอบเพลง
            const melody = this.createMelodyFromNumbers(seedNumbers, style, 12);
            const chords = this.createChordsFromNumbers(seedNumbers, style);
            const tempo = this.calculateTempo(lifePath, style);
            const key = this.determineKey(style, lifePath);
            
            // สร้าง personal info
            const personalInfo = this.createPersonalInfo(userData, uniqueId);
            
            // สร้างผลลัพธ์
            const result = {
                title: this.generateTitle(userData.fullName, style),
                key: key,
                tempo: tempo,
                style: style,
                pattern: this.getPatternName(style),
                melody: melody,
                chords: chords,
                lifePathNumber: lifePath,
                seedNumbers: seedNumbers,
                uniqueId: uniqueId,
                personalInfo: personalInfo,
                generatedAt: new Date().toISOString(),
                generatorVersion: this.version + '-personalized'
            };
            
            const melody = this.createPlayableMelody(seedNumbers, style, 8);
       
            console.log('✅ Personalized music created:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Personalized music creation failed:', error);
            return this.createFallbackMusic(userData);
        }
    }
    
    // ========== HELPER FUNCTIONS ==========
    calculateLifePath(birthDate) {
        // วิธีคำนวณตัวเลขเส้นชีวิตแบบง่าย
        const cleanDate = birthDate.replace(/\D/g, '');
        let sum = 0;
        
        for (let digit of cleanDate) {
            sum += parseInt(digit);
        }
        
        // ลดให้เหลือตัวเลขเดียว (ยกเว้น 11, 22)
        while (sum > 9 && sum !== 11 && sum !== 22) {
            sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
        }
        
        return sum;
    }
    
    extractNameNumbers(fullName) {
        const numberMap = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
            'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
        };
        
        const numbers = [];
        const upperName = fullName.toUpperCase().replace(/\s/g, '');
        
        for (let char of upperName) {
            if (numberMap[char]) {
                numbers.push(numberMap[char]);
            }
        }
        
        return numbers;
    }
    
    getScaleForStyle(style) {
        const scales = {
            'lofi': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            'chill': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
            'study': ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
            'relax': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']
        };
        
        return scales[style] || scales.lofi;
    }
    
    getChordProgression(style) {
        return CHORD_PROGRESSIONS[style] || CHORD_PROGRESSIONS.lofi[0];
    }
    
    calculateTempo(lifePath, style) {
        const baseTempos = {
            'lofi': 85,
            'chill': 72,
            'study': 92,
            'relax': 65
        };
        
        const base = baseTempos[style] || 85;
        const variation = lifePath % 15; // ±7 BPM
        return base + variation - 7;
    }
    
    determineKey(style, lifePath) {
        const keys = ['C', 'G', 'D', 'Am', 'Em', 'F'];
        return keys[lifePath % keys.length];
    }
    
    generateTitle(fullName, style) {
        const firstName = fullName.split(' ')[0];
        const styleNames = {
            'lofi': 'Lo-fi Dreams',
            'chill': 'Chill Vibes',
            'study': 'Focus Flow',
            'relax': 'Meditation Path'
        };
        
        return `${styleNames[style]} ของ ${firstName}`;
    }
    
    getPatternName(style) {
        const patterns = {
            'lofi': 'Jazzy Lo-fi',
            'chill': 'Ambient Pad',
            'study': 'Minimal Focus',
            'relax': 'Meditation Drone'
        };
        
        return patterns[style] || 'Personalized';
    }
    
    createPersonalInfo(userData, uniqueId) {
        const info = {
            uniqueId: uniqueId,
            generatedAt: new Date().toISOString()
        };
        
        // เพิ่มชื่อถ้ามี
        if (userData.fullName && userData.fullName.trim()) {
            info.name = userData.fullName.trim();
        }
        
        // เพิ่มวันเกิดถ้ามี
        if (userData.birthDate) {
            info.birthDate = userData.birthDate;
        }
        
        return info;
    }
    
    createFallbackMusic(userData) {
        console.log('🎵 Creating fallback music');
        
        const firstName = userData.fullName ? userData.fullName.split(' ')[0] : 'คุณ';
        
        return {
            title: `เพลงของ ${firstName}`,
            key: 'Am',
            tempo: 85,
            style: userData.musicStyle || 'lofi',
            pattern: 'Lo-fi Beats',
            melody: ['A4', 'C4', 'E4', 'G4', 'F4', 'A4', 'C4', 'E4', 'G4', 'F4'],
            chords: ['Am', 'F', 'C', 'G'],
            lifePathNumber: 1,
            seedNumbers: [1, 2, 3, 4],
            uniqueId: 'FB-' + Date.now().toString().slice(-6),
            personalInfo: {
                name: userData.fullName || 'ผู้ใช้',
                uniqueId: 'FB-' + Date.now().toString().slice(-6)
            },
            generatedAt: new Date().toISOString(),
            generatorVersion: this.version + '-fallback'
        };
    }
}

// ========== EXPORTS ==========
window.MusicGenerator = new MusicGenerator();

// ========== COMPATIBILITY FUNCTIONS ==========
window.generateMusic = async function(userData) {
    return window.MusicGenerator.createPersonalizedMusic(userData);
};

console.log('✅ Music Generator Module loaded');
