var IOTRegistryLib = require('../index')
var iotlib = new IOTRegistryLib({ host: process.env.HOST || 'localhost', port: 8082 });

describe('spec', function() {
    it('should register a spec', function(done) {
        this.timeout(30000)
        var user = iotlib.createKeys();
        var specName = "Spec" + Math.random()*16777215

        iotlib.spec({
            user: user,
            specName: specName,
            data: 'data',
        }).then(function() {
            console.log('done');
            done();
        }).catch(function(err) {
            done(err);
        });
    })
})
