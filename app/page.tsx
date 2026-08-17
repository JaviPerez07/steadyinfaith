const checkoutUrl = process.env.CHECKOUT_URL || "https://buy.stripe.com/4gM4gz4rxfXY58b8kL9fW0M";

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const Check = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m3.5 10.5 4 4 9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// The accessible name has to start with the visible text, or voice-control users
// cannot activate the button by reading it out loud.
function BuyButton({ children = "BEGIN THE RESET" }: { children?: string }) {
  return <a className="buy-button" href={checkoutUrl} aria-label={`${children} — one-time payment of 9 dollars`}><span>{children}</span><Arrow /></a>;
}

export default function Home() {
  const ritual = [
    ["01", "SCRIPTURE", "One focused passage. No random page-opening. No overwhelm."],
    ["02", "REFLECTION", "A clear thought that connects ancient truth to your actual life."],
    ["03", "PRAYER", "Words to begin when you do not know what to say to God."],
    ["04", "ACTION", "One small decision that moves faith from belief into practice."],
  ];

  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Steady in Faith home">
          <span className="cross-mark" aria-hidden="true" />
          <span>STEADY<br /><b>IN FAITH</b></span>
        </a>
        <nav aria-label="Main navigation"><a href="#method">THE METHOD</a><a href="#inside">WHAT YOU GET</a><a href="#community">90-DAY COMMUNITY</a></nav>
        <a className="topbar-cta" href={checkoutUrl}>START FOR $9 <Arrow /></a>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="/faith-reset-jesus-hero-celestial.webp" alt="" width={1672} height={941} fetchPriority="high" decoding="async" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="celestial-rays" aria-hidden="true" />
        <div className="celestial-mist" aria-hidden="true" />
        <div className="red-orbit orbit-one" aria-hidden="true" />
        <div className="red-orbit orbit-two" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-label"><i /> THE 30-DAY FAITH RESET</div>
          <h1><span>30 DAYS TO</span><span>REBUILD YOUR</span><strong>WALK WITH JESUS.</strong></h1>
          <p>You do not need another burst of motivation. You need a daily rhythm centered on Jesus Christ—Scripture, reflection, prayer and action—in just ten intentional minutes.</p>
          <div className="hero-action">
            <BuyButton />
            <div className="hero-price"><span>$17</span><b>$9</b><small>FOUNDING PRICE · ONE TIME</small></div>
          </div>
          <div className="hero-proof"><span><Check /> Instant digital access</span><span><Check /> 90 days in the community</span><span><Check /> Lifetime access to the materials</span></div>
        </div>

        <div className="hero-verse"><span>JAMES 4:8</span><p>“Draw near to God, and He will draw near to you.”</p></div>
        <div className="scroll-cue"><i /><span>SCROLL TO BEGIN</span></div>
      </section>

      <section className="signal-strip" aria-label="Program facts">
        <div><b>30</b><span>GUIDED DAYS</span></div><i />
        <div><b>10</b><span>MINUTES A DAY</span></div><i />
        <div><b>90</b><span>COMMUNITY DAYS INCLUDED</span></div>
      </section>

      <section className="manifesto">
        <div className="manifesto-index">01 / THE TRUTH</div>
        <div className="manifesto-copy">
          <p className="red-kicker">YOU ARE NOT TOO FAR GONE</p>
          <h2>Faith does not disappear overnight.<br />It fades in the <em>days we stop returning.</em></h2>
          <div className="manifesto-body">
            <p>You mean to pray. You want to read Scripture. Then life gets loud, the days stack up and guilt makes returning feel harder than it should.</p>
            <p>This is not a challenge built on pressure or spiritual performance. It is a clear path back to Jesus Christ: one passage, one reflection, one honest prayer and one action—every day for thirty days.</p>
          </div>
        </div>
        <div className="giant-ten" aria-hidden="true"><b>10</b><span>MINUTES<br />CAN RESET<br />A DAY</span></div>
      </section>

      <section className="ritual" id="method">
        <div className="section-intro">
          <span>02 / THE DAILY RITUAL</span>
          <h2>FOUR MOVES.<br /><em>ONE DAILY RETURN.</em></h2>
          <p>Simple enough for your busiest day. Deep enough to change the way you live it.</p>
        </div>
        <div className="ritual-list">
          {ritual.map(([number, title, copy]) => (
            <article key={number}>
              <span className="ritual-number">{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="ritual-cross">†</span>
            </article>
          ))}
        </div>
      </section>

      <section className="inside" id="inside">
        <div className="product-stage" aria-hidden="true">
          <div className="product-halo" />
          <div className="workbook">
            <span className="workbook-brand">STEADY IN FAITH</span>
            <i className="book-cross" />
            <p>THE</p><h3>30-DAY<br /><b>FAITH RESET</b></h3>
            <small>SCRIPTURE · REFLECTION · PRAYER · ACTION</small>
            <span className="workbook-foot">A GUIDED RETURN TO WHAT MATTERS</span>
          </div>
          <div className="sample-sheet sheet-one"><span>DAY 08</span><h4>TRUST BEFORE<br />YOU UNDERSTAND</h4><i /><i /><i /></div>
          <div className="sample-sheet sheet-two"><span>DAY 21</span><h4>LIVE WHAT<br />YOU BELIEVE</h4><div className="tracker"><i /><i /><i /><i /><i /></div></div>
        </div>

        <div className="inside-copy">
          <span className="section-index">03 / INSIDE THE RESET</span>
          <p className="red-kicker">NOT ANOTHER FORGETTABLE EBOOK</p>
          <h2>A guided experience built to be <em>lived</em>, not collected.</h2>
          <ul>
            <li><Check /><span><b>30 complete daily devotionals</b><small>Scripture, reflection, guided prayer and a practical action.</small></span></li>
            <li><Check /><span><b>Printable reflection journal</b><small>Prompts that turn reading into a personal conversation with God.</small></span></li>
            <li><Check /><span><b>Consistency tracker</b><small>A visible record of your return—without shame when life happens.</small></span></li>
            <li><Check /><span><b>90 days of community access—free</b><small>Complete the journey with encouragement, prayer and honest discussion centered on Jesus Christ.</small></span></li>
          </ul>
        </div>
      </section>

      <section className="journey">
        <div className="journey-heading"><span>04 / THE JOURNEY</span><h2>YOU WILL NOT BE<br />THE SAME ON <em>DAY 30.</em></h2></div>
        <div className="weeks">
          {[
            ["WEEK 01", "RETURN", "Leave guilt behind. Make space. Begin again."],
            ["WEEK 02", "ROOT", "Learn to hear truth above fear and noise."],
            ["WEEK 03", "PRACTICE", "Bring faith into habits, choices and relationships."],
            ["WEEK 04", "CONTINUE", "Build a rhythm that survives beyond the program."],
          ].map(([week, title, text], index) => <article key={week}><span>0{index + 1}</span><small>{week}</small><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="community" id="community">
        <div className="community-rings" aria-hidden="true"><i /><i /><i /><b>†</b></div>
        <div className="community-copy">
          <span>05 / YOUR 90-DAY COMMUNITY</span>
          <div className="community-badge"><strong>90</strong><span>DAYS<br />INCLUDED<br /><b>$0 EXTRA</b></span></div>
          <h2>FOLLOW JESUS.<br />BUILD THE HABIT.<br /><em>DO IT TOGETHER.</em></h2>
          <p>The workbook gives you the path. The Steady in Faith community helps you keep walking it. Every purchase includes <b>90 days of private community access</b> to share reflections, ask honest questions and grow alongside people choosing to follow Jesus Christ more intentionally.</p>
          <div className="community-benefits">
            <div><b>01</b><span><strong>Daily check-ins</strong><small>Turn the 30-day reset into a rhythm you actually keep.</small></span></div>
            <div><b>02</b><span><strong>Prayer &amp; honest conversation</strong><small>A respectful space for real questions—without pressure or performance.</small></span></div>
            <div><b>03</b><span><strong>Weekly Jesus-centered discussions</strong><small>Go deeper into Scripture and its application to everyday life.</small></span></div>
          </div>
          <div className="community-tags"><span>PRIVATE COMMUNITY</span><span>90 DAYS INCLUDED</span><span>NO RECURRING CHARGE TODAY</span></div>
          <small>Your $9 purchase is one-time. You will not be enrolled in a recurring subscription. After the included 90 days, continued community membership may be offered separately and is always optional. This community does not replace your local church.</small>
        </div>
      </section>

      <section className="final-offer" id="checkout">
        <div className="offer-glow" aria-hidden="true" />
        <span className="final-cross" aria-hidden="true">†</span>
        <p className="red-kicker">FOUNDING MEMBER PRICE</p>
        <h2>YOUR NEXT 30 DAYS<br />CAN BEGIN <em>TODAY.</em></h2>
        <p className="offer-sub">The complete Jesus-centered reset, journal, tracker and 90 days of private community access.</p>
        <div className="price-display"><span>$17</span><strong>$9</strong><small>USD · ONE-TIME PAYMENT</small></div>
        <BuyButton>GET THE 30-DAY FAITH RESET</BuyButton>
        <div className="offer-includes"><span><Check /> Instant digital materials</span><span><Check /> 90 community days included</span><span><Check /> No recurring charge today</span></div>
      </section>

      <section className="faq">
        <div className="faq-title"><span>06 / BEFORE YOU BEGIN</span><h2>HONEST<br /><em>ANSWERS.</em></h2></div>
        <div className="faq-items">
          <details><summary>Is this tied to a specific denomination?</summary><p>No. It is Scripture-centered and designed for Christians from different church backgrounds, as well as people sincerely exploring faith in Jesus.</p></details>
          <details><summary>How much time will I need each day?</summary><p>About ten focused minutes. You can stay longer, but the program is intentionally realistic enough for busy days.</p></details>
          <details><summary>What exactly will I receive?</summary><p>A digital 30-day Jesus-centered workbook, reflection journal, consistency tracker and 90 days of access to the private Steady in Faith community.</p></details>
          <details><summary>How do I enter the community?</summary><p>Your purchase includes private access instructions for the Steady in Faith community. The included 90-day period begins when your community access is activated.</p></details>
          <details><summary>Will I be charged every month?</summary><p>No. This founding offer is a single $9 payment. There is no automatic community subscription. After your included 90 days, any continued membership option will be separate, clearly priced and completely optional.</p></details>
          <details><summary>Does this replace church, pastoral care or therapy?</summary><p>No. It is a personal faith-building resource and peer community—not a church, counseling service or medical treatment.</p></details>
        </div>
      </section>

      <footer>
        <a className="wordmark" href="#top"><span className="cross-mark" /><span>STEADY<br /><b>IN FAITH</b></span></a>
        <p>BIBLICAL WISDOM FOR EVERYDAY LIFE.</p>
        <span>© 2026 · DIGITAL FAITH RESOURCE</span>
      </footer>
    </main>
  );
}
