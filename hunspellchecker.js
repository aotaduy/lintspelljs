/* Initialze and export a valid spell checker
We use 'US'' as  default dictionaries
*/

var Spellchecker = require('hunspell-spellchecker');
var Dictionary = require('hunspell-spellchecker/lib/dictionary');
var fs = require('fs');
var _ = require('lodash');

var MultiDictionary = function(dicts) {
    Dictionary.call(this, dicts);
};

MultiDictionary.prototype = Object.create(Dictionary.prototype);

MultiDictionary.prototype.load = function(dicts) {
    var self = this;
    _.forEach(dicts, function (dic) {
        self.rules = _.extend(self.rules, dic.rules);
        self.dictionaryTable = _.extend(self.dictionaryTable, dic.dictionaryTable);
        self.compoundRules = _.union(self.compoundRules, dic.compoundRules);
        self.compoundRuleCodes = _.extend(self.compoundRuleCodes, dic.compoundRuleCodes);
        self.replacementTable = _.union(self.replacementTable, dic.replacementTable);
        self.flags = _.extend(self.flags, dic.flags);
    });
};

module.exports = function (dictsConfig) {
    var spellchecker = new Spellchecker();
    var dicts = [];
    _.forEach(dictsConfig, function(dictConfig) {
        var aff = _.isString(dictConfig) && _.endsWith(dictConfig, 'aff') ? aff : dictConfig.aff;
        var dic = _.isString(dictConfig) && _.endsWith(dictConfig, 'dic') ? dictConfig : dictConfig.dic;
        var dict = {};
        if (!_.isEmpty(aff)) {
            dict.aff = fs.readFileSync(aff);
        }
        if (!_.isEmpty(dic)) {
            dict.dic = fs.readFileSync(dic);
        }
        dicts.push(spellchecker.parse(dict));
    });
    var DICT = new MultiDictionary(dicts);
    spellchecker.use(DICT);
    return spellchecker;
}
