// src/errors/errorHandler.js
const CustomError = require('./customErrors.js');

const errorHandler = (err, req, res, next) => {
  // اگر ارور از نوع CustomError باشد
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // برای ارورهای غیر منتظره
  console.error(err); // برای لاگ کردن در کنسول
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

module.exports = errorHandler;
