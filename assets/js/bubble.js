document.addEventListener('DOMContentLoaded', () => {
    // Create a single bubble element to be reused
    const bubble = document.createElement('div');
    bubble.className = 'want-bubble';
    bubble.style.display = 'none';
    document.body.appendChild(bubble);

    // Function to move the bubble smoothly to a position above a tile
    function moveBubble(targetX, targetY) {
        const currentX = parseFloat(bubble.style.left) || 0;
        const currentY = parseFloat(bubble.style.top) || 0;

        // Calculate the difference in position
        const deltaX = targetX - currentX;
        const deltaY = targetY - currentY;

        // If the bubble is close enough to the target, snap to the target position
        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
            bubble.style.left = `${targetX}px`;
            bubble.style.top = `${targetY}px`;
            return;
        }

        // Move the bubble by a small amount (step size)
        const step = 5; // Adjust this value for speed
        bubble.style.left = `${currentX + (deltaX / Math.hypot(deltaX, deltaY)) * step}px`;
        bubble.style.top = `${currentY + (deltaY / Math.hypot(deltaX, deltaY)) * step}px`;

        // Request the next animation frame
        requestAnimationFrame(() => moveBubble(targetX, targetY));
    }

    // Function to position the bubble above a tile and show it
    function showBubble(tile) {
        const rect = tile.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + scrollTop - 60; // 60px above the tile

        bubble.style.left = `${targetX}px`;
        bubble.style.top = `${targetY}px`;
        bubble.style.display = 'block'; // Ensure it is displayed
        moveBubble(targetX, targetY); // Start moving the bubble
    }

    // Event delegation for tile clicks
    document.addEventListener('click', (event) => {
        const tile = event.target.closest('.tiles article');
        if (tile && !event.target.closest('h2') && !event.target.closest('.want-bubble')) {
            const gameLink = tile.getAttribute('data-link');
            if (gameLink) {
                bubble.innerHTML = `<a href="${gameLink}" target="_blank">I want this</a>`;
                showBubble(tile); // Position and show the bubble
            }
        } else if (!event.target.closest('.want-bubble')) {
            bubble.style.display = 'none'; // Hide bubble if clicking elsewhere
        }
    });

    // Reposition bubble on window resize
    window.addEventListener('resize', () => {
        if (bubble.style.display === 'block') {
            const visibleTile = document.querySelector('.tiles article.playing');
            if (visibleTile) {
                showBubble(visibleTile);
            }
        }
    });

    // Prevent bubble from triggering tile hover
    bubble.addEventListener('mouseenter', (event) => {
        event.stopPropagation();
    });
});
