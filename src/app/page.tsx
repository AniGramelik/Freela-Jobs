import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  MessageSquare,
  Radio,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { buttonClass } from "@/components/ui/button";

const EMPRESA = [
  {
    icon: Users,
    title: "Banco de talentos que fica com você",
    body: "Cadastre quem já trabalha com a sua empresa e convide para assumir o perfil. A base é sua.",
  },
  {
    icon: Radio,
    title: "Convocação em vez de corrente de WhatsApp",
    body: "Monte a chamada, dispare para a equipe certa e acompanhe o placar de vagas preenchendo ao vivo.",
  },
  {
    icon: CalendarClock,
    title: "Mural de vagas por diária, temporário ou fixo",
    body: "Publique a vaga, receba candidaturas e faça a triagem sem planilha.",
  },
  {
    icon: Search,
    title: "Rede local pesquisável",
    body: "Precisa de reforço fora da sua base? Busque profissionais da região por função.",
  },
];

const PROFISSIONAL = [
  {
    icon: ClipboardList,
    title: "Seu perfil é o seu currículo",
    body: "Garçom, eletricista, escriturário, o que for. Diga o que faz, sua formação e onde atende.",
  },
  {
    icon: CalendarClock,
    title: "Uma inscrição, muitas empresas",
    body: "Candidate-se às vagas do mural e receba convocações das empresas com quem você já tem vínculo.",
  },
  {
    icon: MessageSquare,
    title: "Converse pela plataforma",
    body: "Combine detalhes no chat. Seu e-mail aparece; o telefone só quando você liberar.",
  },
  {
    icon: ShieldCheck,
    title: "Sem controle de ponto",
    body: "Freelancer não bate cartão. Presença só é registrada quando você é convocado para um turno.",
  },
];

const PASSOS = [
  ["Crie a conta", "Empresa ou profissional — cada um com o seu cadastro."],
  ["Monte o perfil ou a vaga", "Serviços e disponibilidade, ou a chamada de trabalho."],
  ["Combine e trabalhe", "Candidatura, convocação e conversa até fechar o combinado."],
];

export default function Home() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Logo variant="full" size={24} />
        <nav className="flex items-center gap-2">
          <Link href="/entrar" className={buttonClass("ghost", "md")}>
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonClass("primary", "md")}>
            Criar conta
          </Link>
        </nav>
      </header>

      {/* Capa */}
      <section className="fj-grain relative overflow-hidden bg-brand-gradient text-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[0.8125rem] font-medium tracking-[0.14em] text-white/70 uppercase">
            Colatina e região · em breve, todo o Brasil
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.6rem] leading-[1.06] font-semibold tracking-[-0.025em] sm:text-[3.5rem]">
            Freelancers e empresas se encontram sem o grupo de WhatsApp.
          </h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85">
            Banco de talentos, mural de vagas por diária ou temporário,
            convocação com resposta em dois toques e conversa direta. De
            qualquer profissão, para qualquer negócio.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cadastro"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-white px-5 text-[0.9375rem] font-semibold text-ink shadow-md transition hover:brightness-95"
            >
              Criar conta da empresa
              <ArrowRight size={17} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/entrar"
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/35 px-5 text-[0.9375rem] font-medium text-white transition hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Dois públicos */}
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-2">
        {[
          { tag: "Para empresas", items: EMPRESA },
          { tag: "Para profissionais", items: PROFISSIONAL },
        ].map(({ tag, items }) => (
          <div
            key={tag}
            className="rounded-xl border border-hairline bg-panel p-6 shadow-sm sm:p-8"
          >
            <h2 className="font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-fg">
              {tag}
            </h2>
            <ul className="mt-5 space-y-5">
              {items.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <Icon size={17} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-semibold text-fg">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-[0.875rem] leading-relaxed text-fg-muted">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Como funciona */}
      <section className="border-y border-hairline bg-panel-2">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-[1.6rem] font-semibold tracking-[-0.02em] text-fg">
            Como funciona
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {PASSOS.map(([title, body], i) => (
              <li key={title} className="border-t-2 border-brand pt-4">
                <span className="font-display text-[1.75rem] font-semibold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-1 text-[0.9375rem] font-semibold text-fg">
                  {title}
                </p>
                <p className="mt-1 text-[0.875rem] leading-relaxed text-fg-muted">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:px-8">
        <h2 className="mx-auto max-w-xl font-display text-[1.9rem] leading-tight font-semibold tracking-[-0.02em] text-fg">
          Comece hoje. A primeira convocação leva um minuto.
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/cadastro" className={buttonClass("brand-gradient", "lg")}>
            Criar conta da empresa
          </Link>
          <Link href="/entrar" className={buttonClass("secondary", "lg")}>
            Entrar
          </Link>
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-[0.8125rem] text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo variant="full" size={18} />
          <p>Freela Jobs · organização e busca de trabalho · pt-BR</p>
        </div>
      </footer>
    </main>
  );
}
