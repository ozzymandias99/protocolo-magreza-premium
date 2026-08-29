import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import camilaPhoto from "../assets/camila-monteiro.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Protocolo Barriga Zero — Avaliação Personalizada" },
      {
        name: "description",
        content:
          "Faça uma avaliação rápida e descubra como o Protocolo Barriga Zero pode te ajudar a emagrecer com hábitos sustentáveis.",
      },
      { property: "og:title", content: "Protocolo Barriga Zero" },
      {
        property: "og:description",
        content: "Avaliação personalizada e plano para emagrecer com saúde.",
      },
    ],
  }),
  component: QuizPage,
});

const CHECKOUT_URL = "https://pay.kirvano.com/d313cfe1-5e29-4848-99d9-5d162fe818b8";
const CAMILA_IMG = camilaPhoto;

type Answers = {
  nome: string;
  sexo: string;
  idade: string;
  altura: string;
  peso: string;
  pesoDesejadoFaixa: string;
  quantoEmagrecer: string;
  dificuldade: string;
  jaTentou: string;
  identificacao: string;
  objetivo: string;
  autoestima: string;
  interesse: string;
};

const initialAnswers: Answers = {
  nome: "",
  sexo: "",
  idade: "",
  altura: "",
  peso: "",
  pesoDesejadoFaixa: "",
  quantoEmagrecer: "",
  dificuldade: "",
  jaTentou: "",
  identificacao: "",
  objetivo: "",
  autoestima: "",
  interesse: "",
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "";
}

function classifyIMC(imc: number) {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade Grau I";
  if (imc < 40) return "Obesidade Grau II";
  return "Obesidade Grau III";
}

/* ---------------- UI primitives ---------------- */

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={false}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

function Header({ progress }: { progress: number }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <span className="text-lg font-bold">B</span>
          </div>
          <h1 className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-foreground sm:text-base">
            Protocolo Barriga Zero
          </h1>
        </div>
        <ProgressBar value={progress} />
      </div>
    </header>
  );
}

function StepShell({
  children,
  k,
}: {
  children: React.ReactNode;
  k: string | number;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={k}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      {children}
    </h2>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm text-muted-foreground sm:text-base">{children}</p>;
}

function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-md transition hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {children}
    </button>
  );
}

function ChoiceCard({
  label,
  emoji,
  onClick,
  selected,
}: {
  label: string;
  emoji?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary hover:shadow-md sm:p-5 ${
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      }`}
    >
      {emoji && (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">
          {emoji}
        </span>
      )}
      <span className="flex-1 text-base font-medium text-foreground">{label}</span>
      <span className="text-primary opacity-0 transition group-hover:opacity-100">→</span>
    </motion.button>
  );
}

function Encouragement({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-6 text-center text-sm italic text-muted-foreground"
    >
      {text}
    </motion.p>
  );
}

/* ---------------- Quiz steps ---------------- */

function useTyping(text: string, speed = 22) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return out;
}

function QuestionName({ onNext, value, setValue }: {
  onNext: () => void;
  value: string;
  setValue: (v: string) => void;
}) {
  const typed = useTyping("Olá! Vamos começar sua avaliação personalizada.");
  return (
    <div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
        Bem-vinda
      </p>
      <Title>{typed}<span className="ml-0.5 inline-block h-6 w-0.5 animate-pulse bg-primary align-middle" /></Title>
      <Subtitle>Qual é o seu primeiro nome?</Subtitle>
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onNext();
        }}
      >
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Seu nome"
          className="h-12 flex-1 rounded-2xl border border-border bg-card px-4 text-base shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <PrimaryButton type="submit" disabled={!value.trim()}>
          Continuar
        </PrimaryButton>
      </form>
      <Encouragement text="Sua resposta é confidencial e usada apenas nessa avaliação." />
    </div>
  );
}

function NumericQuestion({
  title,
  subtitle,
  suffix,
  value,
  setValue,
  onNext,
  encouragement,
  min,
  max,
}: {
  title: string;
  subtitle?: string;
  suffix?: string;
  value: string;
  setValue: (v: string) => void;
  onNext: () => void;
  encouragement?: string;
  min?: number;
  max?: number;
}) {
  const valid = value !== "" && !Number.isNaN(Number(value)) &&
    (min === undefined || Number(value) >= min) &&
    (max === undefined || Number(value) <= max);
  return (
    <div>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onNext();
        }}
      >
        <div className="relative flex-1">
          <input
            autoFocus
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
            className="h-12 w-full rounded-2xl border border-border bg-card px-4 pr-16 text-base shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {suffix && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
        <PrimaryButton type="submit" disabled={!valid}>
          Continuar
        </PrimaryButton>
      </form>
      {encouragement && <Encouragement text={encouragement} />}
    </div>
  );
}

function ChoiceQuestion({
  title,
  subtitle,
  options,
  value,
  onSelect,
  encouragement,
}: {
  title: string;
  subtitle?: string;
  options: { label: string; emoji?: string }[];
  value: string;
  onSelect: (v: string) => void;
  encouragement?: string;
}) {
  return (
    <div>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <ChoiceCard
            key={o.label}
            label={o.label}
            emoji={o.emoji}
            selected={value === o.label}
            onClick={() => onSelect(o.label)}
          />
        ))}
      </div>
      {encouragement && <Encouragement text={encouragement} />}
    </div>
  );
}

/* ---------------- Processing ---------------- */

function Processing({ onDone }: { onDone: () => void }) {
  const steps = [
    "Calculando seu IMC",
    "Avaliando seu perfil",
    "Comparando suas respostas",
    "Gerando sua análise personalizada",
    "Preparando sua recomendação",
  ];
  const [done, setDone] = useState<number>(0);

  useEffect(() => {
    const each = 1600;
    const timers = steps.map((_, i) =>
      setTimeout(() => setDone((d) => Math.max(d, i + 1)), (i + 1) * each),
    );
    const final = setTimeout(onDone, steps.length * each + 200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(final);
    };
  }, [onDone]);

  return (
    <div>
      <Title>Analisando suas respostas…</Title>
      <Subtitle>Aguarde alguns instantes enquanto montamos sua avaliação.</Subtitle>
      <div className="mt-6">
        <ProgressBar value={(done / steps.length) * 100} />
      </div>
      <ul className="mt-8 space-y-3">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition ${
              i < done ? "opacity-100" : "opacity-50"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-primary-foreground ${
                i < done ? "bg-primary" : "bg-muted"
              }`}
            >
              {i < done ? "✓" : i + 1}
            </span>
            <span className="text-sm font-medium text-foreground">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Result + Offer ---------------- */

function ResultAndOffer({ a }: { a: Answers }) {
  const nome = firstName(a.nome) || "Você";
  const heightM = Number(a.altura) / 100;
  const weight = Number(a.peso);
  const imc = heightM > 0 ? weight / (heightM * heightM) : 0;
  const classification = classifyIMC(imc);

  const targetMid: Record<string, number> = {
    "Até 50 kg": 50,
    "50–60 kg": 55,
    "60–70 kg": 65,
    "70–80 kg": 75,
    "80–90 kg": 85,
    "Mais de 90 kg": 95,
  };
  const target = targetMid[a.pesoDesejadoFaixa] ?? weight;
  const totalDiff = Math.max(1, weight - target);
  const goalPct = Math.min(100, Math.max(0, (totalDiff / weight) * 100));

  return (
    <div className="space-y-12">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Avaliação concluída
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {nome}, sua análise ficou pronta.
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Peso atual" value={`${weight || "-"} kg`} />
          <Stat label="Altura" value={`${a.altura || "-"} cm`} />
          <Stat label="Meta" value={a.pesoDesejadoFaixa || "-"} />
          <Stat label="IMC" value={imc ? imc.toFixed(1) : "-"} highlight />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[200px_1fr]">
          <IMCDial imc={imc} />
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-primary">Classificação</p>
            <p className="text-xl font-bold">{classification}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Com base nas suas respostas, percebemos que sua principal dificuldade está
              relacionada a <strong>{a.dificuldade?.toLowerCase() || "manter constância"}</strong>{" "}
              e à manutenção dos resultados. Esse é um desafio comum e pode ser trabalhado
              com um plano adaptado à sua rotina.
            </p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progresso até sua meta</span>
                <span>{goalPct.toFixed(0)}%</span>
              </div>
              <ProgressBar value={goalPct} />
            </div>
          </div>
        </div>

        <p className="mt-6 text-base text-foreground">
          Quanto antes você iniciar mudanças consistentes nos seus hábitos, maiores tendem
          a ser os benefícios para sua saúde e qualidade de vida.
        </p>
        <p className="mt-2 text-base font-semibold text-primary">
          A boa notícia é que existe um caminho mais simples.
        </p>
      </section>

      <section className="text-center">
        <a
          href={CHECKOUT_URL}
          className="inline-flex h-14 w-full max-w-xl items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold uppercase tracking-wide text-primary-foreground shadow-xl transition hover:scale-[1.02]"
        >
          Quero começar minha transformação
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Pagamento seguro • Acesso imediato • Compra protegida
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        highlight ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function IMCDial({ imc }: { imc: number }) {
  const pct = Math.min(100, (imc / 40) * 100);
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="grid place-items-center rounded-2xl border border-border bg-card p-4 shadow-sm">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="oklch(0.95 0.02 152)" strokeWidth="14" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="oklch(0.72 0.17 152)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform="rotate(-90 90 90)"
        />
        <text x="90" y="86" textAnchor="middle" className="fill-foreground" fontSize="28" fontWeight="700">
          {imc ? imc.toFixed(1) : "-"}
        </text>
        <text x="90" y="108" textAnchor="middle" className="fill-muted-foreground" fontSize="12">
          IMC
        </text>
      </svg>
    </div>
  );
}

/* ---------------- Sales page sections ---------------- */

const testimonials = [
  {
    name: "Fernanda Rocha",
    age: "29 anos",
    time: "1 ano no Protocolo Barriga Zero",
    text: "Eu vivia começando dieta e parando na primeira semana. Com o protocolo consegui manter a rotina e já estou vendo muita diferença. Valeu muito a pena.",
    image: "https://glavcom.ua/img/gallery/6807/94/725928_big.jpg",
  },
  {
    name: "Carlos Henrique Lima",
    age: "25 anos",
    time: "5 meses no Protocolo Barriga Zero",
    text: "No começo achei que não ia funcionar pra mim, mas resolvi tentar. Hoje tenho mais disposição e consegui perder peso sem sofrimento.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9airsLKfiag1o5gCllCEB1p80Wz2VzKZHkWMBrpahZQ&s=10",
  },
  {
    name: "Mariana Souza",
    age: "36 anos",
    time: "9 meses no Protocolo Barriga Zero",
    text: "Não acreditava mais que ia conseguir emagrecer, mas fui seguindo aos poucos e deu certo. Hoje me sinto outra pessoa e muito mais feliz.",
    image: "https://n1s1.hsmedia.ru/16/3d/e7/163de7746bc012ad999111ca7dacae67/611x600_1_63eb0a5a729f4cdc15d5c89c1c981aa6@1106x1086_0xalPjHBD9_9909666963721755398.png.webp",
  },
  {
    name: "Juliana Ferreira",
    age: "46 anos",
    time: "7 meses no Protocolo Barriga Zero",
    text: "Achei que ia desistir igual das outras vezes, mas esse método ficou fácil de seguir. Estou bem mais animada comigo mesma.",
    image: "https://tse3.mm.bing.net/th/id/OIP.E0oEFtt5hRjqplKTsejbCwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
];

function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Histórias reais</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Quem aplicou o método, sentiu a diferença
        </h2>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center"
          >
            <img
              src={testimonials[index].image}
              alt={`Foto de ${testimonials[index].name}`}
              className="h-40 w-52 rounded-2xl border-4 border-primary/20 object-cover object-top shadow-md sm:h-44 sm:w-60"
            />
            <blockquote className="mt-5 max-w-xl text-base italic leading-relaxed text-foreground sm:text-lg">
              “{testimonials[index].text}”
            </blockquote>
            <p className="mt-4 text-sm font-bold text-foreground">
              {testimonials[index].name}, {testimonials[index].age}
            </p>
            <p className="text-xs text-muted-foreground">{testimonials[index].time}</p>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prev}
          aria-label="Depoimento anterior"
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-secondary"
        >
          ←
        </button>
        <button
          onClick={next}
          aria-label="Próximo depoimento"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:bg-secondary"
        >
          →
        </button>

        <div className="mt-6 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ver depoimento ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Specialist() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        <div className="grid gap-6 p-6 sm:grid-cols-[260px_1fr] sm:p-10">
          <div className="mx-auto w-full max-w-[260px] sm:mx-0">
            <img
              src={CAMILA_IMG}
              alt="Camila Monteiro"
              className="aspect-[3/4] w-full rounded-2xl object-cover object-top shadow-md"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Quem desenvolveu</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Camila Monteiro</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Especialista em Emagrecimento e Hábitos Saudáveis
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              O Protocolo Barriga Zero foi desenvolvido para quem quer sair do ciclo de dietas restritivas
              e finalmente encontrar um método simples, baseado em alimentação de verdade e hábitos
              sustentáveis. Depois de anos acompanhando mulheres e homens que se sentiam presos ao efeito
              sanfona, Camila criou um passo a passo prático que respeita o corpo, a rotina e a realidade
              de cada pessoa.
            </p>
            <p className="mt-3 text-base leading-relaxed text-foreground">
              O foco não é apenas emagrecer. É reconstruir a relação com a comida, recuperar a energia
              e devolver a autoestima — sem depender de willpower o tempo todo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionPresentation() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">O método</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Um protocolo pensado para quem já tentou de tudo
        </h2>
      </div>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
        <p>
          O <strong>Protocolo Barriga Zero</strong> é um método completo de emagrecimento que une
          alimentação estratégica, organização da rotina e ajuste de hábitos para quem quer perder
          peso de forma definitiva, sem passar fome e sem viver em cima de uma balança.
        </p>
        <p>
          A proposta é simples: em vez de imposições extremas, você recebe um passo a passo claro
          para reeducar a alimentação, entender seus gatilhos e manter a constância no dia a dia.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { title: "Sem dietas malucas", text: "Cardápios e orientações baseados em comida de verdade." },
          { title: "Foco na rotina", text: "Estratégias que cabem na correria do dia a dia." },
          { title: "Mudança de hábitos", text: "Você aprende a manter o resultado a longo prazo." },
          { title: "Acesso imediato", text: "Comece a aplicar o método hoje mesmo, no seu ritmo." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-bold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Avaliação personalizada", text: "Responda o quiz e entenda o seu perfil, dificuldades e objetivos." },
    { title: "Acesso ao protocolo", text: "Receba o material completo com orientações práticas e diretas." },
    { title: "Aplicação no dia a dia", text: "Comece a colocar os hábitos em prática sem complicar sua rotina." },
    { title: "Acompanhamento da evolução", text: "Siga os check-ins e ajustes para manter a constância e acelerar resultados." },
  ];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como funciona</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Quatro passos para transformar seu corpo</h2>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <div key={s.title} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="absolute -top-3 -left-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              {i + 1}
            </span>
            <h3 className="mt-2 font-bold text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Includes() {
  const items = [
    "Guia completo do Protocolo Barriga Zero",
    "Planejamento alimentar estratégico",
    "Lista de compras prática",
    "Receitas simples e rápidas",
    "Planner de acompanhamento semanal",
    "Bônus: protocolo de quebra de platô",
    "Acesso vitalício ao material",
    "Suporte por e-mail por 7 dias",
  ];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">O que você recebe</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tudo que você precisa para começar</h2>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-10">
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                ✓
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="rounded-3xl border border-gold/60 bg-gold-soft p-6 text-center shadow-lg sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-3xl font-bold text-gold-foreground">
          7
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-gold-foreground sm:text-3xl">
          Garantia incondicional de 7 dias
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gold-foreground/80">
          Você tem 7 dias para acessar o Protocolo Barriga Zero, aplicar o método e ver se faz sentido
          para você. Se por qualquer motivo não gostar, devolvemos 100% do seu dinheiro. Simples assim.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs = [
    {
      q: "O Protocolo Barriga Zero serve para quem já tentou várias dietas?",
      a: "Sim. O método foi criado justamente para quem já passou por dietas restritivas e quer encontrar uma forma sustentável de emagrecer sem sofrimento.",
    },
    {
      q: "Preciso fazer academia para ter resultados?",
      a: "Não é obrigatório, mas a prática de atividade física é recomendada para acelerar a perda de peso, melhorar a saúde e ajudar a manter os resultados a longo prazo.",
    },
    {
      q: "Em quanto tempo eu vejo resultados?",
      a: "Os resultados variam de pessoa para pessoa, dependendo da rotina, constância e metabolismo. Muitos começam a sentir diferença já nas primeiras semanas.",
    },
    {
      q: "O acesso é imediato?",
      a: "Sim. Assim que o pagamento for confirmado, você recebe o acesso completo ao material no seu e-mail.",
    },
    {
      q: "E se eu tiver dúvidas durante a aplicação?",
      a: "Você conta com suporte por e-mail por 7 dias para tirar dúvidas sobre a aplicação do protocolo.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Dúvidas</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
      </div>

      <div className="mt-8 space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="pr-4 font-semibold text-foreground">{f.q}</span>
              <span className="shrink-0 text-primary">{open === i ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalOffer() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 pb-16 text-center sm:py-14 sm:pb-20">
      <div className="rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-[0_20px_60px_-32px_var(--primary)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Oferta especial</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Comece sua transformação hoje
        </h2>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <span className="text-2xl font-semibold text-muted-foreground line-through sm:text-3xl">
            R$ 180,00
          </span>
          <span className="text-4xl font-black tracking-tight text-primary sm:text-5xl">
            R$ 37,90
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">Pagamento único • Acesso vitalício</p>

        <a
          href={CHECKOUT_URL}
          className="mt-8 inline-flex h-14 w-full max-w-xl items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold uppercase tracking-wide text-primary-foreground shadow-xl transition hover:scale-[1.02]"
        >
          Quero começar minha transformação
        </a>

        <p className="mt-4 text-xs text-muted-foreground">
          Pagamento seguro • Acesso imediato • Garantia de 7 dias
        </p>
      </div>
    </section>
  );
}

/* ---------------- Main page ---------------- */

type Phase = "quiz" | "processing" | "result";

function QuizPage() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("quiz");

  const nome = firstName(answers.nome);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setAnswers((prev) => ({ ...prev, [k]: v }));

  const next = () => setStep((s) => s + 1);
  const advance = <K extends keyof Answers>(k: K) => (v: Answers[K]) => {
    set(k, v);
    setTimeout(next, 220);
  };

  const totalSteps = 13;
  const progress = useMemo(() => {
    if (phase === "quiz") return (step / totalSteps) * 100;
    if (phase === "processing") return 100;
    return 100;
  }, [step, phase]);

  const steps = [
    <QuestionName
      key="q1"
      value={answers.nome}
      setValue={(v) => set("nome", v)}
      onNext={next}
    />,
    <ChoiceQuestion
      key="q2"
      title={nome ? `Perfeito, ${nome}. Qual é o seu sexo?` : "Qual é o seu sexo?"}
      subtitle="Isso ajuda a personalizar sua avaliação."
      value={answers.sexo}
      onSelect={advance("sexo")}
      options={[
        { label: "Feminino", emoji: "👩" },
        { label: "Masculino", emoji: "👨" },
      ]}
      encouragement="Você não está sozinha. Vamos juntas."
    />,
    <NumericQuestion
      key="q3"
      title="Qual a sua idade?"
      value={answers.idade}
      setValue={(v) => set("idade", v)}
      onNext={next}
      min={10}
      max={100}
      suffix="anos"
    />,
    <NumericQuestion
      key="q4"
      title="Qual a sua altura?"
      subtitle="Em centímetros, ex: 170"
      value={answers.altura}
      setValue={(v) => set("altura", v)}
      onNext={next}
      min={100}
      max={230}
      suffix="cm"
    />,
    <NumericQuestion
      key="q5"
      title="Qual o seu peso atual?"
      value={answers.peso}
      setValue={(v) => set("peso", v)}
      onNext={next}
      min={30}
      max={300}
      suffix="kg"
      encouragement="Essa dificuldade é muito comum. Continue."
    />,
    <ChoiceQuestion
      key="q6"
      title="Qual peso você deseja atingir?"
      value={answers.pesoDesejadoFaixa}
      onSelect={advance("pesoDesejadoFaixa")}
      options={[
        { label: "Até 50 kg", emoji: "🪶" },
        { label: "50–60 kg", emoji: "🌿" },
        { label: "60–70 kg", emoji: "🍃" },
        { label: "70–80 kg", emoji: "✨" },
        { label: "80–90 kg", emoji: "💫" },
        { label: "Mais de 90 kg", emoji: "🌟" },
      ]}
    />,
    <ChoiceQuestion
      key="q7"
      title="Quanto você deseja emagrecer?"
      value={answers.quantoEmagrecer}
      onSelect={advance("quantoEmagrecer")}
      options={[
        { label: "Até 5 kg" },
        { label: "5–10 kg" },
        { label: "10–20 kg" },
        { label: "Mais de 20 kg" },
      ]}
    />,
    <ChoiceQuestion
      key="q8"
      title="Qual a sua maior dificuldade?"
      value={answers.dificuldade}
      onSelect={advance("dificuldade")}
      options={[
        { label: "Não consigo controlar minha alimentação", emoji: "🍕" },
        { label: "Compulsão por doces", emoji: "🍫" },
        { label: "Ansiedade", emoji: "😩" },
        { label: "Falta de energia", emoji: "😴" },
        { label: "Falta de tempo", emoji: "⏰" },
        { label: "Sempre recupero o peso", emoji: "⚠️" },
      ]}
      encouragement={nome ? `${nome}, isso é mais comum do que parece.` : undefined}
    />,
    <ChoiceQuestion
      key="q9"
      title="Você já tentou emagrecer antes?"
      value={answers.jaTentou}
      onSelect={advance("jaTentou")}
      options={[
        { label: "Nunca tentei" },
        { label: "Dieta" },
        { label: "Academia" },
        { label: "Jejum" },
        { label: "Nutricionista" },
        { label: "Remédios" },
        { label: "Já tentei várias vezes" },
      ]}
    />,
    <ChoiceQuestion
      key="q10"
      title="Com qual dessas situações você mais se identifica?"
      value={answers.identificacao}
      onSelect={advance("identificacao")}
      options={[
        { label: "Começo dieta toda segunda." },
        { label: "Emagreço e recupero tudo." },
        { label: "Desisto rapidamente." },
        { label: "Não sei por onde começar." },
      ]}
    />,
    <ChoiceQuestion
      key="q11"
      title="Como você gostaria de estar daqui alguns meses?"
      value={answers.objetivo}
      onSelect={advance("objetivo")}
      options={[
        { label: "Mais confiante", emoji: "😊" },
        { label: "Vestindo roupas que gosto", emoji: "👗" },
        { label: "Aproveitando praia sem vergonha", emoji: "🏖" },
        { label: "Melhorando minha saúde", emoji: "❤️" },
        { label: "Com mais disposição", emoji: "💪" },
      ]}
      encouragement="Estamos quase terminando."
    />,
    <ChoiceQuestion
      key="q12"
      title="Quanto essa situação afeta sua autoestima?"
      value={answers.autoestima}
      onSelect={advance("autoestima")}
      options={[
        { label: "Nada", emoji: "😄" },
        { label: "Pouco", emoji: "🙂" },
        { label: "Médio", emoji: "😕" },
        { label: "Muito", emoji: "😟" },
        { label: "Demais", emoji: "😢" },
      ]}
    />,
    <ChoiceQuestion
      key="q13"
      title="Se existisse um método simples, baseado em alimentação saudável e hábitos sustentáveis, você gostaria de conhecer?"
      value={answers.interesse}
      onSelect={(v) => {
        set("interesse", v);
        setTimeout(() => setPhase("processing"), 220);
      }}
      options={[
        { label: "Sim", emoji: "✅" },
        { label: "Com certeza", emoji: "💚" },
        { label: "Quero conhecer", emoji: "👀" },
      ]}
    />,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header progress={progress} />
      <main>
        {phase === "quiz" && <StepShell k={step}>{steps[step]}</StepShell>}
        {phase === "processing" && (
          <StepShell k="processing">
            <Processing onDone={() => setPhase("result")} />
          </StepShell>
        )}
        {phase === "result" && (
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
            <ResultAndOffer a={answers} />
            <TestimonialsCarousel />
            <Specialist />
            <SolutionPresentation />
            <HowItWorks />
            <Includes />
            <Guarantee />
            <FAQ />
            <FinalOffer />
          </div>
        )}
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Protocolo Barriga Zero
      </footer>
    </div>
  );
}
