document.querySelectorAll('.print-note').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', () => window.print());
});
