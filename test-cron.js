import { connectDB } from "./src/config/db.js";
import { runWatchCron } from "./src/features/watch/watch.cron.js";

await connectDB();
console.log("DB connected — running cron manually...");

await runWatchCron();

console.log("Done — check the logs above and your DB.");
process.exit(0);