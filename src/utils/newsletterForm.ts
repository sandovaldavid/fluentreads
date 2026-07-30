/**
 * Shared newsletter signup handler for the footer and CTA banner forms.
 * Submits via fetch + FormData (the same payload shape Pageclip's action
 * URL accepts from a plain HTML form POST) with inline, accessible
 * feedback instead of alert().
 */
export interface NewsletterFormOptions {
  formId: string;
  messageId: string;
}

export function initNewsletterForm({ formId, messageId }: NewsletterFormOptions): void {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  const message = document.getElementById(messageId);
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement | null;
  const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;

  function showMessage(text: string, tone: 'success' | 'error'): void {
    if (!message) return;
    message.textContent = text;
    message.classList.remove('hidden', 'text-red-200', 'text-green-200');
    message.classList.add(tone === 'success' ? 'text-green-200' : 'text-red-200');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!emailInput || !emailInput.value) return;

    emailInput.disabled = true;
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      showMessage('¡Gracias por suscribirte! Pronto recibirás nuestras novedades.', 'success');
      form.reset();
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      showMessage(
        'Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.',
        'error'
      );
    } finally {
      emailInput.disabled = false;
      if (submitButton) submitButton.disabled = false;
    }
  });
}
