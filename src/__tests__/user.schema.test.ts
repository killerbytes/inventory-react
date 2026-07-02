import { describe, it, expect } from "vitest";
import { userSchema, loginSchema, signupSchema } from "@/schemas/user.schema";

describe("User Schema Validation", () => {
  it("should validate a user object without a password", () => {
    const validUser = {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      isActive: true,
      role: "User",
    };
    const parsed = userSchema.safeParse(validUser);
    expect(parsed.success).toBe(true);
  });

  it("should require username and password for login", () => {
    const validLogin = {
      username: "johndoe",
      password: "securepassword123",
    };
    const parsed = loginSchema.safeParse(validLogin);
    expect(parsed.success).toBe(true);
  });
});
