import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listAdmins } from "@/lib/users";
import { AdminUsersPanel } from "@/components/AdminUsers";

export default async function AdminsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin/admins");
  if (session.role !== "owner") redirect("/");

  const admins = await listAdmins();

  return <AdminUsersPanel initialAdmins={admins} />;
}
