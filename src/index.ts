import { DBConfig } from "./infrastructure/config/DBConfig";
import { connectV2Database } from "./infrastructure/config/prisma";
import { createServer } from "./infrastructure/config/app";
import dotenv from "dotenv"
import path from "path";
import server from "./providers/socketIO";
import dns from "node:dns";

dotenv.config({ path: path.resolve(process.cwd(), ".env")})
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const startServer = async () => {

    try {
        await DBConfig()
        // PostgreSQL is opt-in so existing Mongo-only deployments are unchanged.
        if (process.env.POSTGRES_DATABASE_URL) {
            await connectV2Database()
        }
        // const app = createServer()
        // app?.listen(process.env.PORT || 3000, () => console.log('Server started successfully'))  
        server.listen(process.env.PORT || 3000, () => console.log('Server Connected Successfully'));
    } catch (error) {
        console.error(error);
    }

}

startServer()
