// SOCRACHA App Entry Point
const app = {
  navigate: function(tab) {
    if (tab === 'selfservice' && window.selfserviceModule) {
      window.selfserviceModule.render();
    }
  },
  openVersionModal: function() {
    const modal = document.getElementById('version-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },
  closeVersionModal: function() {
    const modal = document.getElementById('version-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
};
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  if (window.Seeder) window.Seeder.run();
  // Initialize the cracha (selfservice) module
  if (window.selfserviceModule) {
    window.selfserviceModule.render();
  }
});
