"use client";

import type { ReactNode } from "react";
import { Pill, PillTag } from "./Pill";

export interface HeaderProps {
  period?: string;
  headline?: ReactNode;
}

export function Header({ period = "Loading period...", headline }: HeaderProps) {
  return (
    <header className="ond-hdr">
      <div className="ond-hdr__row ond-hdr__row--top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/ondiem-logo-white.png"
          alt="onDiem"
          className="ond-hdr__logo"
        />
        <PillTag variant="on-ink" withDot>
          Weekly Report
        </PillTag>
      </div>

      <div className="ond-hdr__row ond-hdr__row--main">
        <div className="ond-hdr__copy">
          <div className="ond-hdr__eyebrow">
            Social Performance · Powered by Figment Creative
          </div>
          <h1 className="ond-hdr__title">
            {headline ?? (
              <>
                This Week in <Pill color="teal">Social</Pill>
              </>
            )}
          </h1>
          <div className="ond-hdr__sub">{period}</div>
        </div>
      </div>

      <style>{`
        .ond-hdr {
          position: relative;
          background: var(--ink);
          color: var(--canvas);
          padding: 26px 36px 32px;
          overflow: hidden;
          isolation: isolate;
        }
        .ond-hdr::before, .ond-hdr::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .ond-hdr::before {
          right: -60px; top: -80px;
          width: 280px; height: 280px;
          background: rgba(127, 207, 209, 0.10);
          filter: blur(2px);
        }
        .ond-hdr::after {
          right: 220px; bottom: -100px;
          width: 220px; height: 220px;
          background: rgba(241, 137, 181, 0.07);
          filter: blur(2px);
        }
        .ond-hdr__row {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1280px;
          margin: 0 auto;
          gap: 1rem;
        }
        .ond-hdr__row--main {
          margin-top: 1.5rem;
          align-items: flex-end;
        }
        .ond-hdr__logo {
          height: 28px;
          width: auto;
          display: block;
        }
        .ond-hdr__copy {
          display: flex;
          flex-direction: column;
        }
        .ond-hdr__eyebrow {
          font-size: var(--t-eyebrow);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--paper-70);
          font-weight: 600;
          margin-bottom: 0.875rem;
        }
        .ond-hdr__title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: var(--t-display-xl);
          line-height: 1.05;
          letter-spacing: -0.01em;
        }
        .ond-hdr__sub {
          color: var(--paper-70);
          margin-top: 1rem;
        }
        @media (max-width: 720px) {
          .ond-hdr { padding: 1.25rem; }
          .ond-hdr__logo { height: 22px; }
        }
      `}</style>
    </header>
  );
}
