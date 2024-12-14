function switchLanguage(language) {
    const contentElement = document.getElementById('content');
    
    // Add a transition class for animation
    contentElement.classList.add('transition-out');

    // Wait for the transition to finish before changing the content
    setTimeout(() => {
        if (language === 'en') {
            contentElement.innerHTML = `
                <h1>Welcome</h1>
                <p>This is the English version of the page.</p>
            `;
        } else if (language === 'es') {
            contentElement.innerHTML = `
                <h1>Bienvenido</h1>
                <p>Esta es la versión en español de la página.</p>
            `;
        }

        // Add a fade-in effect after changing content
        contentElement.classList.remove('transition-out');
        contentElement.classList.add('transition-in');

        // Remove transition-in class after animation completes
        setTimeout(() => {
            contentElement.classList.remove('transition-in');
        }, 500); // Duration matches the CSS animation time
    }, 500); // Duration matches the CSS animation time
}

