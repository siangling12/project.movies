const knex = require('../db/connection');

function list() {
  return knex('movies').select('*');
}

function getMoviesShowing() {
  return knex('movies as m')
    .join('movies_theaters as mt', 'm.movie_id', 'mt.movie_id')
    .select('*')
    .where('mt.is_showing', true)
    .groupBy('m.movie_id');
}

function read(movie_id) {
  return knex('movies').select('*').where({ movie_id }).first();
}

function getTheatersShowingMovie(movie_id) {
  return knex('movies_theaters as mt')
    .join('theaters as t', 'mt.theater_id', 't.theater_id')
    .select('*')
    .where({ movie_id, is_showing: true });
}

function listReviewsByMovieId(movie_id) {
  return knex('reviews')
    .select('*')
    .where({ movie_id })
    .then((movieReviews) => {
      const mappedReviews = movieReviews.map((review) => {
        return knex('critics')
          .select('*')
          .where({ critic_id: review.critic_id })
          .first()
          .then((firstCritic) => {
            review.critic = firstCritic;
            return review;
          });
      });
      const fulfilledReviewsWithCritics = Promise.all(mappedReviews);
      return fulfilledReviewsWithCritics;
    });
}

module.exports = {
  read,
  list,
  getMoviesShowing,
  getTheatersShowingMovie,
  listReviewsByMovieId,
};