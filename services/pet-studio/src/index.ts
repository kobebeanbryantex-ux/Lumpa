import { buildPetStudio } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const { app } = await buildPetStudio(config);
const shutdown = async () => { await app.close(); process.exit(0); };
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
await app.listen({ host: config.host, port: config.port });
