import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AuthLayout from "@/components/core/layouts/AuthLayout";

import { constants } from "@/settings";

export default async function RootAuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(constants.ACCESS_TOKEN)?.value;

  if (token) {
    redirect(`/${locale}/user-management`);
  }

  return <AuthLayout>{children}</AuthLayout>;
}
