import { html } from "../lib/html";
import { CATALOGUE, layout } from "../ui/layout";
import { card, deadButton, deadField, notShipped, section } from "../ui/components";

/**
 * "/sign-in" - the screen in the shape it will have, with nothing behind it.
 *
 * THERE IS NO <form> ON THIS PAGE. Not a disabled form, not a form with no
 * action: no form element at all. The fields are inside a disabled
 * <fieldset>, every control carries `disabled`, and the CSP sends
 * `form-action 'none'`. Three independent layers, because the rule being
 * honoured is specific: a form that discards what someone typed is worse
 * than no form, and the failure mode it guards against is a later edit that
 * makes one control live by accident.
 *
 * The email-link choice is not a placeholder. It is the commitment already
 * made in the catalogue's login-form.tsx: the eventual account holders are
 * small businesses, and a magic link removes password storage, password
 * reset and credential-stuffing from a solo-operated site's list of
 * responsibilities.
 */
export function signIn() {
  const body = html`
    ${section({
      heading: "Email sign-in",
      lede: html`No passwords. You would type a work email, we would send a one-time
        link, and following it would sign you in.`,
      body: html`
        <div class="stack">
        ${notShipped({
          what: "This does not work, and typing in it would not be saved",
          reason: html`There is no account system on this origin. Nothing is sent, nothing
            is looked up, nothing is stored, and no account can be created. The fields
            below are disabled rather than merely styled that way, so there is no version
            of this page that quietly swallows what you type. Authentication is step 5 of
            the build order and has not been started.`,
        })}

        ${card(
          html`
            <h3>Request a sign-in link</h3>
            <p class="field-hint">
              Disabled throughout. Nothing on this origin can accept input yet.
            </p>
            <fieldset disabled class="fieldset-body">
              ${deadField({
                label: "Work email",
                kind: "email",
                placeholder: "you@yourfragrancehouse.com",
                hint: html`The address on the account, at the domain you sell from. The
                  programme is for businesses, not private individuals.`,
              })}
              <div class="actions">
                ${deadButton("Email me a sign-in link")}
                <p class="actions-note">No mail is sent. No mail can be sent.</p>
              </div>
            </fieldset>
          `,
          "signin-card",
        )}
        </div>
      `,
    })}

    ${section({
      heading: "What this will do once it is built",
      body: html`
        <ul class="plain-list">
          <li>
            Send a single-use link that expires, to the address on the account. No
            password is ever set, so none can be reused, leaked or reset by someone else.
          </li>
          <li>
            Sign you into this origin only. The public catalogue stays cookieless and
            does not know who you are; that property belongs to the catalogue and is not
            a claim about this console, which necessarily knows who is signed in.
          </li>
          <li>
            Put you in the console, where your listings and their states are. Not in the
            review queue: that is the editor's side and a producer account will not open
            it.
          </li>
        </ul>
      `,
    })}

    ${section({
      heading: "If you came here to compare fragrances",
      body: html`
        <p>
          This is the trade side. The comparison tool is on the public site:
          <a href="${CATALOGUE}/dupe-finder">the Dupe Finder</a>, and it needs no account
          and never will.
        </p>
      `,
    })}
  `;

  return layout({
    title: "Sign in",
    heading: "Sign in",
    status: {
      label: "No accounts exist",
      note: html`Not "your account was not found". There is no account system here at
        all, for anyone, including us.`,
    },
    standfirst: html`For fragrance producers listing on Counterscent. This is the screen
      in the shape it will have, with nothing behind it.`,
    body,
  });
}
