import { SafetyVerification } from "@/components/safety-verification";
import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export function SafetyVerificationPage() {
  const { data: user, refetch } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <SafetyVerification 
          user={user} 
          onVerificationUpdate={() => refetch()}
        />
      </div>
    </Layout>
  );
}