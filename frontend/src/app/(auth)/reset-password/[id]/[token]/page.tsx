"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";


const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type Form = z.infer<typeof schema>;


export default function ResetPasswordPage() {
  const { id, token } = useParams() as { id: string; token: string }; // id and token
  const router = useRouter();

  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password, confirm_password}: Form) => {
    setLoading(true);
    try {
      await authAPI.resetPassword({ uid: id, token, password, confirm_password}); // send id, token, password
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Password Reset ✔</CardTitle>
          <CardDescription>Redirecting to login…</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/login"><Button>Go to Login</Button></Link>
        </CardFooter>
      </Card>
    );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>


          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConf ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirm_password")}
              />
              <button
                type="button"
                onClick={() => setShowConf((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConf ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}