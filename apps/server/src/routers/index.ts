import {
  protectedProcedure, publicProcedure,
  router,
} from "../lib/trpc";
import { todoRouter } from "./todo";
import { recipeRouter } from "./recipe";
import { userRouter } from "./user";
import { matchRouter } from "./match";

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
});
export type AppRouter = typeof appRouter;
