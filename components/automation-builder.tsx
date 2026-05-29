"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CalendarClock,
  ChevronDown,
  Download,
  MessageCircle,
  Radio,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const posts = [
  { id: "1791", title: "5 Projects Every Web Developer Should Build", selected: true },
  { id: "1792", title: "5 Best Youtube Channels For Fullstack", selected: false },
  { id: "1793", title: "5 AI Projects = Instant Recruiter Attention", selected: false },
  { id: "1794", title: "These 5 Projects = Stronger Resume", selected: false },
];

function RadioCard({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-16 items-center gap-4 rounded-md border bg-white px-6 text-left text-lg font-semibold text-[#061155] transition",
        active ? "border-primary ring-1 ring-primary/20" : "border-[#d4dbfa] hover:border-primary/60",
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-full border-[3px]",
          active ? "border-primary" : "border-[#bfc8ef]",
        )}
      >
        {active ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      </span>
      {label}
    </button>
  );
}

function Section({
  title,
  description,
  icon,
  enabled,
  onEnabledChange,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  enabled?: boolean;
  onEnabledChange?: (value: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-t border-dotted border-[#d7ddf5] py-7 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="text-xl font-extrabold text-[#061155]">{title}</h2>
            {description ? <p className="mt-2 text-lg font-medium text-[#6872ad]">{description}</p> : null}
          </div>
        </div>
        {typeof enabled === "boolean" ? <Switch checked={enabled} onCheckedChange={onEnabledChange} /> : null}
      </div>
      {children}
    </section>
  );
}

function PostCard({ title, selected }: { title: string; selected: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative h-[300px] overflow-hidden rounded-md border bg-[#0f172a] text-left shadow-sm transition hover:-translate-y-0.5",
        selected ? "border-primary ring-2 ring-primary" : "border-transparent",
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(255,255,255,.45),transparent_20%),linear-gradient(160deg,#102d5b,#7e8ca3_45%,#181625_46%,#101010)]" />
      <div className="absolute bottom-0 left-0 h-36 w-32 rounded-tr-full bg-[#161616]" />
      <div className="absolute bottom-5 left-10 h-20 w-24 rounded-t-full bg-[#111]" />
      <div className="absolute inset-x-3 top-12 rounded bg-black/20 p-2 text-center text-[16px] font-black leading-tight text-white drop-shadow">
        <span className="text-yellow-300">{title.split(" ").slice(0, 2).join(" ")}</span>{" "}
        {title.split(" ").slice(2).join(" ")}
      </div>
    </button>
  );
}

export function AutomationBuilder() {
  const [postMode, setPostMode] = useState<"all" | "specific">("specific");
  const [commentType, setCommentType] = useState<"all" | "keywords">("all");
  const [dmEnabled, setDmEnabled] = useState(true);
  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [replyEnabled, setReplyEnabled] = useState(true);
  const [advancedEnabled, setAdvancedEnabled] = useState(false);
  const [dmMessage, setDmMessage] = useState("Here's the resource/link you asking for!\nAccess it below 👇");

  const characterCount = useMemo(() => dmMessage.length, [dmMessage]);

  return (
    <main className="min-h-screen bg-[#f3f5ff]">
      <div className="mx-auto grid max-w-[1220px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
        <div>
          <header className="mb-6 flex items-center gap-5">
            <Button variant="ghost" size="icon" aria-label="Back">
              <ArrowLeft className="h-8 w-8 text-[#061155]" />
            </Button>
            <div className="grid h-[60px] w-[60px] place-items-center rounded-md bg-[#df0bca] text-white">
              <MessageCircle className="h-8 w-8 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold uppercase text-[#061155]">Reply to Comments</h1>
              <p className="text-xl font-medium text-[#6872ad]">Automatically reply to post or reel comments</p>
            </div>
          </header>

          <Card className="mb-6 border-[#ccd5f2] bg-white p-7 shadow-none">
            <Section title="Set up Agent Reply" icon={<Wand2 className="h-8 w-8 text-[#061155]" />}>
              <div className="space-y-8">
                <div>
                  <Label>Name</Label>
                  <p className="mt-2 text-lg font-medium text-[#6872ad]">Give your automation a name</p>
                  <Input className="mt-2" defaultValue="Reply to Comments 2" />
                </div>

                <div className="border-t border-dotted border-[#d7ddf5] pt-7">
                  <Label>Select Instagram Post</Label>
                  <p className="mt-2 text-lg font-medium text-[#6872ad]">
                    Respond to comments under all posts or selected posts
                  </p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <RadioCard active={postMode === "all"} label="All posts" onClick={() => setPostMode("all")} />
                    <RadioCard
                      active={postMode === "specific"}
                      label="Specific posts"
                      onClick={() => setPostMode("specific")}
                    />
                  </div>
                  {postMode === "specific" ? (
                    <>
                      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
                        {posts.map((post) => (
                          <PostCard key={post.id} title={post.title} selected={post.selected} />
                        ))}
                      </div>
                      <button className="mt-5 text-lg font-bold text-primary" type="button">
                        Show all posts
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="border-t border-dotted border-[#d7ddf5] pt-7">
                  <Label>Select Comment Type</Label>
                  <p className="mt-2 text-lg font-medium text-[#6872ad]">
                    Respond to all comments or comments with keywords
                  </p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
                    <RadioCard active={commentType === "all"} label="All comments" onClick={() => setCommentType("all")} />
                    <RadioCard
                      active={commentType === "keywords"}
                      label="Comments with keywords"
                      onClick={() => setCommentType("keywords")}
                    />
                  </div>
                  {commentType === "keywords" ? (
                    <Input className="mt-4" placeholder="pricing, guide, link, access" />
                  ) : null}
                </div>
              </div>
            </Section>

            <Section
              title="Reply with DM"
              description="Reply to post comments with DMs"
              enabled={dmEnabled}
              onEnabledChange={setDmEnabled}
            >
              <div className={cn("space-y-5", !dmEnabled && "pointer-events-none opacity-50")}>
                <button
                  type="button"
                  className="flex h-[60px] w-full items-center justify-between rounded-md border border-[#cbd3f5] bg-white px-5 text-lg font-bold text-[#061155]"
                >
                  <span className="flex items-center gap-4">
                    <Bot className="h-7 w-7" />
                    Say Exactly
                  </span>
                  <ChevronDown className="h-5 w-5 text-[#6872ad]" />
                </button>
                <div className="relative">
                  <Textarea value={dmMessage} onChange={(event) => setDmMessage(event.target.value)} maxLength={1000} />
                  <span className="absolute bottom-4 right-5 text-lg font-semibold text-[#939acd]">
                    {characterCount}/1000
                  </span>
                </div>
              </div>
            </Section>

            <Section
              title="Show Button"
              description="Add a button to DMs"
              enabled={buttonEnabled}
              onEnabledChange={setButtonEnabled}
            >
              <div className={cn("space-y-7", !buttonEnabled && "pointer-events-none opacity-50")}>
                <div>
                  <Label>Button Text</Label>
                  <Input className="mt-4" defaultValue="Access Now" />
                </div>
                <div>
                  <Label>Button URL</Label>
                  <Input className="mt-4" defaultValue="https://drive.google.com/file/d/example/view?usp=drive_link" />
                </div>
              </div>
            </Section>

            <Section
              title="Reply with Comment"
              description="Respond to post comments with reply comments"
              enabled={replyEnabled}
              onEnabledChange={setReplyEnabled}
            >
              <div className={cn("relative", !replyEnabled && "pointer-events-none opacity-50")}>
                <Input defaultValue="Thanks for your comment! Check your DM 👋" />
                <Sparkles className="absolute right-5 top-4 h-7 w-7 text-[#623df2]" />
              </div>
            </Section>
          </Card>

          <Card className="border-[#ccd5f2] bg-white p-7 shadow-none">
            <Section
              title="Advanced Settings"
              icon={<Settings className="h-8 w-8 text-black" />}
              enabled={advancedEnabled}
              onEnabledChange={setAdvancedEnabled}
            >
              <div className={cn("grid gap-5 md:grid-cols-2", !advancedEnabled && "opacity-60")}>
                <Input defaultValue="09:00-18:00" aria-label="Response hours" />
                <Input defaultValue="500" aria-label="Daily DM limit" />
                <Input defaultValue="1440" aria-label="Cooldown minutes" />
                <Input defaultValue="spam, scam, fake" aria-label="Blacklist keywords" />
              </div>
            </Section>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
          <Card className="border-[#ccd5f2] bg-white p-5 shadow-none">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#061155]">Performance</h2>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Comments", "12.4k"],
                ["DMs sent", "9.8k"],
                ["CTR", "42%"],
                ["Leads", "1,284"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border bg-[#f8f9ff] p-3">
                  <p className="text-xs font-bold uppercase text-[#6872ad]">{label}</p>
                  <p className="mt-1 text-xl font-black text-[#061155]">{value}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-[#ccd5f2] bg-white p-5 shadow-none">
            <h2 className="mb-4 text-lg font-extrabold text-[#061155]">Automation Guardrails</h2>
            <div className="space-y-3 text-sm font-semibold text-[#6872ad]">
              <p className="flex items-center gap-2"><Radio className="h-4 w-4 text-primary" /> Webhook signature validation</p>
              <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Response hours and cooldowns</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Multi-account workspaces</p>
              <p className="flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> CSV-ready logs and analytics</p>
            </div>
          </Card>
          <Button className="w-full" size="default">
            Save Automation
          </Button>
          <Button className="fixed bottom-6 right-6 hidden h-14 rounded-lg bg-[#07145f] px-6 text-lg font-bold text-white shadow-lg lg:inline-flex">
            <MessageCircle className="h-6 w-6" /> Give Feedback
          </Button>
        </aside>
      </div>
    </main>
  );
}
