const express = require('express');
const {
  createExam,
  listExams,
  getExam,
  togglePublish,
  deleteExam,
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(listExams)
  .post(authorize('admin'), createExam);

router.route('/:id')
  .get(getExam)
  .delete(authorize('admin'), deleteExam);

router.patch('/:id/publish', authorize('admin'), togglePublish);

module.exports = router;
