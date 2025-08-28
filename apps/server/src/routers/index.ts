import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { commentsRouter } from "./comments";
import { cookedRecipesRouter } from "./cooked-recipes";
import { matchRouter } from "./match";
import { notificationsRouter } from "./notifications";
import { recipeRouter } from "./recipe";
import { sharingRouter } from "./sharing";
import { todoRouter } from "./todo";
import { userRouter } from "./user";

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
