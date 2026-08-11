const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(\<!DOCTYPE html><input id="test" />\);
const input = dom.window.document.getElementById('test');
input.value = "MaLENA";
const tracker = input._valueTracker; // jsdom doesn't have React's valueTracker
console.log("Original:", input.value);
// Simulate what the function does
let val = input.value;
let isFirstLetterFound = false;
let formatted = val.split(/(\s+)/).map((word) => {
    if (!word.trim()) return word;
    let firstChar = word.charAt(0);
    const rest = word.slice(1).toLowerCase();
    if (!isFirstLetterFound) {
      firstChar = firstChar.toUpperCase();
      isFirstLetterFound = true;
    }
    return firstChar + rest;
}).join('');

input.value = formatted;
console.log("Formatted:", input.value);
