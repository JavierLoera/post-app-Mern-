import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
try {
  await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Base de datos conectada");
} catch (error) {
  console.log("Hubo un problema al conectarse a la base de datos" + error);
  process.exit(1);
}
