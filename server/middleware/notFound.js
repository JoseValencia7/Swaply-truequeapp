const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada - ${req.originalUrl}`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      method: req.method,
      url: req.originalUrl
    }
  });
};

module.exports = notFound;