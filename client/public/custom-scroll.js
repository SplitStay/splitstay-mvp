// Add touch-action to document
document.addEventListener('DOMContentLoaded', function() {
  // Remove touch action limitation
  document.body.style.touchAction = 'auto';
  
  // Make content scrollable
  setTimeout(function() {
    const mobileContent = document.querySelector('.mobile-content');
    if (mobileContent) {
      mobileContent.style.overflowY = 'scroll';
      mobileContent.style.height = '844px';
    }
  }, 100);
});