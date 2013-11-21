var assert = require('assert');
var test = require('../basePersistenceTest');

describe('jive', function () {

    describe('#persistence.file', function () {

        it('save', function (done) {
            var jive = this['jive'];
            var testUtils = this['testUtils'];

            testUtils.createTempDir().then( function(dir) {
                var persistence = new jive.persistence.file({ 'dataDirPath': dir });

                test.testSave(testUtils, persistence).then(
                    function() {
                        done();
                    },

                    function(e) {
                        assert.fail(e);
                    }
                ).finally( function() {
                    return persistence.close();
                });
            });
        });

        it('remove', function (done) {
            var jive = this['jive'];
            var testUtils = this['testUtils'];

            testUtils.createTempDir().then( function(dir) {
                var persistence = new jive.persistence.file({ 'dataDirPath': dir });

                test.testRemove(testUtils, persistence).then(
                    function() {
                        done();
                    },

                    function(e) {
                        assert.fail(e);
                    }
                ).finally( function() {
                    return persistence.close();
                });
            });
        });


    });

});

