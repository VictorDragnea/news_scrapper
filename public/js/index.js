'use strict';

// import data from './data.js'
import * as data from './data.js';

const TRANSGAZ = [
    'gaze naturale',
    'gazoduct',
    'transgaz',
    'romgaz'
]

const ILFOV = data.ilfovList;

let textareaTransgaz = document.getElementById("keywordListTransgaz");
let textareaIlfov = document.getElementById("keywordListIlfov");
textareaTransgaz.value = TRANSGAZ.reduce(getMultilineString);
textareaIlfov.value = ILFOV.reduce(getMultilineString);

function getMultilineString(total, value, index, array) {
    return total + '\n' + value;
}