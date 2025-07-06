import Fastify from "fastify";
import FastifyMysql from "@fastify/mysql";
import "dotenv/config";

import router from "./routers/router.js";

const app = Fastify({
    logger:true
});
app.register(FastifyMysql,{
    host: process.env.HOST,
    database:process.env.DATABASE,
    password: process.env.PASSWORD,
    user:process.env.USERDB
});
app.register(router);
app.listen({
    port:process.env.PORT
},function(err,address) {
    if (err) {
        return app.log.error(err);
    };

    app.log.info(`Server Running ${address}`);
});