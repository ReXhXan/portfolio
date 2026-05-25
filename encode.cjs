const fs = require('fs');

const svg1 = `<svg preserveAspectRatio="none" viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg"><path d="M 20,0 Q -10,50 20,100" stroke="#00f0ff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6" vector-effect="non-scaling-stroke"/></svg>`;
const svg2 = `<svg preserveAspectRatio="none" viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg"><path d="M 20,0 Q 50,50 20,100" stroke="#00f0ff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6" vector-effect="non-scaling-stroke"/></svg>`;

console.log('SVG1: ' + Buffer.from(svg1).toString('base64'));
console.log('SVG2: ' + Buffer.from(svg2).toString('base64'));
