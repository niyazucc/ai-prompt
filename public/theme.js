// Apply the saved preference before rendering to avoid a flash of the wrong theme.
(() => {
  let theme = 'dark';
  try {
    const saved = localStorage.getItem('promptly-theme');
    if (saved === 'dark' || saved === 'light') theme = saved;
  } catch {
    // Use the default theme when browser storage is unavailable.
  }
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12100f' : '#faf6f1');
})();
