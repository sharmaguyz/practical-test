
import type { Metadata } from "next";
import React from "react";

import UserAddEditForm from "@/components/auth/admin/UserAddEditForm";

export const metadata: Metadata = {
  title: "Add User | Practical Academy",
  description: "Practical Academy",
};

interface PageProps {
  params: Promise<{ id: string | number }>;
}

export default async function AddEditUserForm(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    return <UserAddEditForm id={id}/>
}