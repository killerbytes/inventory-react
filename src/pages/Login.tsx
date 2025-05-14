import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import validations from "@/utils/validations";
import * as z from "zod";
import qs from "query-string";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import services, { type ApiError } from "@/services";
import { cn } from "@/lib/utils";
import { Navigate, useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const { callbackUrl } = qs.parse(window.location.search);
  const { loginSchema } = validations;
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "killerbytes",
      password: "1234",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const { data } = await services.authServices.login(values);
      const { token } = data;

      await localStorage.setItem(
        `${import.meta.env.VITE_APP_NAME}_TOKEN`,
        token
      );
      toast.success(`Logging in... ${values.username}`);
      form.reset();
      navigate(typeof callbackUrl === "string" ? callbackUrl : "/");
    } catch (error) {
      console.log(error);
      //   const { errors } = (
      //     error as { response: { data: { errors: ApiError[] } } }
      //   ).response;
      //   toast.error(error.response.data.error);
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
                    <FormControl>
                      <Input placeholder="Username" {...field} />
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
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
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
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
