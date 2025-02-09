document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    fetch('games.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);

            const games = data.games;

            if (!Array.isArray(games)) {
                throw new Error('Games data is not an array');
            }

            // Get current date and calculate date range
            const currentDate = new Date();
            const oneWeekAhead = new Date(currentDate);
            oneWeekAhead.setDate(currentDate.getDate() + 7);

            // Format dates as MM/DD
            const formatDate = (date) => {
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            };

            // Display the date range for the upcoming week
            const dateRangeElement = document.getElementById('date-range');
            dateRangeElement.textContent = `For the week of ${formatDate(currentDate)} - ${formatDate(oneWeekAhead)}`;

            // Function to get the most recent scrape date for a platform
            const getMostRecentScrapeDate = (platformGames) => {
                return new Date(Math.max(...platformGames.map(game => new Date(game.date))));
            };

            // Filter and group games by platform with special handling for Sony
            const groupedGames = games.reduce((acc, game) => {
                if (!acc[game.platform]) {
                    acc[game.platform] = [];
                }

                const gameDate = new Date(game.date);
                const isSony = game.platform.toLowerCase() === 'sony';

                if (isSony) {
                    // For Sony, check if game is from current month
                    const isCurrentMonth = gameDate.getMonth() === currentDate.getMonth() &&
                                         gameDate.getFullYear() === currentDate.getFullYear();
                    if (isCurrentMonth) {
                        acc[game.platform].push(game);
                    }
                } else {
                    // For other platforms, check if game is from current scrape date
                    const platformGames = games.filter(g => g.platform === game.platform);
                    const mostRecentScrapeDate = getMostRecentScrapeDate(platformGames);
                    
                    if (gameDate.getTime() === mostRecentScrapeDate.getTime()) {
                        acc[game.platform].push(game);
                    }
                }

                return acc;
            }, {});

            // If no games found for a platform, get the most recent ones
            Object.keys(groupedGames).forEach(platform => {
                if (groupedGames[platform].length === 0) {
                    const platformGames = games.filter(game => game.platform === platform);
                    const mostRecentDate = getMostRecentScrapeDate(platformGames);
                    
                    groupedGames[platform] = platformGames.filter(game => 
                        new Date(game.date).getTime() === mostRecentDate.getTime()
                    );
                }
            });

            console.log('Grouped games:', groupedGames);

            // Iterate through each platform in the grouped data
            Object.keys(groupedGames).forEach(platform => {
                const tilesContainer = document.getElementById(`${platform}-tiles`);
                console.log(`Looking for container: ${platform}-tiles`);

                if (tilesContainer) {
                    // Clear existing content
                    tilesContainer.innerHTML = '';
                    
                    console.log(`Found container for ${platform}`);
                    groupedGames[platform].forEach(game => {
                        const article = document.createElement('article');
                        const scrapeDate = new Date(game.date);
                        article.innerHTML = `
                            <div class="image">
                                <img src="${game.image}" alt="${game.title}" />
                            </div>
                            <h2><a href="${game.link}" class="game-link">${game.title}</a></h2>
                            <div class="release-date">Updated: ${formatDate(scrapeDate)}</div>
                            <div class="video-container"></div>
                        `;
                        article.setAttribute('data-trailer', game.trailer);
                        article.setAttribute('data-link', game.link);
                        tilesContainer.appendChild(article);
                    });
                } else {
                    console.log(`Container not found for ${platform}`);
                }
            });

            // Event listener for game tiles (unchanged)
            document.querySelectorAll('.tiles article').forEach(article => {
                article.addEventListener('click', function(event) {
                    if (event.target.closest('h2') || event.target.closest('.bubble')) {
                        event.preventDefault();
                        window.open(this.getAttribute('data-link'), '_blank');
                        return;
                    }

                    event.preventDefault();

                    const videoContainer = this.querySelector('.video-container');

                    if (videoContainer.querySelector('iframe')) {
                        console.log('Video already playing, doing nothing');
                        return;
                    }

                    const trailerUrl = this.getAttribute('data-trailer');
                    console.log('Trailer URL:', trailerUrl);

                    if (!trailerUrl) {
                        console.error('No trailer URL found');
                        return;
                    }

                    videoContainer.innerHTML = '<div class="loading">Loading video...</div>';

                    const embedUrl = trailerUrl.replace('watch?v=', 'embed/') + '?autoplay=1';
                    console.log('Embed URL:', embedUrl);

                    const iframe = document.createElement('iframe');
                    iframe.src = embedUrl;
                    iframe.width = '100%';
                    iframe.height = '100%';
                    iframe.frameBorder = '0';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.allowFullscreen = true;

                    videoContainer.innerHTML = '';
                    videoContainer.appendChild(iframe);

                    this.classList.add('playing');
                });
            });
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
        });
});