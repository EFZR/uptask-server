import mongoose from "mongoose";
import colors from "colors";

export async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL!);
    const url = `${connection.connection.host}:${connection.connection.port}`;
    console.log(colors.cyan.bold(`MongoDB Conectado en: ${url}`));
  } catch (error) {
    console.log(colors.red.bold("Error al conectar a MongoDB."));
    process.exit(1);
  }
}
