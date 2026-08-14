import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MiniGame from './MiniGame'

gsap.registerPlugin(ScrollTrigger)

type Package = {
  code: string
  name: string
  duration: string
  price: string
  intro: string
  features: string[]
}

const packages: Package[] = [
  {
    code: '01',
    name: 'Quick Swing-By',
    duration: '30 MIN',
    price: '$125',
    intro: 'A fast, unforgettable pop-in for photos, cake, and one heroic surprise.',
    features: ['Grand entrance', 'Meet + greet', 'Hero poses and photos', 'Birthday song', 'Mini hero challenge'],
  },
  {
    code: '02',
    name: 'Hero Training Party',
    duration: '60 MIN',
    price: '$225',
    intro: 'The full neighborhood-hero experience. High energy, highly interactive, parent approved.',
    features: ['Grand entrance', 'Superhero School', 'Spidey Says', 'Interactive challenges', 'Photos + cake time'],
  },
  {
    code: '03',
    name: 'Ultimate Hero Mission',
    duration: '90 MIN',
    price: '$300',
    intro: 'More time, more games, and a complete mission built around the birthday hero.',
    features: ['Everything in Hero Training', 'Extended mission', 'Hero oath', 'Individual hero moments', 'Cake or present assist'],
  },
]

const missions = [
  { number: '01', title: 'THE ENTRANCE', copy: 'A surprise arrival with full hero energy. Cameras out. Jaws dropped.' },
  { number: '02', title: 'HERO SCHOOL', copy: 'Kids train their speed, focus, poses, and responsibility to become neighborhood heroes.' },
  { number: '03', title: 'SPIDEY SAYS', copy: 'A quick-thinking movement game where listening is the real superpower.' },
]

function PixelSpider() {
  return (
    <svg className="pixel-spider" viewBox="0 0 64 64" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M24 4h16v8h8v8h8v8h-8v-4h-8v8h8v8h8v8h-8v-4h-8v12H24V44h-8v4H8v-8h8v-8h8v-8h-8v4H8v-8h8v-8h8V4Z" fill="currentColor" />
      <path d="M28 12h8v12h-8zM28 36h8v12h-8z" fill="#080d17" />
    </svg>
  )
}

function App() {
  const root = useRef<HTMLDivElement>(null)
  const stickerTaps = useRef(0)
  const stickerTimer = useRef<number | null>(null)
  const [activePackage, setActivePackage] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [stickerPulse, setStickerPulse] = useState(0)
  const [stickerHint, setStickerHint] = useState('')

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = reduceMotion ? null : new Lenis({ duration: 1.1, smoothWheel: true })
    let frame = 0

    const raf = (time: number) => {
      lenis?.raf(time)
      frame = requestAnimationFrame(raf)
    }
    if (lenis) frame = requestAnimationFrame(raf)

    const ctx = gsap.context(() => {
      if (reduceMotion) return

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from('.site-header', { y: -30, opacity: 0, duration: 0.7 })
        .from('.hero-kicker', { y: 20, opacity: 0, duration: 0.5 }, '-=.25')
        .from('.hero-title .line', { yPercent: 110, stagger: 0.09, duration: 0.9 }, '-=.2')
        .from('.hero-copy, .hero-actions, .hero-proof', { y: 20, opacity: 0, stagger: 0.1, duration: 0.55 }, '-=.4')
        .from('.hero-photo', { scale: 1.08, opacity: 0, duration: 1.1 }, '-=1')
        .from('.hero-badge', { scale: 0, rotate: -18, duration: 0.6, ease: 'back.out(1.8)' }, '-=.4')

      gsap.to('.hero-photo', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 48,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 86%', once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('.mission-card').forEach((card, index) => {
        gsap.from(card, {
          x: index % 2 ? 60 : -60,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        })
      })
    }, root)

    return () => {
      cancelAnimationFrame(frame)
      lenis?.destroy()
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (!gameOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [gameOpen])

  const currentPackage = packages[activePackage]

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const tapSticker = () => {
    if (stickerTimer.current) window.clearTimeout(stickerTimer.current)
    stickerTaps.current += 1
    setStickerPulse((current) => current + 1)

    const remaining = 5 - stickerTaps.current
    setStickerHint(remaining <= 2 && remaining > 0 ? `${remaining} MORE...` : '')

    if (stickerTaps.current >= 5) {
      stickerTaps.current = 0
      setStickerHint('MISSION FOUND!')
      window.history.pushState({ miniGame: true }, '', '#neighborhood-brawl')
      window.setTimeout(() => setGameOpen(true), 180)
      return
    }

    stickerTimer.current = window.setTimeout(() => {
      stickerTaps.current = 0
      setStickerHint('')
    }, 2800)
  }

  const closeGame = () => {
    setGameOpen(false)
    setStickerHint('')
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  return (
    <div ref={root} className="site-shell">
      <a className="skip-link" href="#main">Skip to the mission</a>

      <header className="site-header">
        <button className="brand" onClick={() => scrollTo('#top')} aria-label="Spider for Hire home">
          <span className="brand-mark"><PixelSpider /></span>
          <span>SPIDER<br /><b>FOR HIRE</b></span>
        </button>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav">
          {menuOpen ? 'CLOSE' : 'MENU'}
        </button>

        <nav id="main-nav" className={menuOpen ? 'nav-open' : ''} aria-label="Main navigation">
          <button onClick={() => scrollTo('#missions')}>THE MISSION</button>
          <button onClick={() => scrollTo('#packages')}>PACKAGES</button>
          <button onClick={() => scrollTo('#reels')}>SIGHTINGS</button>
          <a className="social-link" href="https://www.instagram.com/stlouisspiderman/" target="_blank" rel="noreferrer" aria-label="Spider for Hire on Instagram">INSTAGRAM ↗</a>
          <button className="nav-cta" onClick={() => scrollTo('#booking')}>BOOK A VISIT</button>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="web-grid" aria-hidden="true" />
          <div className="hero-content">
            <p className="hero-kicker"><span className="status-dot" /> NOW ACCEPTING MISSIONS</p>
            <h1 className="hero-title" aria-label="Your friendly neighborhood hero for hire">
              <span className="title-mask"><span className="line">YOUR FRIENDLY</span></span>
              <span className="title-mask"><span className="line outline">NEIGHBORHOOD</span></span>
              <span className="title-mask"><span className="line red">HERO FOR HIRE.</span></span>
            </h1>
            <p className="hero-copy">Big hero energy. Small-business prices. Birthday parties, special visits, and community missions your little hero won’t stop talking about.</p>
            <div className="hero-actions">
              <button className="pixel-button primary" onClick={() => scrollTo('#packages')}>CHOOSE A MISSION <span>→</span></button>
              <button className="text-button" onClick={() => scrollTo('#reels')}>WATCH THE REEL <span>▶</span></button>
            </div>
            <div className="hero-proof">
              <div><strong>FROM $125</strong><span>AFFORDABLE VISITS</span></div>
              <div><strong>100% IN CHARACTER</strong><span>FROM HELLO TO GOODBYE</span></div>
              <div><strong>ALLEGEDLY #1</strong><span>YOUR FRIENDS SAID IT, NOT ME</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Spider for Hire striking a dramatic hero pose">
            <img className="hero-photo" src="/media/hero-red-wall-edited.webp" alt="Spider for Hire striking a dynamic crouched pose against a red wall" />
            <div className="halftone" aria-hidden="true" />
            <div className="hero-badge"><small>THE PEOPLE HAVE SPOKEN</small><strong>BEST IN TOWN*</strong><span>*allegedly</span></div>
            <span className="photo-coordinate">HERO FILE 01 // ST. LOUIS</span>
            <button
              className={`hero-game-sticker sticker-pulse-${stickerPulse % 2}`}
              onClick={tapSticker}
              aria-label="Spider sticker"
              title="Something feels... interactive."
            >
              <span className="sticker-icon"><PixelSpider /></span>
              <strong>WEB<br />TESTED</strong>
              {stickerHint && <small>{stickerHint}</small>}
            </button>
          </div>

        </section>

        <section className="ticker" aria-label="Services ticker">
          <div>★ BIRTHDAY PARTIES ★ HERO TRAINING ★ SPIDEY SAYS ★ HOSPITAL VISITS ★ COMMUNITY EVENTS ★ GRAND ENTRANCES ★ PHOTO OPS ★ </div>
        </section>

        <section className="intro-section" id="missions">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">// HERE’S THE GAME PLAN</p>
            <h2>MORE THAN<br />A COSTUME.</h2>
            <p>Every visit is an interactive story. I arrive with a mission, keep the kids moving, and make the guest of honor feel like the real hero.</p>
          </div>

          <div className="mission-list">
            {missions.map((mission) => (
              <article className="mission-card" key={mission.number}>
                <span className="mission-number">{mission.number}</span>
                <div><h3>{mission.title}</h3><p>{mission.copy}</p></div>
                <span className="mission-arrow">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="party-sightings" aria-labelledby="party-sightings-title">
          <div className="sightings-heading" data-reveal>
            <p className="eyebrow">// REAL PARTIES. REAL REACTIONS.</p>
            <h2 id="party-sightings-title">THE KIDS<br />GET IT.</h2>
            <p>The costume gets their attention. The high-fives, games, and one-on-one hero moments are what they remember.</p>
            <a className="instagram-button" href="https://www.instagram.com/stlouisspiderman/" target="_blank" rel="noreferrer">FOLLOW @STLOUISSPIDERMAN <span>↗</span></a>
          </div>
          <div className="party-photo-grid">
            <figure className="party-photo party-photo-wide" data-reveal>
              <img src="/media/party-high-five.jpg" alt="Spider for Hire sharing a high-five with a young hero at a party" />
              <figcaption><span>01</span> HERO-TO-HERO HIGH FIVE</figcaption>
            </figure>
            <figure className="party-photo" data-reveal>
              <img src="/media/party-hug.jpg" alt="A smiling child in a spider costume hugging Spider for Hire" />
              <figcaption><span>02</span> A REAL HERO MOMENT</figcaption>
            </figure>
            <figure className="party-photo" data-reveal>
              <img src="/media/party-gift.jpg" alt="Spider for Hire presenting a gift to a young party guest" />
              <figcaption><span>03</span> MISSION REWARD</figcaption>
            </figure>
          </div>
        </section>

        <section className="packages-section" id="packages">
          <div className="section-heading light" data-reveal>
            <p className="eyebrow">// SELECT YOUR MISSION</p>
            <h2>PARTY<br />PACKAGES</h2>
            <p>Clear prices. No supervillain surprise fees. Travel is included within 20 miles.</p>
          </div>

          <div className="mission-selector" data-reveal>
            <div className="selector-tabs" role="tablist" aria-label="Party packages">
              {packages.map((item, index) => (
                <button
                  key={item.code}
                  role="tab"
                  aria-selected={activePackage === index}
                  onClick={() => setActivePackage(index)}
                  className={activePackage === index ? 'active' : ''}
                >
                  <span>{item.code}</span>{item.name}
                  {index === 1 && <em>MOST POPULAR</em>}
                </button>
              ))}
            </div>

            <div className="package-screen" role="tabpanel">
              <div className="screen-top"><span>MISSION FILE // {currentPackage.code}</span><span>STATUS: AVAILABLE</span></div>
              <div className="package-main">
                <div className="package-copy">
                  <span className="duration">{currentPackage.duration}</span>
                  <h3>{currentPackage.name}</h3>
                  <p>{currentPackage.intro}</p>
                  <ul>{currentPackage.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                </div>
                <div className="package-price">
                  <small>MISSION RATE</small>
                  <strong>{currentPackage.price}</strong>
                  <span>starting price</span>
                  <button className="pixel-button yellow" onClick={() => scrollTo('#booking')}>REQUEST THIS MISSION →</button>
                </div>
              </div>
            </div>
          </div>

          <div className="custom-rates" data-reveal>
            <span>NEED A CUSTOM MISSION?</span>
            Schools, festivals, and business events start at <strong>$300/hour</strong>. Community and hospital visits are arranged by request.
          </div>
        </section>

        <section className="reels-section" id="reels">
          <div className="section-heading" data-reveal>
            <p className="eyebrow">// CAUGHT IN ACTION</p>
            <h2>MISSION<br />REEL</h2>
            <p>Athletic enough to sell the landing. Goofy enough to keep the party laughing.</p>
          </div>
          <div className="reel-grid">
            <figure className="reel-card tall" data-reveal>
              <video src="/media/reel-landing.mp4" muted loop playsInline autoPlay aria-label="Web hero performing an athletic landing" />
              <figcaption><span>01</span> SUPERHERO LANDING</figcaption>
            </figure>
            <figure className="reel-card" data-reveal>
              <img src="/media/lamp-crouch.jpg" alt="Web hero crouched high on a downtown clock tower" />
              <figcaption><span>02</span> NEIGHBORHOOD PATROL</figcaption>
            </figure>
            <figure className="reel-card" data-reveal>
              <video src="/media/reel-workout.mp4" muted loop playsInline autoPlay aria-label="Web hero showing a playful workout routine" />
              <figcaption><span>03</span> HERO TRAINING</figcaption>
            </figure>
          </div>
        </section>

        <section className="community-section">
          <div className="community-image" data-reveal>
            <img src="/media/alley-collage.jpg" alt="Collage of the web hero striking action poses" />
            <span className="stamp">COMMUNITY<br />HERO</span>
          </div>
          <div className="community-copy" data-reveal>
            <p className="eyebrow">// WITH GREAT POWER...</p>
            <h2>SOME MISSIONS<br />MEAN MORE.</h2>
            <p>I’ve had the honor of visiting a young hero after open-heart surgery. Hospitals, nonprofits, schools, and families facing a hard season can reach out about a special visit.</p>
            <p className="quiet">Reduced-rate, sponsored, and complimentary visits may be available depending on the mission and schedule.</p>
            <button className="text-button dark" onClick={() => scrollTo('#booking')}>TELL ME ABOUT THE MISSION <span>→</span></button>
          </div>
        </section>

        <section className="quote-section">
          <span className="quote-mark">“</span>
          <blockquote>THE BEST SPIDER-MAN<br />IMPERSONATOR IN TOWN.</blockquote>
          <p>— SEVERAL PEOPLE, UNPROMPTED</p>
          <span className="allegedly">ALLEGEDLY</span>
        </section>

        <section className="booking-section" id="booking">
          <div className="booking-copy" data-reveal>
            <p className="eyebrow">// SEND THE HERO SIGNAL</p>
            <h2>LET’S MAKE<br />THEIR DAY.</h2>
            <p>Tell me what you’re planning. This opens a ready-to-send email with all your mission details. No payment is collected yet.</p>
            <div className="email-card"><span>DIRECT LINE</span><a href="mailto:jimmie@altaredalchemie.com">jimmie@altaredalchemie.com</a></div>
          </div>

          <form className="booking-form" data-reveal onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            const subject = encodeURIComponent(`Hero mission request: ${data.get('eventType')} on ${data.get('date')}`)
            const body = encodeURIComponent([
              `Parent/organizer: ${data.get('name')}`,
              `Event type: ${data.get('eventType')}`,
              `Preferred package: ${data.get('package')}`,
              `Date: ${data.get('date')}`,
              `Location: ${data.get('location')}`,
              `Guest of honor age: ${data.get('age')}`,
              `Number of children: ${data.get('count')}`,
              '',
              `Mission notes: ${data.get('notes')}`,
            ].join('\n'))
            window.location.href = `mailto:jimmie@altaredalchemie.com?subject=${subject}&body=${body}`
          }}>
            <label>YOUR NAME<input name="name" required autoComplete="name" placeholder="Peter's mom, MJ" /></label>
            <div className="form-row">
              <label>EVENT TYPE<select name="eventType" defaultValue="Birthday party"><option>Birthday party</option><option>Hospital or community visit</option><option>School or festival</option><option>Other special event</option></select></label>
              <label>MISSION DATE<input name="date" type="date" required /></label>
            </div>
            <label>PACKAGE<select name="package" defaultValue="Hero Training Party — $225"><option>Quick Swing-By — $125</option><option>Hero Training Party — $225</option><option>Ultimate Hero Mission — $300</option><option>Custom mission</option></select></label>
            <div className="form-row three">
              <label>LOCATION<input name="location" required placeholder="City or venue" /></label>
              <label>AGE<input name="age" type="number" min="1" max="99" placeholder="7" /></label>
              <label>KIDS<input name="count" type="number" min="1" max="200" placeholder="12" /></label>
            </div>
            <label>MISSION NOTES<textarea name="notes" rows={4} placeholder="Tell me about the birthday hero, timing, and any surprises..." /></label>
            <button className="pixel-button primary wide" type="submit">PREPARE MY MISSION EMAIL →</button>
          </form>
        </section>

        <section className="faq-section">
          <div className="section-heading light" data-reveal><p className="eyebrow">// INTEL</p><h2>GOOD TO<br />KNOW</h2></div>
          <div className="faq-list" data-reveal>
            <details><summary>WHAT AGES ARE BEST?</summary><p>Ages 4–10 tend to get the most from the games, but the visit can be adjusted for younger fans, teens, and grown-up enthusiasts.</p></details>
            <details><summary>HOW MANY KIDS CAN JOIN?</summary><p>The listed packages work best for up to 15 children. Larger groups are welcome with a custom event plan.</p></details>
            <details><summary>DO YOU TRAVEL?</summary><p>Travel within 20 miles is included. Missions farther away may include a mileage fee agreed upon before booking.</p></details>
            <details><summary>IS A DEPOSIT REQUIRED?</summary><p>A booking policy and deposit can be added after the initial inquiry. No money is collected through this preview website.</p></details>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand"><PixelSpider /><span>SPIDER FOR HIRE</span></div>
        <p>Independent character entertainment. Not affiliated with, endorsed by, or sponsored by Marvel or Disney.</p>
        <div className="footer-links">
          <a href="mailto:jimmie@altaredalchemie.com">jimmie@altaredalchemie.com</a>
          <a href="https://www.instagram.com/stlouisspiderman/" target="_blank" rel="noreferrer">@stlouisspiderman ↗</a>
        </div>
        <span>© {new Date().getFullYear()} • WITH GREAT FUN COMES GREAT RESPONSIBILITY</span>
      </footer>

      {gameOpen && <MiniGame onExit={closeGame} />}
    </div>
  )
}

export default App
