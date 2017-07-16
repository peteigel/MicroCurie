const { AgentsProjection } = require('../../../../dist/state/projection/agents');
const { EventStream } = require('uci-core-node/dist/event-stream');
const { EventLog } = require('uci-core-node/dist/persistence/event-log');
const { MemoryProvider } = require('uci-core-node/dist/persistence/memory-provider');
const assert = require('assert');

describe('AgentsProjection', function () {

    describe('when a createAgent event is emitted', function () {
        let agents = null;
        let eventStream = null;

        beforeEach(async function () {
            const eventLog = new EventLog('test_log', new MemoryProvider());
            await eventLog.open();
            eventStream = new EventStream(eventLog);

            agents = new AgentsProjection(eventStream);
            eventStream.write({
                id: 1,
                type: 'agent/create-agent',
                data: {
                    name: 'test-agent',
                    secret: 'abc',
                    agentId: 'puppy'
                }
            });

            await new Promise(resolve => setTimeout(resolve, 10));
        });

        afterEach(function () {
            agents = null;
            eventStream = null;
        });

        it ('should be retrievable by id', function () {
            assert.equal(agents.getById('puppy').name, 'test-agent');
        });

        it ('should be retrievable by name', function () {
            assert.equal(agents.getByName('test-agent').agentId, 'puppy');
        });

        it ('should appear in list', function () {
            assert.equal(agents.getAgents()[0].agentId, 'puppy');
        });
    });
});