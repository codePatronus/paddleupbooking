import { BackButton } from "@/components/BackButton";

const RefundPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
      <div className="container flex items-center gap-2 h-14">
        <BackButton />
        <h1 className="font-heading text-lg font-bold">Refund Policy</h1>
      </div>
    </header>
    <main className="container max-w-2xl py-8 space-y-5 text-sm leading-relaxed text-foreground">
      <p className="text-xs text-muted-foreground">Last updated: 21 July 2026</p>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">What you're buying</h2>
        <p>
          Every purchase on PaddleUp Manipal is a <strong>Digital Access Pass</strong> — a
          time-limited digital licence delivered electronically through our platform. This
          policy explains when you can get your money back for that digital purchase.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">30-day money-back guarantee</h2>
        <p>
          You may request a <strong>full refund</strong> for any Digital Access Pass within{" "}
          <strong>30 days</strong> of the purchase date, for any reason. Just contact us
          within that window and we'll process the refund to your original payment method.
        </p>
        <p className="mt-2">
          This 30-day guarantee applies regardless of when the reservation window on the
          Digital Access Pass falls, so you have a full month to change your mind about a
          purchase.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">How to request a refund</h2>
        <p>
          Payments are handled by our reseller Paddle. To request a refund, either:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>
            visit{" "}
            <a
              href="https://paddle.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              paddle.net
            </a>{" "}
            and enter the email you used at checkout, or
          </li>
          <li>
            message us on Instagram{" "}
            <a
              href="https://www.instagram.com/paddleup.manipal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              @paddleup.manipal
            </a>{" "}
            with your Booking ID and we'll process it for you.
          </li>
        </ul>
        <p className="mt-2">
          Approved refunds are returned to the original payment method, typically within
          5–10 business days depending on your bank.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">If we cancel</h2>
        <p>
          If we cancel or revoke a Digital Access Pass on our end (for example a platform
          issue, maintenance window, or scheduling error) you get a full refund regardless of
          timing, or the option to be re-issued a new pass for another slot.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">Chargebacks</h2>
        <p>
          If you believe a charge is incorrect, please contact us first — most issues can be
          resolved within a day. Filing a chargeback without contacting us may result in
          suspension of your account.
        </p>
      </section>
    </main>
  </div>
);

export default RefundPolicyPage;
