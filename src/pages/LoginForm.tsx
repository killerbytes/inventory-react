import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ApiErrorResponse, Login, loginSchema } from "@/schemas";
import { useNavigate, useSearchParams } from "react-router";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { authServices } from "@/services";
import { useStore } from "@/stores";
import { cn } from "@/lib/utils";
import React from "react";

export default function LoginForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { authState } = useStore();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });
  const redirect = params.get("callbackUrl") || "/";

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const data = await authServices.login(values);
      const { accessToken } = data;
      authState.setToken(accessToken);
      toast.success(`Logging in... ${values.username}`);
      form.reset();
      navigate(decodeURIComponent(redirect), { replace: true });
    } catch (error) {
      const apiError = error as ApiErrorResponse;

      toast.error(`Login failed, ${apiError.message}`);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className={cn("w-[380px]")}>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Login to your account </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form
              name="login"
              autoComplete="on"
              action="/login"
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                form
                  .handleSubmit(onSubmit)(e)
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              }}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        {...field}
                        autoComplete="username"
                        id="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          autoComplete="current-password"
                          id="password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button className="w-full " type="submit">
                  Login
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster position="bottom-left" richColors />
    </div>
  );
}
