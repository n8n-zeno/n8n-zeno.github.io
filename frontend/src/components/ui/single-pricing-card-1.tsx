import React from "react";
import { PlusIcon, ShieldCheckIcon, Zap, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { BorderTrail } from "./border-trail";

const freeFeatures = [
  "2 compiles every 15 days",
  "React & HTML output",
  "Syntax highlighted preview",
  "Copy generated code",
];

const proFeatures = [
  "Unlimited compiles",
  "React & HTML output",
  "Syntax highlighted preview",
  "Priority compile queue",
  "Figma token management",
  "Early access to new features",
];

export function Pricing() {
  return (
    <section className="relative min-h-screen overflow-hidden py-24">
      <div id="pricing" className="mx-auto w-full max-w-6xl space-y-5 px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl space-y-5"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border border-[#222] bg-[#111] px-4 py-1 font-mono text-[#888] text-xs tracking-widest uppercase">
              Pricing
            </div>
          </div>
          <h2 className="mt-5 text-center text-2xl font-bold tracking-tighter text-white md:text-3xl lg:text-4xl">
            Start Free. Scale When Ready.
          </h2>
          <p className="text-[#888] mt-5 text-center text-sm md:text-base">
            Try ZENO at no cost — get 2 free compiles every 15 days.
            Upgrade anytime for unlimited access and priority processing.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="relative">
          {/* Grid background */}
          <div
            className={cn(
              "z-[-10] pointer-events-none absolute inset-0 size-full",
              "[mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"
            )}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mx-auto w-full max-w-2xl space-y-2"
          >
            <div className="grid md:grid-cols-2 bg-[#050505] relative border border-[#222] p-4">
              {/* Corner plus icons */}
              <PlusIcon className="absolute -top-3 -left-3 size-5 text-[#444]" />
              <PlusIcon className="absolute -top-3 -right-3 size-5 text-[#444]" />
              <PlusIcon className="absolute -bottom-3 -left-3 size-5 text-[#444]" />
              <PlusIcon className="absolute -right-3 -bottom-3 size-5 text-[#444]" />

              {/* FREE PLAN */}
              <div className="w-full px-4 pt-5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="size-4 text-[#888]" />
                      <h3 className="leading-none font-semibold text-white">
                        Free
                      </h3>
                    </div>
                    <Badge variant="secondary">No credit card</Badge>
                  </div>
                  <p className="text-[#666] text-sm pt-1">
                    Perfect for trying out ZENO.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="text-[#666] flex items-end gap-0.5 text-xl">
                    <span className="text-white -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
                      $0
                    </span>
                    <span className="ml-1">/forever</span>
                  </div>

                  <ul className="space-y-2 mt-2">
                    {freeFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#666]">
                        <span className="w-1 h-1 rounded-full bg-[#444] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full mt-4" variant="outline" asChild>
                    <a href="/signup">Get Started Free</a>
                  </Button>
                </div>
              </div>

              {/* PRO PLAN */}
              <div className="relative w-full rounded-lg border border-[#333] bg-[#080808] px-4 pt-5 pb-4">
                <BorderTrail
                  style={{
                    boxShadow:
                      "0px 0px 60px 30px rgb(255 255 255 / 10%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                  }}
                  size={100}
                />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-white" />
                      <h3 className="leading-none font-semibold text-white">
                        Pro
                      </h3>
                    </div>
                    <Badge variant="default">Most Popular</Badge>
                  </div>
                  <p className="text-[#666] text-sm pt-1">
                    Unlimited power for serious builders.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="text-[#666] flex items-end gap-0.5 text-xl">
                    <span>$</span>
                    <span className="text-white -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
                      14.99
                    </span>
                    <span>/month</span>
                  </div>

                  <ul className="space-y-2 mt-2">
                    {proFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#888]">
                        <span className="w-1 h-1 rounded-full bg-white flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full mt-4" asChild>
                    <a href="/signup">Upgrade to Pro</a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust line */}
            <div className="text-[#555] flex items-center justify-center gap-x-2 text-sm pt-1">
              <ShieldCheckIcon className="size-4" />
              <span>Cancel anytime · No hidden fees · Billed monthly</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}