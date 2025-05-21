const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Run tests in alphabetical order (one by one)
    return tests.sort((a, b) => a.path.localeCompare(b.path));
  }
}

module.exports = CustomSequencer;
