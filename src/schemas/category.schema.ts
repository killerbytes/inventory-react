import z from "zod";

export const categoryBaseSchema = z.object({
  id: z.number().nullish(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  parentId: z.number().nullish(),
  description: z.string(),
  order: z.number().nullish(),
});

export const categorySchema = categoryBaseSchema.extend({
  subCategories: z.array(categoryBaseSchema).nullish(),
});

export type Category = z.infer<typeof categorySchema>;
