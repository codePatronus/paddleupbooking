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
      <p className="text-xs text-muted-foreground">Last updated: 21 July 2026</p>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">1. About us</h2>
        <p>
          These Terms & Conditions ("Terms") govern your use of the website, digital booking
          platform and related digital services (together, the "Service") provided by{" "}
          <strong>PaddleUp Manipal</strong> ("we", "us", "our"). By creating an account,
          purchasing a Digital Access Pass, or otherwise using the Service you agree to these
          Terms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">2. Nature of the product</h2>
        <p>
          PaddleUp Manipal sells <strong>digital products and digital services</strong>. What
          you purchase through the Service is a <strong>Digital Access Pass</strong>: a
          time-limited, non-tangible digital licence, delivered electronically, that entitles
          the holder to a one-hour reservation window within our online scheduling system
          (identified by a unique Booking ID, court number, date and time). The Digital Access
          Pass is generated, delivered and consumed entirely through our software platform.
        </p>
        <p className="mt-2">
          Additional digital services included with the Service are: your PaddleUp Manipal
          player account, digital player profile, ELO rating and match history, digital chat
          rooms, community directory, digital leaderboards, and digital tournament entries.
          All of these are software features delivered online.
        </p>
        <p className="mt-2">
          We do not sell any physical goods through the Service. Nothing tangible is shipped.
          Any subsequent, optional real-world activity that a Digital Access Pass holder may
          arrange with third parties is outside the scope of the Service and not part of what
          is purchased.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">3. Eligibility & accounts</h2>
        <p>
          You must be at least 13 years old and, if signing up on behalf of a group or
          organisation, have authority to bind them. You must provide accurate details
          (including a valid phone number) and keep them up to date. You are responsible for
          all activity under your account and for keeping your credentials confidential.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">4. The Service</h2>
        <p>
          The Service is a software-as-a-service platform. It lets you view digital slot
          availability, purchase a Digital Access Pass for a one-hour reservation window,
          receive an electronic booking confirmation, and use community software features such
          as player profiles, chat rooms, leaderboards and tournaments. We may add, change or
          remove features at any time. We do not guarantee that the Service will be
          uninterrupted or error-free.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>use the Service for anything unlawful, fraudulent or abusive;</li>
          <li>spam, harass, impersonate, or share obscene or hateful content in profiles or chat;</li>
          <li>infringe anyone's intellectual property rights;</li>
          <li>attempt to break, probe, scrape, reverse-engineer or overload the Service, or bypass any technical limits;</li>
          <li>resell, sublicense or transfer a Digital Access Pass without our written consent.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">6. Pricing, payments and taxes</h2>
        <p>
          Prices for each Digital Access Pass are shown at checkout (currently ₹600 for
          off-peak passes and ₹800 for peak passes, subject to change). Card, wallet and other
          online payments are processed by our reseller Paddle. For payment, billing, tax and
          invoicing terms, and for the mechanics of refunds and cancellations, please see
          Paddle's{" "}
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
        <h2 className="font-heading font-bold text-base mb-1">7. Merchant of Record</h2>
        <p>
          Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
          Merchant of Record for all our orders. Paddle provides all customer service
          inquiries and handles returns.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">8. Digital delivery</h2>
        <p>
          A Digital Access Pass is delivered electronically as soon as payment is confirmed:
          you receive an in-app confirmation and a unique Booking ID. No physical delivery
          takes place. By purchasing, you request immediate digital delivery and acknowledge
          that the Digital Access Pass becomes accessible to you as soon as it is issued.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">9. User content</h2>
        <p>
          You retain ownership of the content you post (profile info, chat messages, photos).
          You grant us a limited, non-exclusive licence to host and display that content
          solely to operate the Service. Do not post anything you do not have the right to
          share.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">10. Intellectual property & licence</h2>
        <p>
          The Service, including the PaddleUp Manipal name, logo, software and design, is
          owned by us or our licensors. We grant you a limited, non-exclusive,
          non-transferable, revocable licence to access and use the Service and any Digital
          Access Pass you purchase, for personal, non-commercial use only. No other rights
          are granted. You may not copy, modify, distribute, sell or lease any part of the
          Service.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">11. Suspension and termination</h2>
        <p>
          We may suspend or terminate your account, revoke a Digital Access Pass, or restrict
          access to the Service if you materially breach these Terms, fail to pay, pose a
          security or fraud risk, or repeatedly violate our policies. You can stop using the
          Service at any time.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">12. Disclaimers</h2>
        <p>
          To the fullest extent permitted by law, the Service and any Digital Access Pass are
          provided "as is" and we disclaim all implied warranties, including merchantability,
          fitness for a particular purpose and non-infringement.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">13. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, our aggregate liability for any claims
          arising out of or relating to the Service is limited to the fees you paid us in the
          twelve months before the event giving rise to the claim. We are not liable for
          indirect, incidental, special, consequential or punitive damages, or for loss of
          profits, data or goodwill. Nothing in these Terms limits liability for fraud, death
          or personal injury caused by negligence, or anything else that cannot be limited by
          law.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">14. Indemnity</h2>
        <p>
          You agree to indemnify and hold PaddleUp Manipal harmless from claims arising out
          of your user content, your use of the Service, or your breach of these Terms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">15. Changes</h2>
        <p>
          We may update these Terms from time to time. Material changes will be notified on
          the Service. Continued use after changes take effect means you accept the updated
          Terms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">16. Governing law</h2>
        <p>
          These Terms are governed by the laws of India. Courts in Udupi, Karnataka have
          exclusive jurisdiction over any disputes, subject to any rights you have under
          applicable consumer law.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">17. Contact</h2>
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
