var request = require('request');
var createSig  = require('./signature');

function iotregistrylib(opts) {
    if(!opts.tls) protocol = 'http://'
    else protocol = 'https://'

    this.host = opts.host;
    this.port = opts.port;
    this.url = protocol + this.host + ':' + this.port;
    this.bitcore = opts.bitcore || require('bitcore-lib');
    createSig.init(this.bitcore);
}

iotregistrylib.prototype.createUser = function() {
    return this.createKeys()
}

iotregistrylib.prototype.createPopcode = function() {
    return this.createKeys()
}


iotregistrylib.prototype.validateUser = function(user) {
    if(!user.publicKey)
        return new Error('missing public key');
    if(!user.privateKey)
        return new Error('missing private key');
}


iotregistrylib.prototype.validatePopcode = function(user) {
    if(!user.publicKey)
        return new Error('missing public key');
    if(!user.privateKey)
        return new Error('missing private key');
}

iotregistrylib.prototype.createKeys = function() {
    var key = this.bitcore.PrivateKey();
    var key_hash = this.bitcore.crypto.Hash.sha256(key.publicKey.toBuffer());
    var addr = this.bitcore.encoding.Base58.encode(key_hash.slice(0,20));
    return { publicKey: key.publicKey.toString(), privateKey: key.toString(), address: key_hash.slice(0,20).toString('hex') };
}

iotregistrylib.prototype.registrant = function({ user, registrantName, data }) {
    var self = this;
    console.log('registrant');
    return new Promise(function(resolve, reject) {
        var err = self.validateUser(user);
        if(err) return reject(err);
        resolve();
    }).then(function() {
            const requestURL = `${self.url}/v1/createRegistrantSig?RegistrantName=${registrantName}&Data=${encodeURIComponent(data)}&RegistrantPubkey=${user.publicKey}&PrivateKeyStr=${user.privateKey}`;
            return self.request(requestURL, { method: 'POST' });
        }).then(function(signature) {
            console.log('request create registrant');
            const requestURL = `${self.url}/v1/registrant?RegistrantName=${registrantName}&Data=${encodeURIComponent(data)}&RegistrantPubkey=${user.publicKey}&Signature=${signature.sig}`;
            return self.request(requestURL, { method: 'POST' })
        });
}


iotregistrylib.prototype.thing = function({ nonce, aliases, user, data, spec }) {
    var self = this;
    console.log('thing');
    return new Promise(function(resolve, reject) {
        var err = self.validateUser(user);
        if(err) return reject(err);
        resolve();
    }).then(function() {
            const requestURL = `${self.url}/v1/generateRegisterThingSig?Aliases=${aliases}&Data=${encodeURIComponent(data)}&RegistrantPubkey=${user.publicKey}&Spec=${spec}&PrivateKeyStr=${user.privateKey}`;
            return self.request(requestURL, { method: 'POST' });
        }).then(function(signature) {
            console.log('request create thing');
            const requestURL = `${self.url}/v1/registerThing?Aliases=${aliases}&Nonce=${nonce}&Data=${encodeURIComponent(data)}&RegistrantPubkey=${user.publicKey}&Spec=${spec}&Signature=${signature.sig}`;
            return self.request(requestURL, { method: 'POST' })
        });
}

iotregistrylib.prototype.spec = function({ specName, user, data }) {
    var self = this;
    console.log('spec');
    return new Promise(function(resolve, reject) {
        var err = self.validateUser(user);
        if(err) return reject(err);
        resolve();
    }).then(function() {
            const requestURL = `${self.url}/v1/generateRegisterSpecSig?SpecName=${specName}&Data=${encodeURIComponent(data)}&RegistrantPubkey=${user.publicKey}&PrivateKeyStr=${user.privateKey}`;
            return self.request(requestURL, { method: 'POST' });
        }).then(function(signature) {
            console.log('request create spec');
            const requestURL = `${self.url}/v1/registerSpec?SpecName=${specName}&Data=${encodeURIComponent(data)}&RegistrantPubkey=${user.publicKey}&Signature=${signature.sig}`;
            return self.request(requestURL, { method: 'POST' })
        });
}

iotregistrylib.prototype.request = function(requestURL, opts) {
    if(!opts) opts = {};
    if(!opts.method) opts.method = 'GET'
    if(opts.body) {
        opts.headers = {
            'Content-Type': 'application/json'
        }
    }
    console.log('request()');

    return new Promise(function(resolve, reject) {
        console.log('request promise', requestURL);
        console.log("\n\nOPTS: " + JSON.stringify(opts, null, 4)+ "\n\n\n")
        request(requestURL, opts, function(err, response, body) {
            console.log('request promise result');
            console.log(err, body);
            if(err) return reject(err);
            if(body) {
                try {
                    console.log('parse body');
                    body = JSON.parse(body);
                } catch(e) {
                    console.log('reject');
                    reject(new Error('recieved nonJSON body: ' + body));
                }

                if(body.error) {
                    console.log('body error');
                    reject(new Error(body.error));
                } else {
                    console.log('resolve request');
                    resolve(body);
                }
            } else {
                reject(new Error('missing body'));
            }

        })
    });
}

module.exports = iotregistrylib
