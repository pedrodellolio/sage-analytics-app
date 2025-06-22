import prisma from "./prisma";
import config from "../config/env";
import passport from "passport";
import passportJwt from "passport-jwt";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

// const cookieExtractor = function (req: any) {
//   var token = null;
//   if (req && req.cookies) {
//     token = req.cookies["jwt"];
//   }
//   return token;
// };

var opts = {
  // jwtFromRequest: cookieExtractor,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secretKey,
  // issuer: config.issuer,
  // audience: config.audience,
};

passport.use(
  "jwt",
  new JwtStrategy(opts, async (payload, done) => {
    const { sub, expiration } = payload;

    if (Date.now() > expiration) done("Unauthorized", false);

    const user = await prisma.user.findUnique({ where: { id: sub } });
    return user ? done(null, user) : done(null, false);
  })
);

export default passportJwt;
