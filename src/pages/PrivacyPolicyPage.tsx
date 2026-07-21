import { BackButton } from "@/components/BackButton";

const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
      <div className="container flex items-center gap-2 h-14">
        <BackButton />
        <h1 className="font-heading text-lg font-bold">Privacy Notice</h1>
      </div>
    </header>
    <main className="container max-w-2xl py-8 space-y-5 text-sm leading-relaxed text-foreground">
      <p className="text-xs text-muted-foreground">Last updated: 20 July 2026</p>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">1. Who we are</h2>
        <p>
          <strong>PaddleUp Manipal</strong> ("we", "us", "our") runs the PaddleUp Manipal
          website and digital booking platform, through which we sell Digital Access Passes
          and related digital services. We are the data controller for the personal data
          described in this notice.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">2. What we collect and why</h2>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>
            <strong>Account data</strong> — name, phone number, username, optional email,
            optional Google profile info, gender, skill level, avatar. Used to create your
            account, log you in, and personalise the Service. Legal basis: performance of a
            contract; legitimate interests.
          </li>
          <li>
            <strong>Booking data</strong> — court, date, time, price, payment method, booking
            status. Used to reserve and manage your slot and to reconcile payments. Legal
            basis: contract.
          </li>
          <li>
            <strong>Community data</strong> — profile info, chat messages, follows, match
            history, ELO rating, tournament participation. Used to run community features you
            choose to use. Legal basis: contract; legitimate interests.
          </li>
          <li>
            <strong>Support and communications</strong> — messages you send us. Used to help
            you and improve the Service. Legal basis: legitimate interests.
          </li>
          <li>
            <strong>Usage and device data</strong> — IP address, device type, browser, pages
            visited, actions taken, approximate location. Used for security, fraud prevention
            and product improvement. Legal basis: legitimate interests.
          </li>
        </ul>
        <p className="mt-2">
          We do not collect card numbers, UPI IDs, or bank details ourselves — those are
          handled by Paddle.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">3. Who we share it with</h2>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>
            <strong>Paddle</strong> — our Merchant of Record, for processing payments,
            subscription management, tax compliance, invoicing and fraud prevention.
          </li>
          <li>
            <strong>Hosting and infrastructure providers</strong> — for running our website,
            database and authentication.
          </li>
          <li>
            <strong>Google</strong> — if you choose to sign in with a Google account.
          </li>
          <li>
            <strong>Other players</strong> — your public profile (username, display name,
            avatar, skill level, ELO, match stats) and chat room content are visible to other
            players in the community.
          </li>
          <li>
            <strong>Professional advisers and authorities</strong> — where necessary to comply
            with law or protect our rights.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">4. How long we keep it</h2>
        <p>
          Account and booking data is kept for as long as your account is active and for a
          reasonable period afterwards to meet legal, accounting and fraud-prevention
          obligations. Chat messages are kept for the lifetime of the associated room. We
          delete or anonymise data when it is no longer needed.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">5. Your rights</h2>
        <p>
          Subject to applicable law, you can ask us to access, correct, delete, restrict, or
          port your personal data, object to certain processing, or withdraw consent where we
          rely on it. You can also complain to your local data protection authority. To
          exercise any right, message us on Instagram{" "}
          <a
            href="https://www.instagram.com/paddleup.manipal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            @paddleup.manipal
          </a>
          . We aim to respond within 30 days.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">6. Security</h2>
        <p>
          We use appropriate technical and organisational measures — including encryption in
          transit, access controls, and row-level security in our database — to protect your
          personal data. No system is 100% secure, so please also keep your login credentials
          safe.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">7. Cookies</h2>
        <p>
          We use essential cookies and similar technologies to keep you logged in, remember
          your preferences, and secure the Service. We do not currently run advertising
          cookies. You can manage cookies in your browser settings; disabling essential
          cookies may break parts of the Service.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">8. International transfers</h2>
        <p>
          Some of our providers (including Paddle and cloud hosts) may process personal data
          outside India. Where they do, we rely on appropriate safeguards such as standard
          contractual clauses or equivalent mechanisms.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">9. Children</h2>
        <p>
          The Service is not intended for children under 13. If you believe a child has
          provided us personal data, contact us and we will delete it.
        </p>
      </section>

      <section>
        <h2 className="font-heading font-bold text-base mb-1">10. Changes to this notice</h2>
        <p>
          We may update this notice from time to time. The "Last updated" date at the top will
          reflect the latest version. Material changes will be highlighted on the Service.
        </p>
      </section>
    </main>
  </div>
);

export default PrivacyPolicyPage;
