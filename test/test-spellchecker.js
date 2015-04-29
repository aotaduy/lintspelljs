var chai = require('chai');
var expect = chai.expect;

describe('JSSpellChecker', function() {
    var spellCheckerLib = require('../lintspell-lib.js');
    var spellChecker = new spellCheckerLib.JsSpellChecker();
    describe('check identifiers', function() {
        it('should detect spelling errors on identifiers', function() {
            var result = spellChecker.checkString('var variavle = 1 + 1; variavle = variavle + 1');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(3);
            expect(result[0]).to.have.property('message');
            expect(result[0]).to.have.property('line');
        });
        it('should not detect spelling errors on correct identifiers', function() {
            var result = spellChecker.checkString('var variable = 1 + 1; var $a = 1 ; variable = variable + 1');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(0);
        });
        it('should not detect spelling errors on identifiers present on skipwords', function() {
            var result = spellChecker.checkString('var jQuery = 1 + 1; ngVariable = PageTransitionEvent.pageYOffset + 1');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(0);
        });
        it('should detect spelling errors on Strings present on skipwords', function() {
            var result = spellChecker.checkString('var jQuery = \'jQuery\'; ');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(0);
        });
        it('should not detect spelling errors on Comments present on skipwords', function() {
            var result = spellChecker.checkString('var jQuery = 1; //jQuery true ');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(0);
        });
        it('should detect spelling errors on comments', function() {
            var result = spellChecker.checkString('var variable = 1 + 1; // variavle = variavle + 1');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(2);
            expect(result[0]).to.have.property('message');
            expect(result[0]).to.have.property('line');
        });
        it('should detect spelling errors on Strings', function() {
            var result = spellChecker.checkString('var variable = "This si a tset";');
            expect(result).to.be.an('Array');
            expect(result).to.have.length(2);
            expect(result[0]).to.have.property('message');
            expect(result[0]).to.have.property('line');
        });
        it('should detect errors combined', function() {
            var code = [
                'var variavle = 1 + 1; variavle = variavle + 1;',
                '//This si a tset of bad coment',
                'var s = "stren thrater";'].join('\n');
            var result = spellChecker.checkString(code);
            expect(result).to.be.an('Array');
            expect(result).to.have.length(8);
        });
        it('should detect illegal characters esprima parse error', function() {
            var code = '#/env/node index.js';
            var result = spellChecker.checkString(code);
            expect(result).to.be.an('Array');
            expect(result).to.have.length(1);
            expect(result[0].message).to.include('Esprima');
        });
    });
});
