import express from "express";
import { join } from "path";
import * as url from "url";
import morgan from "morgan";
import session from "express-session";
import dotenv from "dotenv";
import sendEmail from "./utils/email/sendEmail.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(morgan("dev"));
//body parser to decode form
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

app.use(
    session({
        // store: new (require("connect-pg-simple")(session))({
        //     // Insert connect-pg-simple options here
        //     pool : require('./db/pool')
        // }),
        secret: "secret word",
        resave: true,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
        // Insert express-session options here
        saveUninitialized: false,
    })
);

//routes
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";

//error controller
import { getInternalError, getNotFound } from "./controllers/error.js";

const views = join(__dirname, "views");

//templates views
app.set("view engine", "ejs");
app.set("views", views);

//bootstrap include
app.use(
    "/css",
    express.static(join(__dirname, "..", "node_modules/bootstrap/dist/css"))
);
app.use(
    "/js",
    express.static(join(__dirname, "..", "node_modules/bootstrap/dist/js"))
);

//for public  css and  js folders
app.use(
    express.static(
        join(
            __dirname,
            "..",
            "node_modules/bootstrap/dist/css/bootstrap.min.css"
        )
    )
);
app.use(express.static(join(__dirname, "..", "public")));

app.use((req, res, next) => {
    req.user = req.cookies.session ? req.cookies.session.id : undefined;
    next();
});
//use routes

app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use(publicRoutes);

app.get("/500", getInternalError);
app.use(getNotFound);

app.use((error, req, res, next) => {
    console.log(error);
    res.redirect("/500");
});

//function to send automaticall eMail
const autocall = () => {
    sendEmail();
};
setInterval(() => {
    autocall();
}, 1000);
// autocall()

export default app;
