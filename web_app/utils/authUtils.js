const Profesor = require('../models/profesorModel');
const Admin = require('../models/adminModel');

exports.esAdmin = async (userId) => {
  try {
    const profesor = await Profesor.findById(userId);
    if (profesor) {
      return false;
    } else {
      const admin = await Admin.findById(userId);
      if (admin) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.error('Error al verificar si es admin:', error);
    return false;
  }
};
