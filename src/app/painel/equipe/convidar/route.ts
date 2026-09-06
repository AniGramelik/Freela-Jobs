import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";
import { sendInvite } from "@/use-cases/invites";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { company } = await requireCompanyContext();
  const form = await request.formData();
  const professionalProfileId = String(form.get("professionalProfileId") ?? "");

  const result = await sendInvite(prisma, {
    companyId: company.id,
    professionalProfileId,
  });

  const url = new URL("/painel/equipe", request.nextUrl.origin);
  if (!result.ok) url.searchParams.set("convite", result.error);
  else url.searchParams.set("convite", "enviado");
  return NextResponse.redirect(url, { status: 303 });
}
