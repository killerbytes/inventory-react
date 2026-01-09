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
import qs from "query-string";
import * as z from "zod";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { ApiErrorResponse } from "@/types";
import { authServices } from "@/services";
import { loginSchema } from "@/schemas";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();
  const { callbackUrl } = qs.parse(window.location.search);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    // defaultValues: {
    //   username:
    //     localStorage.getItem(`${import.meta.env.VITE_APP_NAME}_USER`) || "",
    //   password: "",
    // },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const data = await authServices.login(values);
      const { token } = data;
      await localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_TOKEN`,
        token,
      );
      toast.success(`Logging in... ${values.username}`);
      form.reset();
      // localStorage.setItem(
      //   `${import.meta.env.VITE_APP_NAME}_USER`,
      //   values.username,
      // );
      navigate(typeof callbackUrl === "string" ? callbackUrl : "/");
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
              <input
                type="text"
                name="username"
                autoComplete="username"
                hidden
              />

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
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                        autoComplete="current-password"
                        id="password"
                      />
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
