import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { todoRouter } from "./todo";
import { recipeRouter } from "./recipe";
import { userRouter } from "./user";
import { matchRouter } from "./match";
import { cookedRecipesRouter } from "./cooked-recipes";
import { sharingRouter } from "./sharing";
import { commentsRouter } from "./comments";
import { notificationsRouter } from "./notifications";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  todo: todoRouter,
  recipe: recipeRouter,
  user: userRouter,
  match: matchRouter,
  cookedRecipes: cookedRecipesRouter,
  sharing: sharingRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
});
export type AppRouter = typeof appRouter;
