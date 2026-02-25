import z from "zod";

export const userSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  isActive: z.boolean(),
  isAdmin: z.boolean(),
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

export const signupSchema = userSchema
  .extend({
    password: z.string(),
    confirmPassword: z.string(),
  })
  .omit({
    id: true,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
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
//  export const loginSchema = z
//   .object({
//     password: z.string().min(1, "Password is required"),
//     confirmPassword: z.string().nullish(),
//   })
//   .superRefine((data, ctx) => {
//     if (data.password && !data.confirmPassword) {
//       ctx.addIssue({
//         path: ["confirmPassword"],
//         code: z.ZodIssueCode.custom,
//         message: "Check number is required when payment is by check",
//       });
//     }
//   });

export type User = z.infer<typeof userSchema>;
export type Signup = z.infer<typeof signupSchema>;
export type Login = z.infer<typeof loginSchema>;
export type ChangePassword = z.infer<typeof formChangePasswordSchema>;
