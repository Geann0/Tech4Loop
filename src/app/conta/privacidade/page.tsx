import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import PrivacyManagement from "@/components/profile/PrivacyManagement";

export const metadata: Metadata = {
  title: "Gerenciar Meus Dados | Tech4Loop",
  description: "Gerencie seus dados pessoais conforme LGPD",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PrivacyPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">
              🔒 Privacidade e Dados Pessoais
            </h1>
            <p className="text-orange-100 mt-2">
              Gerencie seus dados conforme a Lei Geral de Proteção de Dados
              (LGPD)
            </p>
          </div>

          <div className="p-8">
            <PrivacyManagement userId={user.id} userEmail={user.email!} />
          </div>
        </div>
      </div>
    </div>
  );
}
