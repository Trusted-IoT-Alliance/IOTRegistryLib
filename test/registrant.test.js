var IOTRegistryLib = require('../index')
var iotlib = new IOTRegistryLib({ host: process.env.HOST || 'localhost', port: 8082 });

describe('registrant', function() {
    it('should create a registrant', function(done) {
        this.timeout(30000)
        var user = iotlib.createKeys();

        iotlib.registrant({
            user: user,
            registrantName: 'Martha',
            data: 'data',
        }).then(function() {
            console.log('done');
            done();
        }).catch(function(err) {
            done(err);
        });
    })
})
