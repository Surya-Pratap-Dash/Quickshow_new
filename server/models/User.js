import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "Users",
    hooks: {
      beforeCreate: (user) => {
        console.log(`\n📝 [Model Hook] BEFORE CREATE - Inserting user into database`);
        console.log(`   ✓ ID: ${user.id}`);
        console.log(`   ✓ Email: ${user.email}`);
        console.log(`   ✓ Name: ${user.name}`);
        console.log(`   ✓ Image: ${user.image ? 'yes' : 'none'}`);
        console.log(`   ✓ Admin: ${user.isAdmin}`);
      },
      afterCreate: (user) => {
        console.log(`✅ [Model Hook] AFTER CREATE - User successfully inserted!`);
        console.log(`   ✓ Record ID: ${user.id}`);
        console.log(`   ✓ Email: ${user.email}`);
        console.log(`   ✓ Created At: ${user.createdAt}`);
      },
    }
  }
);

export default User;
