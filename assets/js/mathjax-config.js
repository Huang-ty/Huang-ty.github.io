window.MathJax = {
  loader: {load: ['[tex]/boldsymbol']},
  tex: {
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]'], ['$$', '$$']],
    processEscapes: true,
    packages: {'[+]': ['boldsymbol']}
  },
  chtml: {fontURL: '/assets/vendor/mathjax/output/chtml/fonts/woff-v2'},
  options: {enableMenu: false}
};
