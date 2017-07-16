const { SQLiteProvider } = require('../../../dist/persistence/sqlite-provider');
const testIEventLogProvider = require('./event-log-provider-tests');

testIEventLogProvider('SQLiteProvider', () => new SQLiteProvider(':memory:'));