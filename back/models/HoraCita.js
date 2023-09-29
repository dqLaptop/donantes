'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HoraCita extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Horario, {as: 'DiaHora', foreignKey: 'idHora'});
    }
  }
  HoraCita.init({
    hora: DataTypes.TIME
  }, {
    sequelize,
    tableName: 'horasCitas',
    modelName: 'HoraCita',
  });
  return HoraCita;
};