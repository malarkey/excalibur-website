class ThemeSwitcher {
constructor() {
this.toggleBtn = document.querySelector('.theme-toggle');
this.body = document.body;
this.currentTheme = this.body.getAttribute('data-theme') || 'light';

this.init();
}

init() {
// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
this.setTheme(savedTheme);
}

// Add click event listener
this.toggleBtn.addEventListener('click', () => this.toggleTheme());
}

toggleTheme() {
this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
this.setTheme(this.currentTheme);
}

setTheme(theme) {
this.body.setAttribute('data-theme', theme);
this.currentTheme = theme;
localStorage.setItem('theme', theme);
}
}

// Initialize theme switcher
document.addEventListener('DOMContentLoaded', () => {
new ThemeSwitcher();
});