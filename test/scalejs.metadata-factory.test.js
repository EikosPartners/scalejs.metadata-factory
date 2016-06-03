import core from 'scalejs!core';
import 'scalejs!application';
    var metadata = core.metadata;

    // For deeper testing, log to console
    console.log('core.metadata: ', metadata);

    describe('core.metadata', function() {

        it('is defined', function() {
            expect(metadata).toBeDefined();
        });

    });


