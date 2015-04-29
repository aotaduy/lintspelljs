# lintspelljs
Module to spell check your js files.
lintspelljs checks inside your comments, strings, and on each part of the identifiers splitting up the subwords on a camelCased or snake_cased string.


##Installation
The package is not published yet to npm but there is a plan to do so. 
To insall you should clone this repo and then npm install it directly from the folder.
````
git clone https://github.com/aotaduy/lintspelljs.git
npm install ./lintspelljs
````

##Usage
lintspelljs works from the comm and line using a simple CLI interface
````
lintspelljs <filename>
````
###Output
````
Checking Spelling on: spellchecklint-cli.js
You have a mispelled Identifier JsSpellChecker mispelled: Js On Line: 4
You have a misspelled word on a String spellcheckvars On Line: 23
You have a misspelled word on a Comment spellcheckvars On Line: 24
````
##Usage as a module
lintspelljs could be used as a module to check js files.
````javascript
var spellCheckerLib = require('lintspelljs');
var spellChecker = new spellCheckerLib.JsSpellChecker();
var errors = spellChecker.checkString('var variavle_fisrt = 1 + funktionKall(); // Tetsing');
````
Errors will contain an Array of Objects with the following format:
````javascript
{
    path: <<String>>, // The esquery path used to get the string one of 'Identifier', 'Literal', 'Line'
    message: <<String>>, // There are three possible messages 
    line: <<Integer>>
}
````

##Test
lintspelljs uses [mocha](http://www.mochajs.org) for testing and [chai](http://www.chaijs.com) for assertions.
You should have mocha installed globally to run tests.
````
npm install -g mocha
````
And to run the test you can use:
````
npm test
````

##Dictionaries
To spell check each string lintspelljs is using the [hunspell-spellchecker](https://www.npmjs.com/package/hunspell-spellchecker).
And for dictionaries the openoffice en_US files.
