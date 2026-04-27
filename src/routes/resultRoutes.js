const express = require('express');
const {
  submitResult,
  myResults,
  examResults,
  allResults,
  adminStats,
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), submitResult);
router.get('/my', authorize('student'), myResults);
router.get('/all', authorize('admin'), allResults);
router.get('/stats', authorize('admin'), adminStats);
router.get('/exam/:id', authorize('admin'), examResults);

module.exports = router;
