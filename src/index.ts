import express from "express";
import { userRoutes } from "./routes/users.route";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
