import patternCss from "./patterns.css?raw";
import documentCss from "./document.css?raw";
import fieldSource from "@/components/App-TextField.vue?raw";

const fieldCss = fieldSource.match(/<style\b[^>]*>([\s\S]*?)<\/style>/)?.[1]?.trim() ?? "";

export const tableHtml = `<div class="data-table-wrap" role="region" aria-label="Training sessions" tabindex="0">
  <table class="data-table">
    <caption>Training sessions</caption>
    <thead>
      <tr><th scope="col">Course</th><th scope="col">Date</th><th scope="col" class="data-table__number">Seats</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Provider training</th><td>Nov 24</td><td class="data-table__number">3</td></tr>
      <tr><th scope="row">Refresher training</th><td>Dec 5</td><td class="data-table__number">12</td></tr>
      <tr><th scope="row">Provider training</th><td>Dec 12</td><td class="data-table__number">0</td></tr>
    </tbody>
  </table>
</div>`;

export const formHtml = `<form class="layout-form">
  <fieldset class="layout-form__group">
    <legend>Contact information</legend>
    <div class="layout-form__row auto-grid">
      <div class="form-field">
        <label class="form-field__label" for="layout-name">Full name</label>
        <input class="form-field__input" id="layout-name" name="name" autocomplete="name" required>
      </div>
      <div class="form-field">
        <label class="form-field__label" for="layout-email">Email</label>
        <input class="form-field__input" id="layout-email" name="email" type="email"
               autocomplete="email" aria-describedby="layout-email-hint" required>
        <p class="text-field__hint" id="layout-email-hint">Your confirmation goes here.</p>
      </div>
    </div>
  </fieldset>
  <fieldset class="layout-form__group">
    <legend>Course preferences</legend>
    <div class="form-field">
      <label class="form-field__label" for="layout-course">Course</label>
      <select class="form-field__input" id="layout-course" name="course">
        <option>Provider training</option><option>Refresher training</option>
      </select>
    </div>
  </fieldset>
  <div class="layout-form__actions cluster">
    <button class="button" type="submit">Save details</button>
  </div>
</form>`;

export const signatureHtml = `<div class="signature-fields auto-grid">
  <label class="signature-field">
    <input class="signature-field__line" name="signature" type="text" autocomplete="name">
    <span>Signature</span>
  </label>
  <label class="signature-field">
    <input class="signature-field__line" name="date" type="text" placeholder="MM/DD/YYYY">
    <span>Date</span>
  </label>
</div>`;

export const documentHtml = `<article class="document-page flow" aria-labelledby="document-title">
  <header class="document-page__band">
    <p>Harmony Roosters</p>
    <h2 id="document-title">Training acknowledgment</h2>
  </header>
  <section class="flow">
    <h3 class="document-page__section-title">Participant details</h3>
    <p>Complete this form after reviewing your training information.</p>
    <div class="signature-fields auto-grid">
      <div class="signature-field"><div class="signature-field__line signature-field__line--paper" aria-hidden="true"></div><span>Participant name</span></div>
      <div class="signature-field"><div class="signature-field__line signature-field__line--paper" aria-hidden="true"></div><span>Session date</span></div>
    </div>
  </section>
  <section class="flow">
    <h3 class="document-page__section-title">Acknowledgment</h3>
    <p>I acknowledge that I have received the training information listed above.</p>
    <div class="signature-fields auto-grid">
      <div class="signature-field"><div class="signature-field__line signature-field__line--paper" aria-hidden="true"></div><span>Participant signature</span></div>
      <div class="signature-field"><div class="signature-field__line signature-field__line--paper" aria-hidden="true"></div><span>Date</span></div>
    </div>
  </section>
</article>`;

function snippet(html: string, css: string) {
  return `<link rel="stylesheet" href="/design-foundation.css">\n<style>\n${css.trim()}\n</style>\n\n${html}`;
}

export const patternExamples = {
  table: snippet(tableHtml, patternCss),
  form: snippet(formHtml, `${fieldCss}\n\n${patternCss}`),
  signature: snippet(signatureHtml, documentCss),
  document: snippet(documentHtml, documentCss),
};
