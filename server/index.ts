import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
  const server = await registerRoutes(app);
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch(console.error);