var esprima = require('esprima');
var esquery = require('esquery');
var colors = require('colors');
var spell = require('./hunspellchecker.js');
var _ = require('lodash');
var skipWords = require('./skipwords.js');

/**
 * JsSpellChecker - Checks spelling on js files
 *
 * @return {Object}
 */
function JsSpellChecker (config) {
    this.config = _.defaults({}, config, {
        'checkers': ['identifier', 'string', 'comment'],
        'dicts': [{
            aff: __dirname + '/dicts/en_US.aff',
            dic: __dirname + '/dicts/en_US.dic'
        }]
    });

    var spellChecker = spell(this.config.dicts);

    this.checks = [];
    if (_.contains(this.config.checkers, 'identifier')) {
        this.checks.push(new SpellCheckingIdentifier(spellChecker, this.config));
    }
    if (_.contains(this.config.checkers, 'string')) {
        this.checks.push(new SpellCheckingStrings(spellChecker, this.config));
    }
    if (_.contains(this.config.checkers, 'comment')) {
        this.checks.push(new SpellCheckingComments(spellChecker, this.config));
    }
}
JsSpellChecker.prototype = Object.create({});

/**
 * JsSpellChecker.prototype.checkString - checks String to detect
 * spellchecking on source code
 *
 * @param  {type} aString javascript source code
 * @return {Boolean} returns true whether if there are no spelling erros
 */
JsSpellChecker.prototype.checkString = function (aString) {
    var tree;
    var answer = [];
    try {
        tree = esprima.parse(aString, {loc: true, comment: true});
    } catch (e) {
        answer.push({
            message: 'Can\'t check spelling - Esprima parser error: '.red.bold + e.description,
            line: e.lineNumber
        });
        return answer;
    }

    this.checks.forEach(function(spellchecking) {
        var checksTree = spellchecking.checkOnTree(tree);
        answer = _.union(answer, checksTree);
    });
    return answer;
};
module.exports.JsSpellChecker = JsSpellChecker;

function SpellChecking (spellChecker, config) {
    this.spell = spellChecker;
    this.checkingPath = 'Identifier';
    this.config = _.defaults({}, config, {
        'minLength': 0,
        'color': true,
        'hideSuccessful': true,
        'skipWords': []
    });
    this.config.skipWords = _.union(this.config.skipWords, skipWords);
    return this;
}

/**
 * SpellChecking.prototype.checkOnTree - checks the AST for spelling errors
 *
 * @param  {Object} aTree AST from esprima
 * @return {Boolean}       returns true whether if there are no spelling erros
 */
SpellChecking.prototype.checkOnTree = function (aTree) {
    var self = this;
    var checks = [];
    self.getNodesFromTree(aTree)
        .filter(function (each) {
            return self.filterNode(each);
        })
        .forEach(function (aNode) {
            var words = self.getNodeWords(aNode).split(' ');
            _(words)
                .compact()
                .forEach(function (aWord) {
                    // Do not check words that do not match the minimum length
                    if ((aWord.length >= self.config.minLength) && !self.spell.check(aWord)) {
                        checks.push(self.errorFor(aNode, 0, aWord));
                        //self.showErrorFor(aNode, 0, aWord);
                    } else if (!self.config.hideSuccessful) {
                        checks.push(self.successFor(aNode, 0, aWord));
                    }
                })
                .value();
        });
    return checks;
};

/**
 * SpellChecking.prototype.getNodeWords - Returns a list of words from the node
 * @param  {type} aNode AST Node
 * @return {[String]}   List of words to be check
 */
SpellChecking.prototype.getNodeWords = function (aNode) {
    return this.normalizeWords(aNode.name);
};

/**
 * SpellChecking.prototype.normalizeWords - Returns a list of words from a camelCased, snakedCased or kebabCased expression
 * @param  {string} aWord Word to normalize
 * @return {[String]}   List of words to be check
 */
SpellChecking.prototype.normalizeWords = function (aWord) {
    return aWord.replace(/([A-Z])/g, ' $1').replace(/[^a-zA-Z ]/g, ' ').trim().toLowerCase();
};

/**
 * SpellChecking.prototype.getNodesFromTree - Returns a list of nodes for this Rule
 * Uses esquery for the path
 * @param  {Object} aTree AST Tree
 * @return {[Object]} List of nodes for this rule
 */
SpellChecking.prototype.getNodesFromTree = function (aTree) {
    return esquery(aTree, this.checkingPath);
};

/**
 * SpellChecking.prototype.filterNode - Returns true if the node has to be checked on this rule
 *
 * @param  {type} aNode AST node
 * @param  {type} index
 * @return {Boolean} true if the node has to be check on this rule
 */
SpellChecking.prototype.filterNode = function (aNode, index) {
    return _.intersection(this.config.skipWords,
            this.getNodeWords(aNode).split(' ')
        ).length === 0;
};

SpellChecking.prototype.resultFor = function (aNode, aResult, aWord) {
    return {
        type: this.type,
        word: aWord,
        line: aNode.loc.start.line,
        misspelled: false
    };
};

SpellChecking.prototype.errorFor = function (aNode, aResult, aWord) {
    var type = _.capitalize(this.type);
    var formattedType = this.config.color ? type.cyan : type;
    var formattedName = this.config.color ? aNode.name.bold : aNode.name;

    var message = 'You have a misspelled ' + formattedType + ' ' + formattedName;
    if (aNode.name !== aWord) {
        var formattedWord = this.config.color ? aWord.bold : aWord;
        message += ' misspelled: ' + formattedWord;
    }
    return _.extend(this.resultFor(aNode, aResult, aWord), {
        message: message,
        misspelled: true
    });

};
SpellChecking.prototype.successFor = function (aNode, aResult, aWord) {
    return _.extend(this.resultFor(aNode, aResult, aWord), {message: 'No misspelled word'});
};
/**
 * SpellCheckingIdentifier - Check Spelling on Identifiers
 *
 * @return {Object}
 */
function SpellCheckingIdentifier (spellChecker, config) {
    SpellChecking.call(this, spellChecker, config);
    this.checkingPath = 'Identifier';
    this.type = 'identifier';
}
SpellCheckingIdentifier.prototype = Object.create(SpellChecking.prototype);
SpellCheckingIdentifier.prototype.constructor = SpellCheckingIdentifier;
/**
 * SpellCheckingIdentifier.prototype.filterNode - Returns true if the node has to be checked on this rule
 * If word is on the skip list dont check it, if not split up and check each part
 * @param  {type} aNode AST node
 * @param  {type} index
 * @return {Boolean} true if the node has to be check on this rule
 */
SpellCheckingIdentifier.prototype.filterNode = function (aNode, index) {
    if (_.includes(this.config.skipWords, aNode.value)) {
        return false;
    } else {
        return _.intersection(this.config.skipWords,
                this.getNodeWords(aNode).split(' ')
            ).length === 0;
    }
};

/**
 * SpellCheckingStrings - Check Spelling on strings
 *
 * @return {Object}
 */
function SpellCheckingStrings (spellChecker, config) {
    SpellChecking.call(this, spellChecker, config);
    this.checkingPath = 'Literal';
    this.type = 'string';
}
SpellCheckingStrings.prototype = Object.create(SpellChecking.prototype);
SpellCheckingStrings.prototype.constructor = SpellCheckingStrings;

/**
 * SpellChecking.prototype.getNodeWords - Returns a list of words from the node
 * @param  {type} aNode AST Node
 * @return {[String]}   List of words to be check
 */
SpellCheckingStrings.prototype.getNodeWords = function(aNode) {
    return this.normalizeWords(aNode.value);
};

SpellCheckingStrings.prototype.errorFor = function(aNode, aResult, aWord) {
    return {
        message: 'You have a misspelled word on a ' + 'String '.green +  aWord.bold,
        line: aNode.loc.start.line
    };
};

/**
 * SpellChecking.prototype.filterNode - Returns true if the node has to be checked on this rule
 *
 * @param  {type} aNode AST node
 * @param  {type} index
 * @return {Boolean} true if the node has to be check on this rule
 */
SpellCheckingStrings.prototype.filterNode = function (aNode) {
    return (typeof aNode.value) === 'string' && SpellChecking.prototype.filterNode.call(this, aNode);
};

/**
 * SpellCheckingComments - Check Spelling on js comments
 *
 * @return {Object}
 */
function SpellCheckingComments (spellChecker, config) {
    SpellChecking.call(this, spellChecker, config);
    this.checkingPath = 'Line';
    this.type = 'comment';
}
SpellCheckingComments.prototype = Object.create(SpellCheckingStrings.prototype);
SpellCheckingComments.prototype.constructor = SpellCheckingComments;
/**
 * SpellChecking.prototype.getNodesFromTree - Returns a list of nodes for this Rule
 * Uses esquery for the path
 * @param  {Object} aTree AST Tree
 * @return {[Object]} List of nodes for this rule
 */
SpellCheckingComments.prototype.getNodesFromTree = function (aTree) {
    return aTree.comments;
};

SpellCheckingComments.prototype.errorFor = function (aNode, aResult, aWord) {
    var message;
    if (this.config.color) {
        message = 'You have a misspelled word on a ' + 'Comment '.yellow + aWord.bold;
    } else {
        message = 'You have a misspelled word on a Comment ' + aWord;
    }
    return _.extend(this.resultFor(aNode, aResult, aWord), {
        message: message,
        misspelled: true
    });
};
/**
 * SpellChecking.prototype.filterNode - Returns true if the node has to be checked on this rule
 *
 * @param  {type} aNode AST node
 * @param  {type} index
 * @return {Boolean} true if the node has to be check on this rule
 */
SpellCheckingComments.prototype.filterNode = function (aNode) {
    return SpellChecking.prototype.filterNode.call(this, aNode);

};
