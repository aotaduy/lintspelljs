var globals = require('globals');
var _ = require('lodash');

var skipWords = [
    '$http',
    '$httpBackend',
    'argc',
    'argv',
    'bool',
    'const',
    'ctrl',
    'dcl',
    'disney',
    'esprima',
    'esquery',
    'fs',
    'html',
    'http',
    'js',
    'jshint',
    'json',
    'lodash',
    'lint',
    'ng',
    'ngcookies',
    'nginject',
    'param',
    'ui',
    'url',
    'Vm',
    'vm',
    'wdpr',
    '_'
]
    .map(function(each) {
        return each.toLowerCase();
    });

module.exports = _.union(
    skipWords,
    _.keys(globals.builtin),
    _.keys(globals.browser),
    _.keys(globals.node),
    _.keys(globals.mocha),
    _.keys(globals.jasmine),
    _.keys(globals.jquery),
    _.keys(globals.shelljs)
    );
