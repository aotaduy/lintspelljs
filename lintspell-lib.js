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
function JsSpellChecker() {
    this.checks = [
        new SpellChecking(),
        new SpellCheckingStrings(),
        new SpellCheckingComments()
    ];
}
JsSpellChecker.prototype = Object.create({});

/**
 * JsSpellChecker.prototype.checkString - checks String to detect
 * spellchecking on source code
 *
 * @param  {type} aString javascript source code
 * @return {Boolean} returns true whether if there are no spelling erros
 */
JsSpellChecker.prototype.checkString = function(aString) {
    var tree ;
    var answer = [];
    try {
        tree = esprima.parse(aString, {loc: true, comment:true});
    } catch (e) {
        answer.push({
            message: 'Can\'t check spelling - Esprima parser error: '.red.bold + e.description,
            line: e.lineNumber});
        return answer;
    };

    this.checks.forEach(function(spellchecking) {
        var checksTree = spellchecking.checkOnTree(tree);
        checksTree.forEach(function(each) {

            answer.push(each);
        });
    });
    return answer;
};
module.exports.JsSpellChecker =  JsSpellChecker;

function SpellChecking() {
    this.checkingPath = 'Identifier';
    return this;
}

/**
 * SpellChecking.prototype.checkOnTree - checks the AST for spelling errors
 *
 * @param  {Object} aTree AST from esprima
 * @return {Boolean}       returns true whether if there are no spelling erros
 */
SpellChecking.prototype.checkOnTree = function(aTree) {
    var self = this;
    var checks = [];
    self.getNodesFromTree(aTree)
        .filter(function(each) {
            return self.filterNode(each);
        })
        .forEach(function(aNode) {
            var words = self.getNodeWords(aNode).split(' ');
            words.forEach(function(aWord) {
                if (!spell.check(aWord)) {
                    checks.push(self.errorFor(aNode, 0, aWord));
                    //self.showErrorFor(aNode, 0, aWord);
                }
            });
        });
    return checks;
};

/**
 * SpellChecking.prototype.getNodeWords - Returns a list of words from the node
 * @param  {type} aNode AST Node
 * @return {[String]}   List of words to be check
 */
SpellChecking.prototype.getNodeWords = function(aNode) {
    return aNode.name.replace(/([A-Z])/g, ' $1').replace(/[^a-zA-Z ]/g, ' ');
};

/**
 * SpellChecking.prototype.getNodesFromTree - Returns a list of nodes for this Rule
 * Uses esquery for the path
 * @param  {Object} aTree AST Tree
 * @return {[Object]} List of nodes for this rule
 */
SpellChecking.prototype.getNodesFromTree = function(aTree) {
    return esquery(aTree, this.checkingPath);
};

/**
 * SpellChecking.prototype.filterNode - Returns true if the node has to be checked on this rule
 *
 * @param  {type} aNode AST node
 * @param  {type} index
 * @return {Boolean} true if the node has to be check on this rule
 */
SpellChecking.prototype.filterNode = function(aNode, index) {
    return _.intersection(skipWords,
        this.getNodeWords(aNode).split(' ')
    ).length === 0;
};

SpellChecking.prototype.errorFor = function(aNode, aResult, aWord) {
    var subwordMessage = aNode.name !== aWord ? ' misspelled: ' + aWord.bold : '';
    return {
        message: 'You have a misspelled ' + 'Identifier '.cyan  + aNode.name.bold + subwordMessage,
        line: aNode.loc.start.line
    };
};
/**
 * SpellCheckingIdentifier - Check Spelling on Identifiers
 *
 * @return {Object}
 */
function SpellCheckingIdentifier() {
    SpellChecking.call(this);
    this.checkingPath = 'Identifier';
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
SpellCheckingIdentifier.prototype.filterNode = function(aNode, index) {
    if (_.includes(skipWords, aNode.value)) {
        return false;
    } else {
        return _.intersection(skipWords,
            this.getNodeWords(aNode).toLowercase().split(' ')
        ).length === 0;
    }
};

/**
 * SpellCheckingStrings - Check Spelling on strings
 *
 * @return {Object}
 */
function SpellCheckingStrings() {
    SpellChecking.call(this);
    this.checkingPath = 'Literal';
}
SpellCheckingStrings.prototype = Object.create(SpellChecking.prototype);
SpellCheckingStrings.prototype.constructor = SpellCheckingStrings;

/**
 * SpellChecking.prototype.getNodeWords - Returns a list of words from the node
 * @param  {type} aNode AST Node
 * @return {[String]}   List of words to be check
 */
SpellCheckingStrings.prototype.getNodeWords = function(aNode) {
    return aNode.value.replace(/[^a-zA-Z ]/g, ' ').replace(/([A-Z])/g, ' $1');
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
SpellCheckingStrings.prototype.filterNode = function(aNode) {
    return (typeof aNode.value) === 'string' && SpellChecking.prototype.filterNode.call(this, aNode);
};

/**
 * SpellCheckingComments - Check Spelling on js comments
 *
 * @return {Object}
 */
function SpellCheckingComments() {
    SpellChecking.call(this);
    this.checkingPath = 'Line';
}
SpellCheckingComments.prototype = Object.create(SpellCheckingStrings.prototype);
SpellCheckingComments.prototype.constructor = SpellCheckingComments;
/**
 * SpellChecking.prototype.getNodesFromTree - Returns a list of nodes for this Rule
 * Uses esquery for the path
 * @param  {Object} aTree AST Tree
 * @return {[Object]} List of nodes for this rule
 */
SpellCheckingComments.prototype.getNodesFromTree = function(aTree) {
    return aTree.comments;
};

SpellCheckingComments.prototype.errorFor = function(aNode, aResult, aWord) {
    return {
        message: 'You have a misspelled word in a ' + 'Comment '.yellow +  aWord.bold,
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
SpellCheckingComments.prototype.filterNode = function(aNode) {
    return SpellChecking.prototype.filterNode.call(this, aNode);
};
