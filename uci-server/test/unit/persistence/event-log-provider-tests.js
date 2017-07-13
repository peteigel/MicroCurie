const assert = require('assert');

module.exports =  function testIEventLogProvider(suiteName, createProvider) {
    describe(suiteName, () => {
        let db = null;

        beforeEach(() => {
            db = createProvider();
            return db.provisionEventLog('test_log');
        });

        afterEach(() => {
            db = null;
        });

        it('Write and Read event', async () => {
            const id = await db.writeEvent('test_log', {
                type: 'test-event',
                data: {
                    str: 'This is only a test event'
                }
            });

            assert.equal(typeof id, 'number');

            const eventData = await db.readEvent('test_log', id);

            assert.equal(eventData.data.str, 'This is only a test event');
        });

        it('Event ordering', async () => {
            let ids = [];
            for (let i = 0; i < 100; i++) {
                const id = await db.writeEvent('test_log', {
                    type: 'test-event',
                    data: {
                        index: i
                    }
                });

                ids.forEach(prevId => assert(id > prevId));

                ids.push(id);
            }

            ids = [];
            await db.applyEvents('test_log', eventData => {
                const id = eventData.id;
                ids.forEach(prevId => assert(id> prevId));
                ids.push(id);
            });
        });

        it('eventLogIsProvisioned() and drop()', async () => {
            const shouldBeTrue = await db.eventLogIsProvisioned('test_log');
            assert.equal(shouldBeTrue, true);
            
            const shouldBeFalse = await db.eventLogIsProvisioned('not_test_log');
            assert.equal(shouldBeFalse, false);

            await db.dropEventLog('test_log');
            const shouldAlsoBeFalse = await db.eventLogIsProvisioned('test_log');
            assert.equal(shouldAlsoBeFalse, false);
        });        
    });
}