"use client";

import { Logo } from "./Logo";
import { Pill } from "./Pill";
import { PillTag } from "./Pill";
import { PortalCluster } from "./PortalCluster";

/**
 * Header — the branded top bar for the OnDiem Social Performance dashboard.
 * ---------------------------------------------------------------------------
 * Replaces the generic "Figment Creative · Social Intelligence" header in the
 * existing build with an onDiem-first identity:
 *   • Logo (white) top-left
 *   • Eyebrow → "Powered by Figment Creative" (cobranded, secondary)
 *   • Serif headline with pill highlight
 *   • Subhead with the reporting period
 *   • Decorative portal cluster bleeding off the right edge
 *   • Status pill-tag for "Weekly Report" (top-right)
 *
 * Self-contained styles below — uses CSS variables from globals.css.
 */

export interface HeaderProps {
  /** Reporting period label, e.g. "Nov 18 – Nov 24, 2025" */
  period?: string;
  /** Override the headline — defaults to "This Week in Social" */
  headline?: React.ReactNode;
}

export function Header({
  period = "Loading period...",
  headline,
}: HeaderProps) {
  return (
    <header className="ond-hdr">
      {/* Decorative cluster — absolutely positioned, bleeds off the right edge */}
      <div className="ond-hdr__cluster" aria-hidden="true">
        <PortalCluster variant="horizontal" invert line="ink-soft" />
      </div>

      <div className="ond-hdr__row ond-hdr__row--top">
        <Logo variant="full-inverse" height={26} />
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
        /* Soft secondary-color blooms in the background, very low opacity */
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
        .ond-hdr__cluster {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 380px;
          z-index: 1;
          opacity: 0.95;
          pointer-events: none;
        }
        .ond-hdr__row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ond-hdr__row--top { margin-bottom: 28px; }
        .ond-hdr__row--main { align-items: flex-end; }

        .ond-hdr__copy { max-width: 60%; }
        .ond-hdr__eyebrow {
          font-family: var(--font-body);
          font-size: var(--t-eyebrow);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--paper-50);
          margin-bottom: 14px;
        }
        .ond-hdr__title {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3.6vw, 2.75rem);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--canvas);
        }
        .ond-hdr__sub {
          font-family: var(--font-body);
          font-size: var(--t-body);
          font-weight: 500;
          color: var(--paper-50);
          margin-top: 8px;
          letter-spacing: 0.01em;
        }

        /* On dark surface, the pill keeps brand color but text stays ink (navy) */
        .ond-hdr__title .pill { color: var(--ink); }

        @media (max-width: 800px) {
          .ond-hdr { padding: 22px 20px 26px; }
          .ond-hdr__cluster { display: none; }
          .ond-hdr__copy { max-width: 100%; }
        }
      `}</style>
    </header>
  );
}
