import { MailCheck } from "lucide-react";

import { AuthCard } from "@/components/app/auth-card";

export default function ConfirmePage() {
  return (
    <AuthCard title="Confirme seu e-mail">
      <div className="flex items-start gap-3 rounded-lg border border-hairline bg-panel-2 p-4">
        <MailCheck
          size={18}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0 text-brand"
          aria-hidden
        />
        <p className="text-[0.875rem] leading-relaxed text-fg-muted">
          Enviamos um link de confirmação. Abra o e-mail e clique no link para
          ativar a conta e entrar.
        </p>
      </div>
    </AuthCard>
  );
}
