const path = require('path');
const express = require("express");
const Pool = require('pg-pool');
const url = require('url');
const pg = require('pg');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const escapeHtml = require('escape-html');

const PORT = process.env.PORT || 3001;
const saltRounds = 2;
const defaultStartColor = "ec1187";
const defaultEndColor = "ff8c12";
const realm = process.env.REALM || "http://localhost:3001";
const googleClientId = "330390252900-jf93ej4fr0drh7c30kmnsnnk13bmmv1u.apps.googleusercontent.com";
const googleClientSecret = "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";
//Backup App ID
// const facebookAppId = "459238136119315";
// const facebookAppSecret = "0189e6052dd0a9155bb0b6429f025ca9";
//Main App ID
const facebookAppId = "632662478146060";
const facebookAppSecret = "fa3610345e0330f2baacb52780507660";

const app = express();
const bodyParser = require('body-parser');

const params = url.parse(process.env.DATABASE_URL || "postgres://samue:38642356@localhost:5432/capstone-ijws");
const auth = params.auth.split(':');
const pgPoolConfig = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: process.env.PG_SSL && { rejectUnauthorized: false }
};
const pgPool = new Pool(pgPoolConfig);
app.use(expressSession({
    store: new pgSession({
        pool: pgPool,
        schemaName: "main"
    }),
    secret: "Uvuvwevwevwe Onyetenyevwe Ugwemuhwem Ossas",
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

passport.serializeUser((user, done) => {
    console.log("Serialization Started");
    return done(null, user.id);
});

passport.deserializeUser((user, done) => {
    console.log("Deserialization Started", user);
    pgPool.query(
        `SELECT * FROM main.users WHERE "id"=${user}`,
        (error, results) => {
            if (error)
                return done(error, null);
            else
                if (results.rowCount > 0)
                    return done(null, results.rows[0]);
                else
                    return done(new Error("User Not Found"), null);
        }
    );
});

app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

passport.use(new LocalStrategy((username, password, done) => {
    console.log("Local Strategy Authentication Started");
    pgPool.query(
        `SELECT * FROM main.users where "username"='${username}'`,
        (error, results) => {
            console.log("Auth Results", results);
            if (error) return done(error, null);
            if (results.rowCount < 1) return done(null, false);
            if (results.rowCount > 0)
                if (results.rows[0].password) {
                    if (bcrypt.compareSync(password, results.rows[0].password))
                        return done(null, results.rows.map(v => { delete v.password; return v; })[0]);
                    else
                        return done(null, false);
                }
                else {
                    return done(`You are not signed up with a password. Please use ${results.rows[0]["facebook-login"] ? "Facebook" : "Google"} to login.`, null);
                }
        }
    );
}));

passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: `${realm}/login-google/redirect`,
    scope: ['email', 'profile'],
    state: true
},
    function verify(accessToken, refreshToken, profile, done) {
        console.log("Google Profile", profile);
        pgPool.query(
            `SELECT * FROM main.users WHERE "google-id"='${profile.id}'`,
            (error, results) => {
                console.log("Google User Search", results);
                if (error) return done(error);
                if (results.rowCount < 1) {
                    //Create new user and return
                    pgPool.query(
                        `INSERT INTO main.users("email", "google-login", "date-joined", "link-id", "first-name", "last-name", "google-id")
                            VALUES('${profile.emails[0].value}', true, now(), '${generateUserLink()}', '${profile.name.givenName}', '${profile.name.familyName}', '${profile.id}')`,
                        (error1, results1) => {
                            if (error1) return done(error1);
                            else {
                                pgPool.query(`SELECT * FROM main.users WHERE "google-id"='${profile.id}'`,
                                    (error2, results2) => {
                                        if (error2) return done(error2);
                                        else return done(null, results2?.rows.map(v => { delete v.password; return v; })[0]);
                                    });
                            }
                        }
                    );
                }
                else {
                    //Return existing user
                    return done(null, results.rows.map(v => { delete v.password; return v; })[0]);
                }
            }
        );
    }
));

passport.use(new FacebookStrategy({
    clientID: facebookAppId,
    clientSecret: facebookAppSecret,
    callbackURL: `${realm}/login-facebook/redirect`,
    profileFields: ['id', 'emails', 'name']
},
    function verify(accessToken, refreshToken, profile, done) {
        console.log("Facebook Profile", profile);
        pgPool.query(
            `SELECT * FROM main.users WHERE "facebook-id"='${profile.id}'`,
            (error, results) => {
                console.log("Facebook User Search", results);
                if (error) return done(error);
                if (results.rowCount < 1) {
                    //Create new user and return
                    pgPool.query(
                        `INSERT INTO main.users("email", "facebook-login", "date-joined", "link-id", "first-name", "last-name", "facebook-id")
                        VALUES('${profile.emails[0].value}', true, now(), '${generateUserLink()}', '${profile.name.givenName}', '${profile.name.familyName}', '${profile.id}')`,
                        (error1, results1) => {
                            if (error1) return done(error1);
                            else {
                                pgPool.query(`SELECT * FROM main.users WHERE "facebook-id"='${profile.id}'`,
                                    (error2, results2) => {
                                        if (error2) return done(error2);
                                        else return done(null, results2?.rows.map(v => { delete v.password; return v; })[0]);
                                    });
                            }
                        }
                    );
                }
                else {
                    //Return existing user
                    return done(null, results.rows.map(v => { delete v.password; return v; })[0]);
                }
            }
        );
    }
));

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'zIJWS')));
//app.use(express.static(path.resolve(__dirname, '../client/build')));

const generateUserLink = () => crypto.randomBytes(10).toString('hex').substring(0, 16);

// Handle GET requests to /api route
app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/get-messages", (req, res) => {
    console.log("Get Messages", req.user);
    try {
        if (req.isAuthenticated()) {
            const userId = req.user.id;
            pgPool.query(
                `SELECT * FROM main.messages WHERE "user-id"=${userId} ORDER BY "date-created" DESC;`,
                (error, results) => {
                    if (error)
                        return res.send({ success: false, errorDetails: error, errorMessage: error.message });
                    return res.send({
                        success: true,
                        messages: results.rows.map(v => { delete v["user-id"]; return v; })
                    });
                }
            );
        }
        else {
            console.log("Redirecting to login page");
            return res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message, error);
        return res.sendStatus(500);
    }
});

app.get("/query-username", (req, res) => {
    try {
        const username = req.query.username;
        pgPool.query(
            `SELECT * FROM main.users WHERE username='${username}';`,
            (error, results) => {
                if (error != undefined || username == undefined) {
                    console.log(error);
                    return res.send("-1");
                }
                else {
                    return res.send(results.rowCount.toString());
                }
            }
        );
    } catch (error) {
        console.log(error.message, error);
        res.status(500);
        return res.send({ errorMessage: error.message, errorDetails: error });
    }
});

app.post("/signup-local", (req, res) => {
    try {
        const body = req.body;
        console.log(body);
        const username = body.username,
            email = body.email,
            password = body.password,
            firstname = body.firstname,
            lastname = body.lastname,
            link = generateUserLink();
        const sendError = error => res.redirect(`/login?signuperror=${escapeHtml(error.message)}`);
        console.log(username, email, password, link);
        pgPool.query(
            `SELECT * FROM main.users WHERE email='${email}';`
        ).then(
            results => {
                console.log(results.rowCount);
                if (results.rowCount > 0) {
                    return res.redirect(`/login?signuperror=${escapeHtml("The email already exists.")}`);
                }
                else {
                    bcrypt.hash(password, saltRounds).then(encryptedPassword =>
                        pgPool.query(
                            `INSERT INTO main.users("username", "email", "password", "facebook-login", "google-login", "date-joined", "link-id", "first-name", "last-name") VALUES('${username}', '${email}', '${encryptedPassword}', false, false, now(), '${link}', '${firstname}', '${lastname}')`,
                            (error, result) => {
                                if (error) {
                                    return sendError(error);
                                }
                                //return res.send({ success: true, link: link });
                                return res.redirect("/login?signedup=T");
                            }
                        )).catch(error => sendError(error));
                }
            }
        ).catch(error => sendError(error));
    } catch (error) {
        console.log(error.message, error);
        return sendError(error);
    }
});

app.post("/login-local",
    passport.authenticate('local', { failureRedirect: `/login?loginerror=${escapeHtml("Your username or password is incorrect. If you previously logged in with Google or Facebook, please use those methods instead.")}` }),
    (req, res) => {
        console.log("Login Success");
        return res.redirect("/dashboard");
    });

app.get("/login-google", passport.authenticate('google'));
app.get("/login-google/redirect",
    passport.authenticate('google', { failureRedirect: `/login?error=${escapeHtml("There was a problem with Google's servers")}`, failureMessage: true }),
    (req, res) => {
        console.log("Google Login Success");
        return res.redirect("/dashboard");
    });

app.get("/login-facebook", passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
app.get("/login-facebook/redirect",
    passport.authenticate('facebook', { failureRedirect: `/login?error=${escapeHtml("There was a problem with Facebook's servers")}`, failureMessage: true }),
    (req, res) => {
        console.log("Facebook Login Success");
        return res.redirect("/dashboard");
    });

app.get("/login", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/dashboard");
    else return res.sendFile(path.resolve(__dirname, "zIJWS/login.html"));
});

app.get("/dashboard", (req, res) => {
    if (req.isAuthenticated()) return res.sendFile(path.resolve(__dirname, 'zIJWS', 'dashboard.html'));
    else return res.redirect("/login");
});

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect("/login");
        //return res.send({ success: true });
    });
});

app.get("/checkuser", (req, res) => {
    return res.send(req.user || "No one is logged in");
});

app.post("/send-message", (req, res) => {
    try {
        const sourceUrl = req.query.source;
        console.log("source url", sourceUrl);
        const body = req.body;
        const linkId = body.linkId,
            message = body.message,
            startColor = body.startColor.substring(1, 7) || defaultStartColor,
            endColor = body.endColor.substring(1, 7) || defaultEndColor,
            fontStyle = body.fontStyle || "Poppins",
            fontColor = body.fontColor.substring(1, 7) || "ffffff";
        codename = body.codename;

        if (linkId && message) {
            pgPool.query(
                `SELECT * FROM main.users WHERE "link-id"='${linkId}'`
            ).then(result => {
                console.log(result);
                const queryVals = [result.rows[0].id, message, startColor, endColor, fontColor, fontStyle];
                if (result.rowCount > 0)
                    pgPool.query(
                        `INSERT INTO main.messages("user-id", "message", "date-created", "start-color", "end-color", "font-color", "font-style"${codename ? `, "codename"` : ""})
                        VALUES($1::int, $2::text, now(), $3::text, $4::text, $5::text, $6::text${codename ? `, '${codename}'` : ""});`, queryVals,
                        (error, results) => {
                            if (error)
                                return res.redirect(`${sourceUrl}?${escapeHtml(`error=${error.message}`)}`); //res.send({ success: false, errorMessage: error.message, errorDetails: error });
                            else {
                                console.log(results);
                                return res.redirect(`${sourceUrl}?${escapeHtml(`success=T`)}`);//res.send({ success: true });
                            }
                        }
                    );
                else
                    return res.redirect(`${sourceUrl}?${escapeHtml(`error=No user associated to link id`)}`);//res.send({ success: false, errorMessage: "No user associated to link id" });
            });
        }
        else {
            return res.redirect(`${sourceUrl}?${escapeHtml(`error=Invalid link id or message.`)}`);//res.send({ success: false, errorMessage: "Invalid link id or message." });
        }
    } catch (error) {
        console.log(error.message, error);
        // res.status(500);
        return res.redirect(`${sourceUrl}?${escapeHtml(`error=${error.message}`)}`);//res.send({ errorDetails: error, errorMessage: error.message });
    }
});

app.get('/saysomething/*', (req, res) => {
    const linkId = req.path.split("/")[2];
    console.log("link id", linkId);
    pgPool.query(
        `SELECT * FROM main.users WHERE "link-id"='${linkId}';`,
        (error, results) => {
            if (error) return res.sendStatus(500);
            if (results.rowCount < 1) return res.sendStatus(404);
            // return res.send(`You're sending a message to: ${results.rows[0]["first-name"]}`);
            return res.sendFile(path.resolve(__dirname, 'zIJWS', 'link.html'));
        }
    );
    //res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.get('/get-user-from-link', (req, res) => {
    const linkId = req.query.link;
    console.log("link id", linkId);
    pgPool.query(
        `SELECT * FROM main.users WHERE "link-id"='${linkId}';`,
        (error, results) => {
            if (error) return res.sendStatus(500);
            if (results.rowCount < 1) return res.sendStatus(404);
            return res.send(results.rows[0]);
        }
    );
    //res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.get("/", (req, res) => res.redirect("/dashboard"));

app.get("/get-message", (req, res) => {
    const messageId = req.query.id;
    console.log("message-id id", messageId);
    pgPool.query(
        `SELECT * FROM main.messages WHERE id='${messageId}';`,
        (error, results) => {
            if (error) return res.sendStatus(500);
            if (results.rowCount < 1) return res.sendStatus(404);
            // return res.send(`You're sending a message to: ${results.rows[0]["first-name"]}`);
            return res.send(results.rows[0]);
        }
    );
});

app.get("/messages/*", (req, res) => {
    return res.sendFile(path.resolve(__dirname, 'zIJWS', 'message.html'));
});

app.get("/settings", (req, res) => res.sendFile(path.resolve(__dirname, 'zIJWS', 'settings.html')));
app.get("/about", (req, res) => res.sendFile(path.resolve(__dirname, 'zIJWS', 'about.html')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.send({ message: "You're thrown into the abyss", source: req.url });
    //res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});