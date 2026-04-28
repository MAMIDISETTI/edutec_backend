const express = require('express');
const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  togglePublish,
  deleteCourse,
  addSubItem,
  updateSubItem,
  deleteSubItem,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(listCourses)
  .post(authorize('admin'), createCourse);

router
  .route('/:uuid')
  .get(getCourse)
  .patch(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

router.patch('/:uuid/publish', authorize('admin'), togglePublish);

router
  .route('/:uuid/sub-items')
  .post(authorize('admin'), addSubItem);

router
  .route('/:uuid/sub-items/:subUuid')
  .patch(authorize('admin'), updateSubItem)
  .delete(authorize('admin'), deleteSubItem);

module.exports = router;
