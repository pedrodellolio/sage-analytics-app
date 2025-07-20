import {
  Router,
  Request,
  Response,
  NextFunction,
  CookieOptions,
} from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import z from "zod";
import prisma from "../../libs/prisma";
import config from "../../config/env";
import passport from "passport";

const authRouter = Router();

function _signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, config.secretKey, {
    algorithm: "HS256",
    expiresIn: "15m",
    issuer: config.issuer,
    audience: config.audience,
  });
}

const COOKIE_PATH = "/api/auth/refresh";
const COOKIE_CONFIG: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  path: COOKIE_PATH,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Create a new user
 * @auth none
 * @route {POST} /api/auth/register
 */
authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, password } = RegisterDto.parse(
        req.body
      );

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { firstName, lastName, email, passwordHash: hashed },
      });
      res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: err.errors });
      } else {
        console.error("Login error:", err);
        next(err);
      }
    }
  }
);

/**
 * Login with email and password
 * @auth none
 * @route {POST} /api/auth/login
 */
authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = LoginDto.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const accessToken = _signAccessToken(user.id);
      const refreshToken = jwt.sign({ sub: user.id }, config.secretKey, {
        algorithm: "HS256",
        expiresIn: "7d",
        issuer: config.issuer,
        audience: config.audience,
      });

      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id },
      });

      res.cookie("refreshToken", refreshToken, COOKIE_CONFIG);

      res.json({ accessToken });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: err.errors });
      } else {
        console.error("Login error:", err);
        next(err);
      }
    }
  }
);

/**
 * Refresh access token
 * @auth required
 * @route {POST} /api/auth/refresh
 */
authRouter.post(
  "/refresh",
  // passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = RefreshTokenDto.parse(req.cookies);

      // Verify if token is valid
      let payload: any;
      try {
        payload = jwt.verify(refreshToken, config.secretKey, {
          algorithms: ["HS256"],
          issuer: config.issuer,
          audience: config.audience,
        }) as { sub: string };
      } catch {
        res.clearCookie("refreshToken", { path: COOKIE_PATH });
        res.status(401).json({ error: "Refresh token is invalid/expired" });
        return;
      }

      // Check if refresh token is already stored or revoked
      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      if (!stored || stored.revoked) {
        res.clearCookie("refreshToken", { path: COOKIE_PATH });
        res.status(401).json({ error: "Refresh token is invalid/revoked" });
        return;
      }

      await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { revoked: true },
      });

      // Generate new token
      const newAccessToken = _signAccessToken(payload.sub);
      const newRefreshToken = jwt.sign({ sub: payload.sub }, config.secretKey, {
        algorithm: "HS256",
        expiresIn: "7d",
        issuer: config.issuer,
        audience: config.audience,
      });

      await prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: payload.sub },
      });

      res.cookie("refreshToken", newRefreshToken, COOKIE_CONFIG);
      res.json({ accessToken: newAccessToken });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: err.errors });
      } else {
        console.error("Refresh token error:", err);
        next(err);
      }
    }
  }
);

/**
 * Revoke access token
 * @auth required
 * @route {POST} /api/auth/logout
 */
authRouter.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = RefreshTokenDto.parse(req.cookies);
      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { revoked: true },
        });
      }
      res.clearCookie("refreshToken", { path: COOKIE_PATH });
      res.status(204).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: err.errors });
      } else {
        console.error("Logout error:", err);
        next(err);
      }
    }
  }
);

export default authRouter;
