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
      <p className="text-xs text-muted-foreground">Last updated: 20 July 2026</p>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">Our promise</h2>
        <p>
          At <strong>Paddleup Manipal</strong> we want you on the court, not chasing invoices.
          If plans change, this policy explains when you can get your money back.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">Cancellation window</h2>
        <p>
          You can cancel a booking and receive a <strong>full refund</strong> if you cancel
          <strong> at least 24 hours before</strong> your slot start time.
        </p>
        <p className="mt-2">
          Cancellations made <strong>less than 24 hours before</strong> the slot are
          non-refundable, because the court has already been held for you and cannot be
          re-booked in time.
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
        <h2 className="font-heading font-bold text-base mb-1">Exceptions</h2>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>
            If we cancel a slot on our end (weather, maintenance, court unavailability) you
            get a full refund regardless of timing, or the option to reschedule.
          </li>
          <li>
            If you paid via UPI manually and the payment was never verified by us, the booking
            is cancelled automatically and there is nothing to refund.
          </li>
        </ul>
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
