import { html } from "../lib/html";
import { layout } from "../ui/layout";
import { section } from "../ui/components";

/**
 * The 404, in the same shell as every other page.
 *
 * It used to be a second HTML document with its own copy of the palette
 * inline, which is exactly the duplication that made this origin worth
 * restructuring: two places to change a colour, and one of them would have
 * been forgotten.
 */
export function notFound() {
  return layout({
    title: "Not found",
    heading: "Nothing at this address",
    showBackLink: false,
    standfirst: html`This origin has four pages, and they are all listed on the
      overview.`,
    body: section({
      heading: "Where you might have meant to go",
      body: html`
        <ul class="plain-list">
          <li><a href="/">The overview</a>, which explains what this console is for.</li>
          <li><a href="/sign-in">Sign in</a>, which does not work yet and says so.</li>
          <li><a href="/console">The producer console</a>.</li>
          <li><a href="/review">The review queue</a>.</li>
        </ul>
      `,
    }),
  });
}
