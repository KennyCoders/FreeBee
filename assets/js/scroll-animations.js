// Utility function to check if an element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Function to handle scroll animations
function handleScrollAnimations() {
    const tiles = document.querySelectorAll('.tiles article');
    
    tiles.forEach(tile => {
        if (isInViewport(tile) && !tile.classList.contains('animated')) {
            tile.classList.add('animated');
        }
    });
}

// Check if we're on a desktop screen
function isDesktop() {
    return window.innerWidth > 768; // Adjust this breakpoint as needed
}

// Only add the scroll event listener on desktop
if (isDesktop()) {
    window.addEventListener('scroll', handleScrollAnimations);
    // Trigger once on load to check for tiles already in view
    window.addEventListener('load', handleScrollAnimations);
}