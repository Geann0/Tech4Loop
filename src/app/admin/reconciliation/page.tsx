import ReconciliationDashboard from "@/components/admin/ReconciliationDashboard";

export const metadata = {
  title: "Reconciliação Financeira | Admin",
  description: "Dashboard de reconciliação entre pedidos, Mercado Pago e banco",
};

export default function ReconciliationPage() {
  return <ReconciliationDashboard />;
}
