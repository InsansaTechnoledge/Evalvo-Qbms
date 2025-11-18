import React from "react";
import { ArrowRight, Mail, Linkedin, Twitter, Github } from "lucide-react";
import { columns } from "../../utils/Constants";

const Footer = () => {
  
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700 ">
      {/* CTA band */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="flex flex-col gap-6 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-600 p-6 text-white sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-blue-100">Start today</p>
            <h2 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">
              Don’t wait to make better papers
            </h2>
            <p className="mt-2 max-w-xl text-blue-100/90">
              Spin up a question bank, map CO–PO, and generate balanced papers
              in minutes—not months.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-medium text-blue-700 shadow-sm transition hover:shadow md:min-w-40"
            >
              Get a demo <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a
              href="/docs"
              className="inline-flex items-center justify-center rounded-xl bg-blue-500/30 px-5 py-3 font-medium text-white ring-1 ring-inset ring-white/30 backdrop-blur transition hover:bg-blue-500/40 md:min-w-40"
            >
              Explore docs
            </a>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-2">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-gray-900 ">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-gray-600 transition hover:text-gray-900 "
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 ">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
          <div className="text-sm">
            <span className="font-semibold text-gray-900 ">
              EvalvoTech QBMS
            </span>{" "}
            <span className="text-gray-500 ">
              © {new Date().getFullYear()} • All rights reserved
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="mailto:hello@evalvotech.com"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 "
              aria-label="Email"
              title="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com/"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 "
              aria-label="Twitter"
              title="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 "
              aria-label="GitHub"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 "
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
