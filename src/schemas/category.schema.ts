import z from "zod";

export const categoryBaseSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  parentId: z.number().nullish(),
  description: z.string(),
  order: z.number().nullish(),
});

export type CategoryInput = z.infer<typeof categoryBaseSchema>;
export type Category = z.infer<typeof categoryBaseSchema> & {
  id: number;
  subCategories?: Category[];
};

export const categorySchema: z.ZodType<Category> = categoryBaseSchema.extend({
  id: z.number(),
  subCategories: z.lazy(() => z.array(categorySchema)).optional(),
});
