var ASSERT = require('assert'),
    PATH = require('path'),
    FS = require('fs'),
    BORSCHIK = require('..');


describe('techs/css-samples', function() {

    var dbg=1;
    var samplerPath = PATH.resolve(PATH.join(__dirname, 'css-samples/', '_canonic.css'));
    var inPath = PATH.resolve(PATH.join(__dirname, 'css-samples/', 'sample.css'));
    var inTestPath = PATH.resolve(PATH.join(__dirname, 'css-samples/', 'test.css'));

    before(function() {
        return BORSCHIK.api({ tech: 'css', input: inPath, output: inTestPath, freeze: false, minimize: false });
    })

    it('all css import features', function(){

    var sampler, a0, inTest, a1;

        sampler = FS.readFileSync(samplerPath, 'utf-8');
        a0 = sampler.split('\n');

        inTest = FS.readFileSync(inTestPath, 'utf-8');
        a1 = inTest.split('\n');

        var len = a0.length > a1.length ? a0.length : a1.length;

        for (var i = 0; i < len; i++) {
            ASSERT.equal(a0[i],a1[i]);
        };

    })

    after(function() {
        FS.unlinkSync(inTestPath);
    })

})
