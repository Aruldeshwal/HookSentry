import { AuthContainer } from "@/components/auth/AuthContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operator Login — HookSentry",
  description: "Authenticate to access HookSentry Webhook Fleets and DLQ Console.",
};

export default function LoginPage() {
  return <AuthContainer mode="sign-in" />;
}
