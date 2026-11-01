import { html, type Html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { button, card, checkboxField, csrfInput, errorSummary, section } from "../ui/components";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { db } from "../lib/db";
import { getAuthContext, type AuthUser } from "../lib/auth";
import { POLICY_LINKS, POLICY_VERSION } from "../lib/legal";
import { hasAccepted, recordAcceptance } from "../lib/policy-acceptance";
import type { Env } from "../lib/env";

/**
 * ============================================================================
 * READ AND ACCEPT THE POLICIES - the first screen of every account, 2026-11-01.
 * ============================================================================
 *
 * Founder instruction: the policies are to be put in front of anyone signing
 * up for the first time, and they must read and accept them. Sign-in here
 * creates an account at /verify (email) or at the Google callback, and both
 * then send the person to /console - so the one place every new account passes
 * through is the router, which sends any signed-in account without an
 * acceptance of POLICY_VERSION here first (src/index.ts). Returning producers
 * see this again only when POLICY_VERSION changes.
 *
 * THREE SEPARATE BOXES, NONE PRE-TICKED, because they are three different
 * statements and bundling them would make one tick stand for all three:
 *   - accepting the terms (a contract, which needs agreement);
 *   - having read the privacy notice (KVKK asks that the notice be GIVEN, not
 *     agreed to - asking for "consent" to it would mislabel what the person is
 *     doing, so the box says "read");
 *   - being 18 or over.
 *
 * WHAT A PERSON WHO DOES NOT ACCEPT CAN DO: sign out, or delete the account the
 * sign-in just created (/console/delete is deliberately not behind this gate).
 * Nothing else on /console is reachable until they accept.
 */

const TITLE = "Before you start";

const BOXES = [
  { name: "acceptTerms", label: "Terms of use" },
  { name: "readPrivacy", label: "Privacy notice" },
  { name: "confirmAdult", label: "Age" },
] as const;

export async function acceptPage(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return redirect("/sign-in");
  const sql = db(env);
  if (!sql) return page(unavailable(auth), 503);
  try {
    if (await hasAccepted(sql, auth.id)) return redirect("/console");
  } catch {
    return page(unavailable(auth), 503);
  }
  const token = await csrfToken(request, "accept-policies");
  if (!token) return redirect("/sign-in");
  return page(form(auth, token, [], new Set()), 200, { allowForms: true });
}

export async function acceptSubmit(request: Request, env: Env): Promise<Response> {
  const auth = await getAuthContext(request, env);
  if (!auth) return redirect("/sign-in", { status: 303 });

  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return redirect("/console/accept", { status: 303 });
  }
  const csrf = body.get(CSRF_FIELD);
  if (!(await verifyCsrf(request, "accept-policies", typeof csrf === "string" ? csrf : null))) {
    return redirect("/console/accept", { status: 303 });
  }

  const ticked = new Set(BOXES.filter((b) => body.get(b.name) === "yes").map((b) => b.name as string));
  const missing = BOXES.filter((b) => !ticked.has(b.name));
  if (missing.length > 0) {
    const token = await csrfToken(request, "accept-policies");
    if (!token) return redirect("/sign-in", { status: 303 });
    const errors = missing.map((b) => ({
      field: b.name,
      label: b.label,
      message:
        b.name === "acceptTerms"
          ? "Tick this to accept the terms"
          : b.name === "readPrivacy"
            ? "Tick this to confirm you have read the privacy notice"
            : "Tick this to confirm you are 18 or over",
    }));
    return page(form(auth, token, errors, ticked), 422, { allowForms: true });
  }

  const sql = db(env);
  if (!sql) return page(unavailable(auth), 503);
  try {
    // Re-checked so a double submit records one acceptance, not two.
    if (!(await hasAccepted(sql, auth.id))) await recordAcceptance(sql, auth);
  } catch {
    return page(unavailable(auth), 503);
  }
  return redirect("/console", { status: 303 });
}

/* ---------------------------------------------------------------------- *
 * Screens
 * ---------------------------------------------------------------------- */

function policyRow(title: Html, en: string, tr: string, about: Html): Html {
  return html`<li>
    <strong>${title}</strong> -
    <a href="${en}" target="_blank" rel="noopener">English</a> ·
    <a href="${tr}" target="_blank" rel="noopener" lang="tr" hreflang="tr">Türkçe</a>
    <br><span class="muted">${about}</span>
  </li>`;
}

function form(
  auth: AuthUser,
  token: string,
  errors: { field: string; label: string; message: string }[],
  ticked: Set<string>,
): Html {
  const err = (name: string) => errors.find((e) => e.field === name)?.message;
  return layout({
    title: TITLE,
    heading: "Read and accept our policies",
    signedIn: true,
    // No back-link: "Back to the console" would point at the page this gate
    // just redirected from, and would bounce straight back here.
    showBackLink: false,
    status: {
      label: "One step before the console",
      tone: "outline",
      note: html`You are signed in as <span class="wrap-anywhere">${auth.email}</span>. Nothing
        else is open until you accept. <span lang="tr">Kabul etmeden panel açılmaz.</span>`,
    },
    standfirst: html`Every account reads these once, and again whenever they change. They open in a
      new tab, in English or Turkish.
      <span lang="tr">Politikalarımızı okuyup onaylayın. Bağlantılar yeni sekmede, İngilizce veya
      Türkçe açılır.</span>`,
    body: html`
      ${errorSummary(errors)}
      ${card(html`
        <h3>The policies <span class="muted" lang="tr">· Politikalar</span></h3>
        <ul class="plain-list">
          ${policyRow(
            html`Terms of use <span lang="tr">· Kullanım koşulları</span>`,
            POLICY_LINKS.terms.en,
            POLICY_LINKS.terms.tr,
            html`What a listing is, what no plan buys, how listings are reviewed, withdrawn and removed.`,
          )}
          ${policyRow(
            html`Privacy notice <span lang="tr">· Gizlilik ve KVKK aydınlatma metni</span>`,
            POLICY_LINKS.privacy.en,
            POLICY_LINKS.privacy.tr,
            html`What we keep about you and your company, why, for how long, and your rights.`,
          )}
          ${policyRow(
            html`Cookie policy <span lang="tr">· Çerez politikası</span>`,
            POLICY_LINKS.cookies.en,
            POLICY_LINKS.cookies.tr,
            html`This console uses only the cookies that keep you signed in.`,
          )}
          ${policyRow(
            html`Refund and cancellation <span lang="tr">· İade ve iptal</span>`,
            POLICY_LINKS.refunds.en,
            POLICY_LINKS.refunds.tr,
            html`Part of the terms. Paid plans are not open yet.`,
          )}
        </ul>
        <p class="muted">
          Version ${POLICY_VERSION}. All of them on one page:
          <a href="${POLICY_LINKS.hub}" target="_blank" rel="noopener">counterscent.com/legal</a>.
        </p>
      `)}
      <form method="post" action="/console/accept" class="stack">
        ${csrfInput(CSRF_FIELD, token)}
        ${checkboxField({
          name: "acceptTerms",
          checked: ticked.has("acceptTerms"),
          error: err("acceptTerms"),
          label: html`I have read and accept the <a href="${POLICY_LINKS.terms.en}" target="_blank"
              rel="noopener">terms of use</a>, including the refund policy.
            <span lang="tr">(<a href="${POLICY_LINKS.terms.tr}" target="_blank" rel="noopener"
              >Kullanım koşullarını</a> ve iade politikasını okudum, kabul ediyorum.)</span>`,
        })}
        ${checkboxField({
          name: "readPrivacy",
          checked: ticked.has("readPrivacy"),
          error: err("readPrivacy"),
          label: html`I have read the <a href="${POLICY_LINKS.privacy.en}" target="_blank"
              rel="noopener">privacy notice</a> and the cookie policy.
            <span lang="tr">(<a href="${POLICY_LINKS.privacy.tr}" target="_blank" rel="noopener"
              >Gizlilik politikası ve KVKK aydınlatma metnini</a> ve çerez politikasını okudum.)</span>`,
        })}
        ${checkboxField({
          name: "confirmAdult",
          checked: ticked.has("confirmAdult"),
          error: err("confirmAdult"),
          label: html`I am 18 or over. <span lang="tr">(18 yaşından büyüğüm.)</span>`,
        })}
        <div class="btn-row">${button("Accept and continue · Kabul et ve devam et")}</div>
      </form>
      ${section({
        heading: "If you do not accept",
        body: html`
          <p>
            You do not have to. Your account was created when you signed in; you can
            <a href="/console/delete">delete it</a> and nothing about you stays except what that page
            lists, or sign out and come back later.
            <span lang="tr">Kabul etmek zorunda değilsiniz: hesabınızı
            <a href="/console/delete">silebilir</a> veya çıkış yapabilirsiniz.</span>
          </p>
          <form method="post" action="/sign-out">${button("Sign out · Çıkış yap", { variant: "ghost" })}</form>
        `,
      })}
    `,
  });
}

function unavailable(auth: AuthUser): Html {
  return layout({
    title: TITLE,
    heading: "This cannot be done right now",
    signedIn: true,
    status: { label: "Nothing was saved", tone: "outline", note: html`Try again shortly.` },
    standfirst: html`Signed in as <span class="wrap-anywhere">${auth.email}</span>. We could not
      reach the database to record your acceptance.`,
    body: section({
      heading: "Nothing was written",
      body: html`<p><a href="/console/accept">Try again</a>.</p>`,
    }),
  });
}

/** The router's answer when it cannot tell whether the policies were
 *  accepted. A 503 rather than letting the request through: a gate that opens
 *  whenever its own lookup fails is not a gate. */
export function gateUnavailable(): Response {
  return page(
    layout({
      title: TITLE,
      heading: "This cannot be loaded right now",
      signedIn: true,
      status: { label: "Unavailable", tone: "outline", note: html`Nothing was changed.` },
      body: section({
        heading: "Try again shortly",
        body: html`<p>We could not reach the database. <a href="/console">Try again</a>.</p>`,
      }),
    }),
    503,
  );
}
