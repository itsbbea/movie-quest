var movieTitle = [];
var latestMovieTitle;
var lastGenreId, lastDecade, lastOriginalLanguage;

var youtubePreview = document.getElementById('youtube-preview')

function getVideoURL(sampleTitle) {
    var ytApiKey = "AIzaSyB8PzB4thIJ1yyzTuJhkEhy3FlEEIZVsJg"
    searchInput = sampleTitle.toLowerCase().replace(" ", "+") + "+movie+trailer"
    var searchResult = "https://www.googleapis.com/youtube/v3/search?key=" + ytApiKey + "&part=snippet&type=video&q=" + searchInput;

    fetch(searchResult)
    .then(response => response.json())
    .then(data => {
        var vidID = data.items[0].id.videoId
        var trailerEmbedURL = "https://www.youtube.com/embed/" + vidID + "?enablejsapi=1"
        youtubePreview.setAttribute("src", trailerEmbedURL)
        youtubePreview.setAttribute("style", "border: solid 4px #ffffff")
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:' + error.message);
    })
};

document.getElementById('submit-button').addEventListener('click', function() { // select dropdown //
    var selectedGenre = document.getElementById('dropdown-genre').value;
    var selectedDecade = document.getElementById('dropdown-release').value;
    var originalLanguage = document.getElementById('dropdown-lang').value;

    searchAPI(selectedGenre, selectedDecade, originalLanguage);
});

function searchAPI(genreId, decade, originalLanguage) {  // searching first for genre to take into account any date option //
    lastGenreId = genreId;
    lastDecade = decade;
    lastOriginalLanguage = originalLanguage;
    
    var apiUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=0a5329b198d874cdfd05a37c220a128b&with_genres=' + genreId;

    // then added the date option here //
    if (decade !== "Any") {
    var startDate = decade + '-01-01';
    var endDate = (parseInt(decade) + 9).toString() + '-12-31';
    apiUrl += '&primary_release_date.gte=' + startDate + '&primary_release_date.lte=' + endDate;
    }

    if (originalLanguage && originalLanguage !== "Any") {
        apiUrl += '&with_original_language=' + originalLanguage;
    }

    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        var maxPages = Math.min(data.total_pages, 100);
        var randomPage = Math.floor(Math.random() * maxPages) + 1;
      
        return fetch(apiUrl + '&page=' + randomPage); // Fetch the randomly selected page
    })
    // post search functionality below //
    .then(response => response.json())
    .then(data => {
        if (data.results && data.results.length) {
            // Randomly select a movie from the results of the randomly selected page
            var randomIndex = Math.floor(Math.random() * data.results.length);
            var randomMovie = data.results[randomIndex];
            movieTitle.push(randomMovie.title);
            latestMovieTitle = movieTitle.slice(-1)[0];
            getVideoURL(latestMovieTitle);

            var movieDisplay = document.getElementById('movieDisplay');
            movieDisplay.innerHTML = ` 
                <h2>${randomMovie.title}</h2>
                <p>${randomMovie.overview}</p>
                <img src="https://image.tmdb.org/t/p/w500${randomMovie.poster_path}" alt="${randomMovie.title}">
            `;

            // save data //
            saveToLocalStorage(randomMovie);


            document.getElementById('intro').classList.add('hidden');
            document.getElementById('application').style.display = 'none';
            document.getElementById('current-results').style.display = 'flex';
            document.getElementById('result-buttons').style.display = 'flex';
            document.getElementById('my-buttons').classList.add('hidden');
            document.getElementById('retry-button').style.display = 'flex';
            document.getElementById('return-button').style.display = 'flex';
            document.getElementById('recent-results').style.display = 'none';
            document.getElementById('history-list').style.display = 'none';
        }
    })
    .catch(function(error) {
        document.getElementById('messageDisplay').innerText = 'There was a problem with the fetch operation: ' + error.message;
    });
}

// historical results //
document.getElementById('recent-results').style.display = 'none';
document.getElementById('history-list').style.display = 'none';

function displaySavedMovies() {
    document.getElementById('recent-results').style.display = 'block';
    document.getElementById('history-list').style.display = 'block';
    document.getElementById('history-list').style.textAlign = 'center';
    try {
        var savedMovies = JSON.parse(localStorage.getItem('movieData'));

        if (savedMovies && savedMovies.length > 0) {
            var movieDisplay = document.getElementById('history-list');
            movieDisplay.innerHTML = savedMovies.map(movie => `
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
            `).join('');
        } else {
            document.getElementById('history-list').innerText = "No movie data found.";
        }
    } catch (e) {
        console.error('An error occurred:', e);
        document.getElementById('recent-results').innerText = "Error Error Where is my Data?!?";
    }
}

document.getElementById('history-button').addEventListener('click', displaySavedMovies);

// return buttons //
document.getElementById('retry-button').style.display = 'none';
document.getElementById('return-button').style.display = 'none';

document.getElementById('return-button').addEventListener('click', function() { 
    document.getElementById('intro').classList.remove('hidden');
    document.getElementById('application').style.display = 'flex';
    document.getElementById('current-results').style.display = 'none';
    document.getElementById('result-buttons').style.display = 'flex';
    document.getElementById('my-buttons').classList.remove('hidden');
    document.getElementById('retry-button').style.display = 'none';
    document.getElementById('return-button').style.display = 'none';
    document.getElementById('recent-results').style.display = 'none';
    document.getElementById('history-list').style.display = 'none';
});

function retrySearch() {
    searchAPI(lastGenreId, lastDecade, lastOriginalLanguage);

}

document.getElementById('retry-button').addEventListener('click', retrySearch);

//save history function//
function saveToLocalStorage(movie) {
    var savedMovies = JSON.parse(localStorage.getItem('movieData')) || [];
            savedMovies.unshift(movie);
            savedMovies = savedMovies.slice(0, 5);
            localStorage.setItem('movieData', JSON.stringify(savedMovies));

            displaySavedMovies();  
}

//included the clear be to be linked to index//

document.getElementById('clear-history').addEventListener('click', function() { 
    localStorage.removeItem('movieData');
    document.getElementById('history-list').innerText = " ";
});
//page saves history
// button clicks
// retrievs history
// displays history
