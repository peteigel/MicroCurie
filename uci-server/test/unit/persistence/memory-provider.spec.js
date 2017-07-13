const { MemoryProvider } = require('../../../dist/persistence/memory-provider');
const testIEventLogProvider = require('./event-log-provider-tests');

testIEventLogProvider('MemoryProvider', () => new MemoryProvider());