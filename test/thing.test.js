var IOTRegistryLib = require('../index')
var iotlib = new IOTRegistryLib({ host: process.env.HOST || 'localhost', port: 8082 });

describe('thing', function() {
    it('should register a thing', function(done) {
        this.timeout(30000)
        var user = iotlib.createKeys();
        var alias1 = "Foo" + Math.random()*16777215
        var alias2 = "Bar" + Math.random()*16777215

        var aliases = [alias1,alias2]
        var nonce = Math.floor(Math.random()*16777215).toString(16);
        console.log("nonce:" + nonce)
        iotlib.registrant({
            user: user,
            registrantName: 'Martha',
            data: 'data',
        }).then(function() {
            return iotlib.thing({
                user: user,
                nonce: nonce,
                data: 'data',
                aliases: aliases,
                spec: 'spec',
            })
        }).then(function() {
            console.log('done');
            done();
        }).catch(function(err) {
            done(err);
        });
    })
})
