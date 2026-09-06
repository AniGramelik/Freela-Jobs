import { Prisma, type PrismaClient } from "@prisma/client";

import {
  EMAIL_VERIFICATION_TTL_MS,
  isExpired,
  isValidEmail,
  MAGIC_LINK_TTL_MS,
  normalizeEmail,
  validatePassword,
} from "@/domain/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { generateToken, hashToken } from "@/lib/tokens";
import { err, ok, type Result } from "@/domain/index";

import { enqueueOutbox } from "./outbox";
import type { OutboundNotification } from "./notifier";

const authEmail = (
  recipient: string,
  template: string,
  data: Record<string, unknown>,
): OutboundNotification => ({
  recipient,
  channel: "EMAIL",
  category: "auth",
  template,
  data,
});

// --- Cadastro ---

export type SignUpError =
  | "invalid_email"
  | "weak_password"
  | "email_taken";

export async function signUpCompany(
  db: PrismaClient,
  input: {
    email: string;
    password: string;
    companyName: string;
    now?: Date;
  },
): Promise<
  Result<{ userId: string; companyId: string; verificationToken: string }, SignUpError>
> {
  const now = input.now ?? new Date();
  const email = normalizeEmail(input.email);

  if (!isValidEmail(email)) return err("invalid_email");
  if (!validatePassword(input.password).ok) return err("weak_password");
  if (await db.user.findUnique({ where: { email } })) return err("email_taken");

  const passwordHash = await hashPassword(input.password);
  const verificationToken = generateToken();

  try {
    const { userId, companyId } = await db.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, passwordHash } });
      const company = await tx.company.create({
        data: { name: input.companyName.trim() || "Minha empresa" },
      });
      await tx.companyMembership.create({
        data: { userId: user.id, companyId: company.id, role: "OWNER" },
      });
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(verificationToken),
          expiresAt: new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS),
        },
      });
      await enqueueOutbox(tx, {
        topic: "notification",
        dedupeKey: `email-verify:${user.id}`,
        payload: {
          subjectId: user.id,
          notifications: [
            authEmail(email, "email_verification", {
              token: verificationToken,
            }),
          ],
        },
      });
      return { userId: user.id, companyId: company.id };
    });
    return ok({ userId, companyId, verificationToken });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return err("email_taken");
    }
    throw error;
  }
}

// --- Verificação de e-mail ---

export async function verifyEmail(
  db: PrismaClient,
  input: { token: string; now?: Date },
): Promise<Result<{ userId: string }, "invalid" | "expired">> {
  const now = input.now ?? new Date();
  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });
  if (!record || record.usedAt) return err("invalid");
  if (isExpired(record.expiresAt, now)) return err("expired");

  await db.$transaction([
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: now },
    }),
  ]);
  return ok({ userId: record.userId });
}

// --- Login por senha ---

export async function logInWithPassword(
  db: PrismaClient,
  input: { email: string; password: string },
): Promise<
  Result<{ userId: string }, "invalid_credentials" | "email_not_verified">
> {
  const email = normalizeEmail(input.email);
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return err("invalid_credentials");
  if (!(await verifyPassword(user.passwordHash, input.password))) {
    return err("invalid_credentials");
  }
  if (!user.emailVerifiedAt) return err("email_not_verified");
  return ok({ userId: user.id });
}

// --- Magic link ---

export async function requestMagicLink(
  db: PrismaClient,
  input: { email: string; now?: Date },
): Promise<Result<{ token: string }, "invalid_email">> {
  const now = input.now ?? new Date();
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) return err("invalid_email");

  const token = generateToken();
  await db.magicLinkToken.create({
    data: {
      email,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + MAGIC_LINK_TTL_MS),
    },
  });
  await enqueueOutbox(db, {
    topic: "notification",
    dedupeKey: `magic-link:${hashToken(token)}`,
    payload: {
      subjectId: email,
      notifications: [authEmail(email, "magic_link", { token })],
    },
  });
  return ok({ token });
}

export async function consumeMagicLink(
  db: PrismaClient,
  input: { token: string; now?: Date },
): Promise<Result<{ userId: string }, "invalid" | "expired" | "no_account">> {
  const now = input.now ?? new Date();
  const record = await db.magicLinkToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });
  if (!record || record.usedAt) return err("invalid");
  if (isExpired(record.expiresAt, now)) return err("expired");

  const user = await db.user.findUnique({ where: { email: record.email } });
  await db.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: now },
  });
  if (!user) return err("no_account");

  // Magic link também confirma posse do e-mail.
  if (!user.emailVerifiedAt) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: now },
    });
  }
  return ok({ userId: user.id });
}
