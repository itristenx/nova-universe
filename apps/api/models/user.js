// This is the updated Sequelize model for the User, with isDefault in camelCase

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // ... other fields ...
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // ... other fields ...
  }, {
    // options
  });

  return User;
};