import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { API_BASE_URL } from "@/components/config/config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Practical Academy | Reset Password",
  description: "Practical Academy | Reset Password",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ResetPassword(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  let email : string = "";

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/check-resetpassword-token?token=${slug}`, {
    cache: "no-store",
  });
  if (response.status === 400) {
    return redirect("/admin/signin");
  }

  const data = await response.json();
  if (data.email) {
    email = data.email;
  }

  return <ResetPasswordForm email={email} />;
}