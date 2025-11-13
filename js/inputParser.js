// Strategy Pattern for Input Parsing

// Base Strategy Interface
class InputStrategy {
    canHandle(input) {
        throw new Error('canHandle must be implemented');
    }

    parse(input) {
        throw new Error('parse must be implemented');
    }
}

// Strategy for Exercise Sets (e.g., "bench 8, 8, 7 x 100")
class ExerciseSetsStrategy extends InputStrategy {
    canHandle(input) {
        const normalized = input.toLowerCase();
        return /(.+?)\s+([\d,\s]+)\s*x\s*([\d.,]+)\s*(lbs?|kg)?/.test(normalized);
    }

    parse(input) {
        const t = input.toLowerCase();
        const m = t.match(/(.+?)\s+([\d,\s]+)\s*x\s*([\d.,]+)\s*(lbs?|kg)?/);
        if (!m) return null;
        return {
            ex: m[1].trim(),
            reps: m[2].split(',').map(r => +r.trim()),
            wt: +m[3].replace(',', '.'),
            unit: m[4] || 'kg',
            date: Date.now(),
            workout_id: null  // Will be assigned when workout is ended
        };
    }
}

// Strategy for workout commands (e.g., "end workout")
class EndWorkoutStrategy extends InputStrategy {
    canHandle(input) {
        const normalized = input.toLowerCase().trim();
        return normalized === 'end workout' || normalized === 'end';
    }

    parse(input) {
        return {
            type: 'command',
            action: 'end_workout'
        };
    }
}

// Default Strategy for unrecognized input
class DefaultStrategy extends InputStrategy {
    canHandle(input) {
        return true; // Always handles input as fallback
    }

    parse(input) {
        return null; // Return null to indicate unrecognized input
    }
}

// Input Parser (Context) that manages strategies
class InputParser {
    constructor() {
        this.strategies = [
            new EndWorkoutStrategy(),      // Check commands first
            new ExerciseSetsStrategy(),     // Then exercise formats
            new DefaultStrategy()           // Finally, fallback
        ];
    }

    parse(input) {
        for (const strategy of this.strategies) {
            if (strategy.canHandle(input)) {
                return strategy.parse(input);
            }
        }
        return null;
    }
}

// Export for Node.js (for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InputStrategy,
        ExerciseSetsStrategy,
        EndWorkoutStrategy,
        DefaultStrategy,
        InputParser
    };
}
