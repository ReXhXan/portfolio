const fs = require('fs');

const svg1 = `<svg preserveAspectRatio="none" viewBox="0 0 50 100" xmlns="http://www.w3.org/2000/svg"><path d="M 5,0 C 5,50 45,50 45,100" stroke="#00f0ff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" vector-effect="non-scaling-stroke"/></svg>`;
const svg2 = `<svg preserveAspectRatio="none" viewBox="0 0 50 100" xmlns="http://www.w3.org/2000/svg"><path d="M 45,0 C 45,50 5,50 5,100" stroke="#00f0ff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6" vector-effect="non-scaling-stroke"/></svg>`;

console.log('SVG1: data:image/svg+xml;base64,' + Buffer.from(svg1).toString('base64'));
console.log('SVG2: data:image/svg+xml;base64,' + Buffer.from(svg2).toString('base64'));
