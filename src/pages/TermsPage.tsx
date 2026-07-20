import { BackButton } from "@/components/BackButton";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
      <div className="container flex items-center gap-2 h-14">
        <BackButton />
        <h1 className="font-heading text-lg font-bold">Terms & Conditions</h1>
      </div>
    </header>
    <main className="container max-w-2xl py-8 space-y-5 text-sm leading-relaxed text-foreground">
      <p className="text-xs text-muted-foreground">Last updated: 20 July 2026</p>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">1. About us</h2>
        <p>
          These Terms & Conditions ("Terms") govern your use of the website, booking platform,
          and services (together, the "Service") provided by <strong>PaddleUp Manipal</strong>
          ("we", "us", "our"), operating pickleball courts in Manipal, Karnataka, India. By
          creating an account, booking a slot, or otherwise using the Service you agree to these Terms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">2. Eligibility & accounts</h2>
        <p>
          You must be at least 13 years old and, if signing up on behalf of a group or organisation,
          have authority to bind them. You must provide accurate details (including a valid phone
          number) and keep them updated, and you are responsible for all activity under your account
          and for keeping your login credentials confidential.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">3. The Service</h2>
        <p>
          PaddleUp Manipal lets you view court availability, reserve one-hour slots on our
          pickleball courts, pay for those slots, and use community features such as player
          profiles, chat rooms, leaderboards and tournaments. We may add, change, or remove
          features at any time. We do not guarantee that the Service will be uninterrupted or
          error-free.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>use the Service for anything unlawful, fraudulent, or abusive;</li>
          <li>spam, harass, impersonate, or share obscene or hateful content in profiles or chat;</li>
          <li>infringe anyone's intellectual property rights;</li>
          <li>attempt to break, probe, scrape, reverse-engineer, or overload the Service, or bypass any technical limits;</li>
          <li>make bookings you do not intend to honour, or resell slots without our written consent.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">5. Bookings, payments and taxes</h2>
        <p>
          Slot prices are shown at checkout (currently ₹600/hour off-peak and ₹800/hour peak, subject
          to change). Card, wallet and UPI payments on the Service are processed by our reseller
          Paddle. For payment, billing, tax and invoicing terms, and for the mechanics of refunds and
          cancellations, please see Paddle's{" "}
          <a
            href="https://www.paddle.com/legal/checkout-buyer-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Checkout Buyer Terms
          </a>
          . Our own cancellation and refund rules are in our{" "}
          <a href="/refund-policy" className="text-primary underline">Refund Policy</a>.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">6. Merchant of Record</h2>
        <p>
          Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
          Merchant of Record for all our orders. Paddle provides all customer service inquiries
          and handles returns.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">7. On-court conduct & safety</h2>
        <p>
          You play at your own risk. Follow posted court rules and staff instructions, wear
          non-marking shoes, and behave respectfully towards other players and staff. We may
          refuse entry or end a session for unsafe or abusive behaviour without a refund.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">8. User content</h2>
        <p>
          You retain ownership of the content you post (profile info, chat messages, photos). You
          grant us a limited, non-exclusive licence to host and display that content solely to
          operate the Service. Do not post anything you do not have the right to share.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">9. Intellectual property</h2>
        <p>
          The Service, including the PaddleUp Manipal name, logo, software, and design, is owned
          by us or our licensors. You get a limited, non-exclusive, non-transferable right to use
          the Service for personal, non-commercial purposes. No other rights are granted.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">10. Suspension and termination</h2>
        <p>
          We may suspend or terminate your account or a booking if you materially breach these
          Terms, fail to pay, pose a security or fraud risk, or repeatedly violate our policies.
          You can stop using the Service at any time.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">11. Disclaimers</h2>
        <p>
          To the fullest extent permitted by law, the Service is provided "as is" and we disclaim
          all implied warranties, including merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">12. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, our aggregate liability for any claims arising
          out of or relating to the Service is limited to the fees you paid us in the twelve
          months before the event giving rise to the claim. We are not liable for indirect,
          incidental, special, consequential or punitive damages, or for loss of profits, data or
          goodwill. Nothing in these Terms limits liability for fraud, death or personal injury
          caused by negligence, or anything else that cannot be limited by law.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">13. Indemnity</h2>
        <p>
          You agree to indemnify and hold PaddleUp Manipal harmless from claims arising out of
          your user content, your use of the Service, or your breach of these Terms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">14. Changes</h2>
        <p>
          We may update these Terms from time to time. Material changes will be notified on the
          Service. Continued use after changes take effect means you accept the updated Terms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">15. Governing law</h2>
        <p>
          These Terms are governed by the laws of India. Courts in Udupi, Karnataka have
          exclusive jurisdiction over any disputes, subject to any rights you have under
          applicable consumer law.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">16. Contact</h2>
        <p>
          Questions about these Terms? Reach us on Instagram{" "}
          <a
            href="https://www.instagram.com/paddleup.manipal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            @paddleup.manipal
          </a>
          .
        </p>
      </section>
    </main>
  </div>
);

export default TermsPage;
