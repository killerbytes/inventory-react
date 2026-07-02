import { ROLES } from "@/utils/permissions";
import z from "zod";

export const userBaseSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  isActive: z.boolean(),
  role: z
    .enum(Object.values(ROLES) as [string, ...string[]])
    .default(ROLES.USER),
  // .min(8, {
  //   message: "Password must be at least 8 characters.",
  // })
  // .regex(/[a-z]/, {
  //   message: "Password must contain at least one lowercase letter.",
  // })
  // .regex(/[A-Z]/, {
  //   message: "Password must contain at least one uppercase letter.",
  // })
  // .regex(/[0-9]/, {
  //   message: "Password must contain at least one number.",
  // })
  // .regex(/[^a-zA-Z0-9]/, {
  //   message: "Password must contain at least one special character.",
  // }),
});

export const userSchema = userBaseSchema.extend({
  id: z.coerce.number(),
});

export const signupObjectSchema = userBaseSchema.extend({
  password: z.string(),
  confirmPassword: z.string(),
});

export const signupSchema = signupObjectSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  },
);

export const loginSchema = signupObjectSchema.pick({
  username: true,
  password: true,
});

export const userFormSchema = userBaseSchema.pick({
  isActive: true,
  role: true,
});

export const formChangePasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export type UserBase = z.infer<typeof userBaseSchema>;
export type User = z.infer<typeof userSchema>;
export type UserForm = z.infer<typeof userFormSchema>;
export type Signup = z.infer<typeof signupSchema>;
export type Login = Pick<z.infer<typeof signupSchema>, "username" | "password">;
export type ChangePassword = z.infer<typeof formChangePasswordSchema>;
