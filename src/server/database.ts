import { Model, Sequelize, INTEGER, STRING, BOOLEAN } from "sequelize";
import { env as Environment } from "node:process";
export const database = new Sequelize(
  Environment["DATABASE_URL"] ??
    "postgres://admin:Admin123@localhost:5432/admin"
);

export class Todo extends Model {}

export async function initializeDatabase() {
  Todo.init(
    {
      id: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: STRING,
        allowNull: false,
      },
      completed: {
        type: BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize: database,
      modelName: "todo",
    }
  );

  await database.authenticate();
  return await database.sync({
    // never sync in production
    // run migrations or other tools that
    // update the database schema safely.
    force: Environment["NODE_ENV"] !== "production",
  });
}
