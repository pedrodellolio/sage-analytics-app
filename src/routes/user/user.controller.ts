import { Router, Request, Response, NextFunction } from "express";

const userRouter = Router();

/**
 * Get user's info
 * @auth required
 * @route {GET} /user/me
 */
userRouter.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user; // injected by Passport after authentication
      res.json({
        message: "Acesso concedido 🎉",
        user: { id: user.id, email: user.email },
      });
    } catch (err) {
      console.error("Erro na rota protegida:", err);
      next(err);
    }
  }
);
export default userRouter;
