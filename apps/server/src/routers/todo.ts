
import z from "zod";
import { router, publicProcedure } from "../lib/trpc";
import { Todo } from "../db/models/todo.model";

export const todoRouter = router({
    getAll: publicProcedure.query(async () => {
        return await Todo.find().lean();
    }),

    create: publicProcedure
        .input(z.object({ text: z.string().min(1) }))
        .mutation(async ({ input }) => {
            const newTodo = await Todo.create({ text: input.text });
        return newTodo.toObject();
    }),

    toggle: publicProcedure
        .input(z.object({ id: z.string(), completed: z.boolean() }))
        .mutation(async ({ input }) => {
            await Todo.updateOne({ id: input.id }, { completed: input.completed });
            return { success: true };
    }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await Todo.deleteOne({ id: input.id });
            return { success: true };
    }),
});
