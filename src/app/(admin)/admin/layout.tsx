import AdminBreadcrumb from "@/components/admin/admin-breadcrumb";

export default function AdminRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-3">
      <AdminBreadcrumb />
      {children}
    </div>
  );
}