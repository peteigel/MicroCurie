const { generateAgentSecret } = require('../../../dist/util/generate-agent-secret');
const assert = require('assert');

describe('generateAgentSecret', () => {
    it ('should be 512 characters long', async () => {
        const secret = await generateAgentSecret();
        assert.equal(secret.length, 512);
    });
});
