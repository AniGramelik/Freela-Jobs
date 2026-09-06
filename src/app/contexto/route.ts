import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { PrismaAuditRecorder } from "@/use-cases/audit.prisma";
import { setActiveCompany, toActor } from "@/use-cases/company-context";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const base = request.nextUrl.origin;
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/entrar", base));

  const form = await request.formData();
  const companyId = String(form.get("companyId") ?? "");

  await setActiveCompany(prisma, new PrismaAuditRecorder(), {
    actor: toActor({
      id: user.id,
      memberships: user.companies.map((c) => ({
        companyId: c.id,
        role: c.role,
      })),
    }),
    sessionId: user.sessionId,
    requestedCompanyId: companyId,
  });

  const back = request.headers.get("referer");
  return NextResponse.redirect(new URL(back ?? "/painel", base), {
    status: 303,
  });
}
