import { AuthContainer } from "@/components/auth/AuthContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Operator Account — HookSentry",
  description: "Provision operator credentials for HookSentry Webhook Fleets and DLQ Triage.",
};

export default function SignUpPage() {
  return <AuthContainer mode="sign-up" />;
}
