const API_KEY = '43c8507c98132c39a9235491a15613d1';  
const BASE_URL = 'https://api.themoviedb.org/3/';

// Fetch upcoming movies and display
async function getUpcomingMovies() {
  try {
    const response = await fetch(`${BASE_URL}movie/upcoming?api_key=${API_KEY}&language=en-US`);
    if (!response.ok) throw new Error('Failed to fetch upcoming movies');
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
  }
}

// Display movies on the page
function displayMovies(movies) {
  const movieContainer = document.getElementById('movie-container');
  movieContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path || 'default-image.jpg'}" alt="${movie.title}">
      <div class="movie-title">${movie.title}</div>
    `;
    movieElement.onclick = () => handleMovieClick(movie);
    movieContainer.appendChild(movieElement);
  });
}

// Handle movie click event
async function handleMovieClick(movie) {
  try {
    const movieDetails = await fetch(`${BASE_URL}movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
    const movieData = await movieDetails.json();

    const credits = await fetch(`${BASE_URL}movie/${movie.id}/credits?api_key=${API_KEY}&language=en-US`);
    const creditsData = await credits.json();

    const castAndCrewRatings = await getCastAndCrewRatings(creditsData.cast, creditsData.crew);

    const movieScore = castAndCrewRatings.reduce((sum, rating) => sum + rating.avgRating, 0) / castAndCrewRatings.length;

    let videoURL = '';
    if (movieScore < 5) {
      videoURL = 'https://www.youtube.com/clip/UgkxxeiPjhFOtw7gJfrclGwbQ0xoMZeRW3Wm'; 
    } else if (movieScore <= 7) {
      videoURL = 'https://www.youtube.com/clip/UgkxUqMxppNWD4drncYv-R-FWEO54wrXTUQS';   
    } else {
      videoURL = 'https://www.youtube.com/clip/UgkxQZ-w9D3rrzeddN2rLywryJBFTosT_viC';  
    }

    playVideo(videoURL);

    setTimeout(() => {
      displayMovieScore(movieScore);
      showCastAndCrewScores(castAndCrewRatings);
    }, 5000);  // Adjust based on video length
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

// Get ratings of cast/crew for their previous 5 films
async function getCastAndCrewRatings(cast, crew) {
  const allMembers = [...cast, ...crew];
  const ratings = [];

  for (const member of allMembers) {
    const films = await fetch(`${BASE_URL}person/${member.id}/movie_credits?api_key=${API_KEY}`);
    const filmsData = await films.json();
    const ratingsForMember = filmsData.cast.concat(filmsData.crew).slice(0, 5);

    if (ratingsForMember.length < 5) continue;

    const avgRating = ratingsForMember.reduce((sum, film) => sum + film.vote_average, 0) / ratingsForMember.length;

    ratings.push({
      name: member.name,
      job: member.job || 'Actor',
      photo: `https://image.tmdb.org/t/p/w500${member.profile_path}`,
      avgRating,
    });
  }

  return ratings;
}

// Display movie score in popup
function displayMovieScore(score) {
  const scoreElement = document.createElement('h2');
  scoreElement.textContent = `Movie Rating: ${score}`;
  document.getElementById('movie-score').appendChild(scoreElement);
}

// Play video in popup
function playVideo(url) {
  const videoElement = document.getElementById('movie-video');
  videoElement.src = url;
  videoElement.play();
}

// Show highest and lowest scores for cast and crew
function showCastAndCrewScores(ratings) {
  ratings.sort((a, b) => b.avgRating - a.avgRating);

  const lowestTwo = ratings.slice(-2);
  const highestTwo = ratings.slice(0, 2);

  const castInfo = document.getElementById('cast-crew-info');
  castInfo.innerHTML = '';

  lowestTwo.forEach(member => {
    const memberDiv = document.createElement('div');
    memberDiv.innerHTML = `
      <h4>${member.name} (${member.job})</h4>
      <img src="${member.photo}" alt="${member.name}"> 
      <p>Avg Rating: ${member.avgRating}</p>
      <p>Explanation: The Weakest Links</p>
    `;
    castInfo.appendChild(memberDiv);
  });

  highestTwo.forEach(member => {
    const memberDiv = document.createElement('div');
    memberDiv.innerHTML = `
      <h4>${member.name} (${member.job})</h4>
      <img src="${member.photo}" alt="${member.name}">
      <p>Avg Rating: ${member.avgRating}</p>
      <p>Explanation: The Creme de La Creme</p>
    `;
    castInfo.appendChild(memberDiv);
  });

  document.getElementById('popup').style.display = 'flex';
}

// Close the popup window
function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

// Initialize the page
getUpcomingMovies();
