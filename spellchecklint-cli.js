var fs = require('fs');
var colors = require('colors');
var spellCheckerLib = require('./spellcheck-lib.js');
var spellChecker = new spellCheckerLib.JsSpellChecker();
var errors = [];
if (process.argv.length > 2) {
    var filePath = process.argv[2];
    fs.readFile(filePath, function(err, data) {
        if (err) {
            throw err;
        }
        console.log('Checking Spelling on: ',  filePath.yellow.bold);
        errors = spellChecker.checkString(data);
        errors.sort(function(a, b) {
            return a.line - b.line;
        });
        errors.forEach(function(each) {
            console.log(each.message, 'On Line:', each.line);
        });
    });
} else {
    console.log('spellcheckvars Checks spelling on js files');
    console.log('Usage spellcheckvars %s',  '<file>'.green);
}
