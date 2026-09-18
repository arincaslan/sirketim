import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { CATALOGUE, layout } from "../ui/layout";
import { card, notShipped, quotaLine, section } from "../ui/components";
import { PLANS, NEVER_INCLUDED, type GeneratedPlan } from "../generated/plans";
import type { Env } from "../lib/env";
import { requireProducer } from "./producer-gate";
import { allowanceForTier, planFor, type Allowance } from "../lib/producer";
import type { ProducerConsoleData } from "../lib/producer";

/**
 * "/console/plan" - what the producer is on, what the other tiers cost, and
 * the one route that actually changes it today.
 *
 * ============================================================================
 * FOUNDER INSTRUCTION, 2026-09-18: "the user should be able to upgrade its
 * plan easily from console too."
 * ============================================================================
 *
 * THERE IS NO CHECKOUT, AND THIS PAGE SAYS SO IN THE FIRST THING YOU READ.
 * No payment provider is connected to this origin. Paddle is the recommended
 * one (Stripe, PayPal and Gumroad do not serve a Turkey-based company, see
 * departments/accounting) and it is recommended, not integrated: there is no
 * price object, no webhook, no Subscription write anywhere in this Worker.
 *
 * So "upgrade easily" is delivered as the easiest thing that is REAL rather
 * than as a button that fakes one. The repo rule is explicit - a feature whose
 * backing service does not exist must say so at the point of use, never a fake
 * success - and a Subscribe button that opens a "coming soon" modal is the
 * fake success that rule exists to stop. What is real today is that a person
 * sets Subscription.tier by hand, so the action on every tier a producer is
 * not on is a mailto addressed to that person, prefilled with who is asking,
 * what they are on and what they want. One click, nothing to type, and it
 * works this afternoon.
 *
 * WHY NO FORM AND NO POST. A POST could record "this producer asked to move to
 * Unlimited", which sounds more like a product. It needs a table that does not
 * exist, so it needs a migration, and what it would buy over the mailto is a
 * row nobody reads - the request still has to reach a human either way, and
 * mail already does that with delivery we can verify. Keeping the page
 * form-free also means it never asks for the `allowForms` CSP grant, which is
 * the same call producer-gate.ts's refusal screens make and for the same
 * reason. When billing lands, the tier action becomes a real submit and the
 * grant arrives with it.
 *
 * THE FIGURES ARE GENERATED, NEVER TYPED. Every number and every tier name on
 * this page comes from src/generated/plans.ts, which is compiled from the
 * catalogue's lib/plans.ts by `npm run generate` and checked by `--check`.
 * This origin cannot import from that project, so a figure typed here would be
 * a copy sitting behind the catalogue's constants with nothing able to catch a
 * mismatch - and a producer reading $9.99 here and something else on the pricing
 * page is worse than one reading no figure at all. That was the original
 * argument for printing no figures; the founder overruled the conclusion on
 * 2026-09-16 and upheld the objection, which is what generation answers.
 *
 * THE PRICES ARE STILL PLACEHOLDERS AT THE SOURCE and this page says that too.
 * lib/plans.ts says in its own header that these are a considered guess rather
 * than a price. Rendering one without that caveat would turn a guess into a
 * published commitment, which is the point at which somebody holds us to it.
 */
export async function producerPlan(request: Request, env: Env): Promise<Response> {
  const gate = await requireProducer(request, env, {
    verb: "see your plan",
    title: "Your plan",
  });
  if (gate.kind === "refused") return gate.response;
  return page(planPage(gate.data, gate.isAdmin));
}

/**
 * NOT LINKED FROM AN ADMIN'S NAV, but still rendered if one arrives here.
 *
 * Founder instruction 2026-09-18 removed "Your plan" from the administrative
 * navigation, and the console's account panel points an admin at /admin
 * instead, so there is no route into this page for one. That is a navigation
 * decision, not an access one: refusing to render a page of published prices
 * to somebody who can read the same figures on the public pricing page would
 * be theatre. The nav flag is threaded through so that an admin who gets here
 * from a bookmark does not silently lose the admin group from the bar.
 */
function planPage(data: ProducerConsoleData, isAdmin = false): Html {
  const { producer, inUse } = data;
  const current = planFor(producer.tier);
  const allowance: Allowance | null =
    producer.tier === null ? null : allowanceForTier(producer.tier);

  // THE UNRECOGNISED CASE IS ITS OWN STATE, not a fallback to free. A tier
  // string the generated PLANS do not contain means the catalogue renamed a
  // tier and nobody ran `npm run generate`, or somebody edited the row by
  // hand. Drawing it as free would quietly show the wrong allowance to the one
  // producer able to tell us it is wrong.
  const unrecognised = producer.tier !== null && current === null;

  return layout({
    title: "Your plan",
    heading: "Your plan",
    nav: { current: "plan", showAdmin: isAdmin },
    status: {
      // OUTLINE, NOT SOLID. Solid is reserved for a surface that is real and
      // working end to end, which /console earned by reading live data. This
      // page reads live data too, but the thing it is about - changing what
      // you pay - does not work end to end, and the pill is the first thing
      // read on the page.
      label: "Billing not connected",
      tone: "outline",
      note: html`There is no checkout on this site and no payment provider connected to it.
        Nothing on this page can charge you, and none of it will change your plan on its
        own.`,
    },
    standfirst: currentStandfirst(producer.name, current, unrecognised, producer.tier),
    body: html`
      ${section({
        heading: "Where you are today",
        body: html`
          <div class="stack">
            ${card(html`
              <p class="plan-now-label">Current plan</p>
              <p class="plan-now-name">
                ${current ? current.name : unrecognised ? "Not recognised" : "No plan on file"}
              </p>
              <p class="muted">
                ${current
                  ? current.tagline
                  : unrecognised
                    ? html`Your record says <code>${producer.tier ?? ""}</code>, which this
                        console has no plan for. That is ours to fix, and the allowance we
                        enforce meanwhile is stated below rather than guessed.`
                    : html`No subscription record exists against this producer. That is the
                        normal state of every account here, not a problem: the free allowance
                        is what we enforce until one is created.`}
              </p>
              <div class="plan-now-quota">
                ${
                  // quotaLine's no-record branch leads with "No plan on file",
                  // which is exactly what the heading two lines above already
                  // says, and the paragraph between them already explains why.
                  // Printing it a second time made the card look like it had
                  // failed to render rather than like it was being thorough.
                  // The component is still right for every other caller - this
                  // is the one place the fact is redundant, so this is the one
                  // place that skips it.
                  allowance === null
                    ? html`<span class="quota">
                        <span class="quota-figure"
                          >${inUse === 1 ? "1 listing" : `${String(inUse)} listings`} on
                          file</span
                        >
                        <span class="quota-note"
                          >Counted against the free allowance of one active listing, which is
                          what we enforce with no record present. Withdrawn and removed
                          listings do not count.</span
                        >
                      </span>`
                    : quotaLine({ used: inUse, allowance, tier: producer.tier ?? undefined })
                }
              </div>
            `)}
          </div>
        `,
      })}

      ${section({
        heading: "The three tiers",
        lede: html`Prices are in US dollars and come from the same file the public pricing
          page reads, so the two cannot disagree. They are still indicative rather than
          final - see the note under the cards.`,
        body: html`
          <div class="stack">
            <div class="grid-3">
              ${PLANS.map((p) => tierCard(p, producer, current))}
            </div>
            ${notShipped({
              what: "Nothing here takes a payment, and these figures are not yet a price",
              reason: html`There is no checkout, no card form and no payment provider attached
                to this origin, so no button on this page could charge you even if you wanted
                it to. The figures are the ones we intend to charge, published so you can
                decide whether this is worth your time, and we would rather show them with
                that said than hide them. If they move before billing opens, they move on the
                <a href="${CATALOGUE}/producers/pricing">pricing page</a> and here at the same
                time, because both read one file.`,
            })}
          </div>
        `,
      })}

      ${section({
        heading: "What no tier buys, at any price",
        lede: html`This list is the reason the tiers can be compared at all. It does not
          change as you move up it.`,
        body: html`
          <div class="stack">
            <ul class="plain-list">
              ${NEVER_INCLUDED.map((line) => html`<li>${line}.</li>`)}
            </ul>
            <p class="muted">
              The first two are not only promised. The modules that compute and order scores
              cannot import anything that knows what a producer pays, and the catalogue's
              build fails if that changes. Paying more moves your allowance and your data,
              never your position.
            </p>
            <p class="muted">
              We also take no commission on your sales, on any tier, the free one included.
              We earn nothing from where you rank, which is a stronger version of the same
              promise than any policy statement: there is no number on our side that moves
              when yours does.
            </p>
          </div>
        `,
      })}
    `,
  });
}

/** The one-sentence answer to "what am I on", in the standfirst slot so it is
 *  read before the cards rather than found among them. */
function currentStandfirst(
  producerName: string,
  current: GeneratedPlan | null,
  unrecognised: boolean,
  rawTier: string | null,
): Html {
  if (unrecognised) {
    return html`${producerName} is recorded on a plan called
      <code>${rawTier ?? ""}</code>, which this console does not recognise. Write to us and we
      will straighten it out.`;
  }
  if (!current) {
    return html`${producerName} has no subscription record, so the free allowance is what we
      enforce. Here is what each tier covers and how to move between them.`;
  }
  return html`${producerName} is on ${current.name}. Here is what that covers, what the other
    tiers cover, and how to move.`;
}

/**
 * One tier.
 *
 * THE CURRENT TIER GETS NO ACTION AND IS MARKED IN TWO CHANNELS, not one:
 * a text label reading "Your plan" and a heavier border. Never colour alone -
 * the same rule the nav's current-page state follows, for the same reader.
 */
function tierCard(
  plan: GeneratedPlan,
  producer: ProducerConsoleData["producer"],
  current: GeneratedPlan | null,
): Html {
  const isCurrent = current !== null && plan.id === current.id;

  // NO SUBSCRIPTION ROW IS NOT THE SAME AS BEING ON FREE, and the free card is
  // the one place that distinction is visible to a producer. It says what we
  // actually enforce without claiming a record exists that does not.
  const isEnforcedDefault = current === null && plan.priceMonthlyUsd === null;

  // ONE FLAG DRIVES BOTH THE MARKING AND THE ACTION. They were computed
  // separately for a few minutes and the free card rendered "What we enforce"
  // above a button reading "Move up to Free" - a card telling a producer they
  // were already on the tier it was inviting them to buy. The two questions
  // "is this the tier in force for you" and "can you move to it" have one
  // answer, so they read one value.
  const isInForce = isCurrent || isEnforcedDefault;

  return html`<div class="plan-card${isInForce ? " is-current" : ""}">
    <p class="plan-card-tier">
      ${plan.name}
      ${isCurrent
        ? html`<span class="plan-card-flag">Your plan</span>`
        : isEnforcedDefault
          ? html`<span class="plan-card-flag">What we enforce</span>`
          : ""}
    </p>
    ${priceBlock(plan)}
    <p class="plan-card-listings">${plan.listings}</p>
    <ul class="plain-list">
      ${plan.features.map((f) => html`<li>${f}.</li>`)}
    </ul>
    <p class="door-action">${tierAction(plan, producer, current, isCurrent, isEnforcedDefault)}</p>
  </div>`;
}

/**
 * The figure, or the absence of one.
 *
 * THE YEARLY SAVING IS COMPUTED, NOT WRITTEN. Both paid tiers are priced at
 * ten months for twelve, and the founder held that ratio deliberately when
 * Standard moved from 19 to 12 so the annual discount would not drift with the
 * headline number. Deriving the months rather than typing "two months free"
 * means that if the ratio ever does change, this line changes with it instead
 * of becoming a false claim about a real price. A ratio that is not a whole
 * number of months prints the two figures and no claim, because a rounded
 * "about two months" on a page about money is exactly the kind of small lie
 * that is not worth the sentence.
 */
/**
 * A dollar figure as a person writes one.
 *
 * `String(9.99)` is "9.99" and `String(9.5)` is "9.5", and the second is not a
 * price - it is a number that happens to be a price, printed as "$9.5". That
 * was harmless while every figure on this page was a whole number and stopped
 * being harmless on 2026-09-18, when the tiers moved to 9.99 and 17.99. The
 * founder changed the prices twice within a minute, so the next value being a
 * clean two-decimal one is not something to rely on.
 *
 * Whole numbers stay whole ("$99 a year", not "$99.00"), because padding a
 * round annual figure reads like a form field rather than a price.
 */
function money(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

function priceBlock(plan: GeneratedPlan): Html {
  if (plan.priceMonthlyUsd === null) {
    return html`<p class="plan-card-price">
      Free<span class="plan-card-per"> - no card, nothing to cancel</span>
    </p>`;
  }

  const monthly = plan.priceMonthlyUsd;
  const yearly = plan.priceYearlyUsd;
  const monthsInYearly = yearly === null ? null : yearly / monthly;
  // TOLERANCE, NOT Number.isInteger. Prices became decimal on 2026-09-18
  // (9.99, 17.99) and a ratio like 99.90/9.99 is 10.000000000000002 in
  // binary floating point, so an exact integer test would silently drop the
  // "price of 10" line from a pair that genuinely is ten months. The current
  // pair (99/9.99 = 9.91) is not whole by any measure and correctly renders
  // without the clause; this guard is for the next pair the founder picks.
  const whole =
    monthsInYearly !== null && Math.abs(monthsInYearly - Math.round(monthsInYearly)) < 0.005;

  return html`<p class="plan-card-price">
      $${money(monthly)}<span class="plan-card-per"> a month</span>
    </p>
    ${yearly === null
      ? ""
      : html`<p class="plan-card-yearly">
          or $${money(yearly)} a year${whole && monthsInYearly < 12
            ? html` - 12 months for the price of ${String(Math.round(monthsInYearly))}`
            : ""}
        </p>`}`;
}

/**
 * What the reader can do about this tier, right now.
 *
 * A PREFILLED MAILTO RATHER THAN A DEAD BUTTON. deadButton() is the right
 * component when there is genuinely nothing behind an action - "Request an
 * edit" on /console is one - but moving tier is not that: a person really does
 * change it, today, and the only thing missing is the automated way to pay.
 * Rendering it as disabled would be less honest than the checkout it is
 * standing in for, not more.
 *
 * THE MAIL CARRIES WHAT WE NEED TO ACT ON IT so the producer types nothing:
 * the company, the tier they are on and the tier they want. It is addressed
 * from whatever client they use, which also means we can see it arrived - a
 * property the in-app request table this replaces would not have had.
 */
function tierAction(
  plan: GeneratedPlan,
  producer: ProducerConsoleData["producer"],
  current: GeneratedPlan | null,
  isCurrent: boolean,
  isEnforcedDefault: boolean,
): Html {
  if (isCurrent) {
    return html`<span class="plan-card-oncurrent">You are on this plan.</span>`;
  }
  if (isEnforcedDefault) {
    return html`<span class="plan-card-oncurrent"
      >This is what we enforce for you today. There is no subscription record to
      cancel.</span
    >`;
  }

  const from = current ? current.name : "no subscription record";
  const direction =
    current === null || current.priceMonthlyUsd === null
      ? "Move up to"
      : plan.priceMonthlyUsd === null
        ? "Move down to"
        : (plan.priceMonthlyUsd ?? 0) > (current.priceMonthlyUsd ?? 0)
          ? "Move up to"
          : "Move down to";

  const subject = `Plan change: ${producer.name} to ${plan.name}`;
  const body =
    `Company: ${producer.name}\n` +
    `Currently on: ${from}\n` +
    `Would like to move to: ${plan.name}\n\n` +
    `Sent from the producer console. There is no checkout yet, so this is the way to ask.`;

  return html`<a
    class="btn ${plan.priceMonthlyUsd === null ? "btn-ghost" : "btn-primary"}"
    href="mailto:contact@counterscent.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}"
    >${direction} ${plan.name}</a
  >`;
}
