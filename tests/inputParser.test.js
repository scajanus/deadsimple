// Test file for InputParser strategy pattern

const {
    InputStrategy,
    ExerciseSetsStrategy,
    DefaultStrategy,
    InputParser
} = require('../js/inputParser.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        testsPassed++;
        console.log(`  ✓ ${message}`);
    } else {
        testsFailed++;
        console.log(`  ✗ ${message}`);
    }
}

function assertDeepEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr === expectedStr) {
        testsPassed++;
        console.log(`  ✓ ${message}`);
    } else {
        testsFailed++;
        console.log(`  ✗ ${message}`);
        console.log(`    Expected: ${expectedStr}`);
        console.log(`    Actual: ${actualStr}`);
    }
}

function describe(description, fn) {
    console.log(`\n${description}`);
    fn();
}

// Tests
console.log('=' .repeat(60));
console.log('Testing Input Parser Strategy Pattern');
console.log('=' .repeat(60));

// Test InputStrategy base class
describe('InputStrategy Base Class', () => {
    const strategy = new InputStrategy();

    try {
        strategy.canHandle('test');
        assert(false, 'should throw error for canHandle');
    } catch (e) {
        assert(e.message === 'canHandle must be implemented', 'throws correct error for canHandle');
    }

    try {
        strategy.parse('test');
        assert(false, 'should throw error for parse');
    } catch (e) {
        assert(e.message === 'parse must be implemented', 'throws correct error for parse');
    }
});

// Test ExerciseSetsStrategy
describe('ExerciseSetsStrategy', () => {
    const strategy = new ExerciseSetsStrategy();

    // Test canHandle
    assert(strategy.canHandle('bench 8, 8, 7 x 100'), 'recognizes valid exercise format');
    assert(strategy.canHandle('SQUAT 5,5 x 100 kg'), 'handles uppercase input');
    assert(strategy.canHandle('deadlift 10 x 225 lbs'), 'handles lbs unit');
    assert(!strategy.canHandle('invalid input'), 'rejects invalid format');
    assert(!strategy.canHandle('just some text'), 'rejects non-exercise text');
    assert(!strategy.canHandle(''), 'rejects empty string');

    // Test parse - basic format
    const result1 = strategy.parse('bench 8, 8, 7 x 100');
    assert(result1 !== null, 'parses valid input');
    assert(result1.ex === 'bench', 'extracts exercise name');
    assertDeepEqual(result1.reps, [8, 8, 7], 'parses reps array');
    assert(result1.wt === 100, 'parses weight');
    assert(result1.unit === 'kg', 'defaults to kg');
    assert(typeof result1.date === 'number', 'includes timestamp');

    // Test with explicit unit
    const result2 = strategy.parse('squat 5,5 x 100 kg');
    assert(result2.unit === 'kg', 'parses kg unit');

    const result3 = strategy.parse('deadlift 10,8,6 x 225 lbs');
    assert(result3.unit === 'lbs', 'parses lbs unit');

    const result4 = strategy.parse('press 10 x 50 lb');
    assert(result4.unit === 'lb', 'parses lb unit');

    // Test decimal weights
    const result5 = strategy.parse('press 8 x 100.5');
    assert(result5.wt === 100.5, 'parses decimal weight with dot');

    const result6 = strategy.parse('curl 10 x 50,5 kg');
    assert(result6.wt === 50.5, 'parses decimal weight with comma');

    // Test case insensitivity
    const result7 = strategy.parse('BENCH PRESS 10 x 100 KG');
    assert(result7.ex === 'bench press', 'converts to lowercase');
    assert(result7.unit === 'kg', 'handles uppercase unit');

    // Test whitespace handling
    const result8 = strategy.parse('bench  8,8,7  x  100  kg');
    assertDeepEqual(result8.reps, [8, 8, 7], 'handles extra whitespace');

    // Test invalid input
    const result9 = strategy.parse('invalid input');
    assert(result9 === null, 'returns null for invalid input');
});

// Test DefaultStrategy
describe('DefaultStrategy', () => {
    const strategy = new DefaultStrategy();

    assert(strategy.canHandle('anything'), 'handles any input');
    assert(strategy.canHandle(''), 'handles empty string');
    assert(strategy.canHandle('123'), 'handles numbers');

    assert(strategy.parse('anything') === null, 'always returns null');
    assert(strategy.parse('') === null, 'returns null for empty string');
});

// Test InputParser
describe('InputParser', () => {
    const parser = new InputParser();

    // Valid inputs
    const result1 = parser.parse('bench 8, 8, 7 x 100');
    assert(result1 !== null, 'parses valid exercise input');
    assert(result1.ex === 'bench', 'returns correct exercise');

    const result2 = parser.parse('squat 5,5 x 100 kg');
    assert(result2 !== null, 'parses exercise with unit');

    const result3 = parser.parse('deadlift 10,8,6 x 225 lbs');
    assert(result3 !== null, 'parses exercise with lbs');
    assertDeepEqual(result3.reps, [10, 8, 6], 'parses multiple sets');

    // Invalid inputs
    const result4 = parser.parse('invalid input');
    assert(result4 === null, 'returns null for invalid input');

    const result5 = parser.parse('just some text');
    assert(result5 === null, 'returns null for non-exercise text');

    const result6 = parser.parse('');
    assert(result6 === null, 'returns null for empty string');
});

// Test edge cases
describe('Edge Cases', () => {
    const parser = new InputParser();

    // Single rep
    const result1 = parser.parse('bench 10 x 100');
    assertDeepEqual(result1.reps, [10], 'handles single rep');

    // Many reps
    const result2 = parser.parse('pushup 20,20,20,20,20 x 0');
    assertDeepEqual(result2.reps, [20, 20, 20, 20, 20], 'handles many reps');
    assert(result2.wt === 0, 'handles zero weight');

    // Exercise with multiple words
    const result3 = parser.parse('barbell bench press 8 x 100');
    assert(result3.ex === 'barbell bench press', 'handles multi-word exercise names');

    // Very large numbers
    const result4 = parser.parse('leg press 10 x 1000 kg');
    assert(result4.wt === 1000, 'handles large weights');

    // Very small decimals
    const result5 = parser.parse('test 1 x 0.5');
    assert(result5.wt === 0.5, 'handles small decimal weights');
});

// Test strategy order
describe('Strategy Order', () => {
    const parser = new InputParser();

    // Ensure ExerciseSetsStrategy is tried before DefaultStrategy
    const result1 = parser.parse('bench 8 x 100');
    assert(result1 !== null, 'ExerciseSetsStrategy matches first');
    assert(result1.ex === 'bench', 'returns exercise result, not default null');

    const result2 = parser.parse('not an exercise');
    assert(result2 === null, 'DefaultStrategy returns null for invalid input');
});

// Summary
console.log('\n' + '=' .repeat(60));
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log('=' .repeat(60));

if (testsFailed === 0) {
    console.log('✓ All tests passed!\n');
    process.exit(0);
} else {
    console.log(`✗ ${testsFailed} test(s) failed!\n`);
    process.exit(1);
}
