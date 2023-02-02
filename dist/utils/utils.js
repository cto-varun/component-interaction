"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateHTML = void 0;
/* Generate Uniphore HTML */
/**
 * Generates the HTML string and description text for cache from
 * uniphore summary.
 * @param {Array} summary - An array of {label : string, content : string} summaries from Uniphore
 */
const generateHTML = summary => {
  let htmlStringArr = [];
  let htmlDescArr = [];
  summary.map((content, index) => {
    if (index === 1) return;
    if (content.label) {
      htmlStringArr.push(`<h3>${content.label}</h3>`);
      htmlDescArr.push(`${content.label}\\n`);
    }
    if (content.body && content.body.length > 0) {
      content.body.map((text, index) => {
        if (index === 0) {
          htmlStringArr.push('<ul>');
        }
        htmlStringArr.push(`<li>${text}</li>`);
        htmlDescArr.push(`${text}\\n`);
        if (index === content.body.length - 1) {
          htmlStringArr.push('</ul>');
        }
      });
    }
    htmlStringArr.push('<p><br></p>');
    htmlDescArr.push(`\\n`);
  });
  return {
    htmlContent: htmlStringArr.join(''),
    htmlDescription: htmlDescArr.join('')
  };
};
exports.generateHTML = generateHTML;