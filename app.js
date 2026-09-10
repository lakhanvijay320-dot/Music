document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const homeBtn = document.getElementById('home-btn');
    const settingsBtn = document.getElementById('settings-btn');

    const savedTheme = localStorage.getItem('yplus-theme');
    
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.replace('dark-theme', 'light-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('yplus-theme', 'light');
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('yplus-theme', 'dark');
        }
    });

    homeBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        homeBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            homeBtn.style.transform = 'scale(1)';
        }, 150);
    });

    settingsBtn.addEventListener('click', () => {
        const icon = settingsBtn.querySelector('i');
        icon.style.transform = 'rotate(90deg)';
        icon.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            icon.style.transform = 'rotate(0deg)';
        }, 300);
    });
});
