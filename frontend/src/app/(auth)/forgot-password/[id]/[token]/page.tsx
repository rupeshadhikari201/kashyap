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


const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;


export default function ResetPasswordPage() {
  const params = useParams(); // id and token
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });


  const onSubmit = async ({ password }: ResetForm) => {
    if (!params.id || !params.token) return;
    const [uid, token] = params.slug as [string, string];

    setLoading(true);
    try {
      await authAPI.resetPassword({ uid: params.id, token: params.token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 3_000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

// done state
  if (done) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Password Reset ✔</CardTitle>
          <CardDescription>
            Your password has been updated. Redirecting to login…
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

// form state
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* ---- New Password ---- */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* ---- Confirm Password ---- */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
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