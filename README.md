# lintspelljs
Module to spell check your js files.
lintspelljs checks inside your comments, strings, and on each part of the identifiers splitting up the subwords on a camelCased or snake_cased string.


## Installation
The package is not published yet to npm but there is a plan to do so.
To insall you should clone this repo and then npm install it directly from the folder.
````
npm install lintspelljs
````

## Usage
lintspelljs works from the comm and line using a simple CLI interface
````
lintspelljs <filename>
````
### Output
````
Checking Spelling on: spellchecklint-cli.js
You have a mispelled Identifier JsSpellChecker mispelled: Js On Line: 4
You have a misspelled word on a String spellcheckvars On Line: 23
You have a misspelled word on a Comment spellcheckvars On Line: 24
````
## Usage as a module
lintspelljs could be used as a module to check js files. Check lintint (https://www.npmjs.com/package/lintint) for an example of usage.
````javascript
var spellCheckerLib = require('lintspelljs');
var options = {
    color: false
};
var spellChecker = new spellCheckerLib.JsSpellChecker(options);
var results = spellChecker.checkString('var variavle_fisrt = 1 + funktionKall(); // Tetsing');
````
Results will contain an Array of Objects with the following format:
````javascript
{
    type: <<String>>, // The type of the parsed string (one of 'identifier', 'string', 'comment')
    message: <<String>>, // There are three possible messages
    line: <<Integer>>, // The line number for the parsed string
    word: <<String>>, // The word which is checked
    misspelled: <<Boolean>> // The result of the spell check (true if the word is misspelled) 
}
````
## Default options
````javascript
{
    dicts: [{ // Path of dictionaries to use. Can be a string or an object like { aff: <<String>>, dic: <<String>> }
        aff: 'dicts/en_US.aff',
        dic: 'dicts/en_US.dic'
    }],
    checkers: ['identifier', 'string', 'comment'], // locations where to check words
    color: true, // If true, return colored and bold messages
    hideSuccessful: true, // If true, return only the misspelled results
    skipWords: [], // Additional words to ignore and do not mark as misspelled
    minLength: 0 // Words with a length less than minLength won't be checked
}
````
## Test
lintspelljs uses [mocha](http://www.mochajs.org) for testing and [chai](http://www.chaijs.com) for assertions.
You should have mocha installed globally to run tests.
````
npm install -g mocha
````
And to run the test you can use:
````
npm test
````

## Dictionaries
To spell check each string lintspelljs is using the [hunspell-spellchecker](https://www.npmjs.com/package/hunspell-spellchecker).
And for dictionaries the openoffice en_US files.
