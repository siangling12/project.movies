const reviewsService = require('./reviews.service');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

async function reviewExists(req, res, next) {
  const { reviewId } = req.params;
  const review = await reviewsService.read(reviewId);

  if (!review) {
    return next({ status: 404, message: `Review cannot be found.` });
  }

  res.locals.reviewId = reviewId;
  res.locals.review = review;
  next();
}

const VALID_PROPERTIES = ['score', 'content'];

function hasOnlyValidProperties(req, _res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(', ')}`,
    });
  }
  next();
}

async function destroy(req, res, _next) {
  const { reviewId } = res.locals;
  await reviewsService.delete(reviewId);
  res.sendStatus(204);
}

async function update(req, res, _next) {
  const updatedReview = {
    ...res.locals.review,
    ...req.body.data,
    review_id: res.locals.review.review_id,
  };

  const criticsInfo = await reviewsService.update(updatedReview);
  updatedReview.critic = criticsInfo;
  res.json({ data: updatedReview });
}

module.exports = {
  update: [
    asyncErrorBoundary(reviewExists),
    hasOnlyValidProperties,
    asyncErrorBoundary(update),
  ],
  delete: [asyncErrorBoundary(reviewExists), asyncErrorBoundary(destroy)],
};
