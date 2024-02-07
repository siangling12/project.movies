const moviesService = require('./movies.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function movieExists(req, res, next) {
  const { movieId } = req.params;
  const movie = await moviesService.read(movieId);
  if (!movie) {
    return next({ status: 404, message: `Movie cannot be found.` });
  }
  res.locals.movieId = movieId;
  res.locals.foundMovie = movie;
  next();
}

async function list(req, res, _next) {
  const { is_showing } = req.query;
  let data;
  if (is_showing === 'true') {
    data = await moviesService.getMoviesShowing();
  } else {
    data = await moviesService.list();
  }
  res.json({ data });
}

async function getTheatersShowingMovie(req, res, _next) {
  const { movieId } = res.locals;
  const data = await moviesService.getTheatersShowingMovie(movieId);
  res.json({ data });
}

async function listReviewsByMovieId(req, res, _next) {
  const { movieId } = req.params;
  const data = await moviesService.listReviewsByMovieId(movieId);
  res.json({ data });
}

module.exports = {
  read: [asyncErrorBoundary(movieExists), asyncErrorBoundary((req, res, _next) => {
    const data = res.locals.foundMovie;
    res.json({ data });
  })],
  getTheatersShowingMovie: [asyncErrorBoundary(movieExists), asyncErrorBoundary(getTheatersShowingMovie)],
  listReviewsByMovieId: [asyncErrorBoundary(movieExists), asyncErrorBoundary(listReviewsByMovieId)],
  list: asyncErrorBoundary(list),
};
