import { useEffect, useState } from 'react'
import './agreement.css'

const PAYMENT_LINK = 'https://buy.stripe.com/8x29AS8dT3HY3543zZeUU0j'
const AGREEMENT_VERSION = '2026-11-14'

type AgreementSection = {
  number: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const agreementSections: AgreementSection[] = [
  {
    number: '1',
    title: 'Booking and Scope of Services',
    paragraphs: [
      'The Performer will provide the package and activities identified in the written quote, confirmation email, and payment record for the booking. Those event details are incorporated into this agreement. The Performer may make reasonable changes to the order, format, or length of individual activities to match the children, venue, weather, accessibility needs, or safety conditions. The Performer does not guarantee a particular reaction from any child or guest.',
      'The date is reserved only after the Client accepts this agreement, the reservation payment clears, and the Performer sends written confirmation. A payment made before written confirmation is subject to availability and will be refunded if the Performer cannot accept the booking.',
    ],
  },
  {
    number: '2',
    title: 'Payment Terms',
    paragraphs: [
      'The Client will pay the event fee and any approved travel, parking, overtime, or add-on charges shown in the written booking details. The reservation payment is credited toward the total fee. Unless the booking details state otherwise, the remaining balance is due seven calendar days before the event. The Performer may decline to perform if the balance has not been paid when due.',
      'If the Client disputes a charge, the Client will first contact the Performer at jimmie@altaredalchemie.com and allow five business days for a response when practical. Nothing in this agreement waives a cardholder right that cannot legally be waived.',
    ],
  },
  {
    number: '3',
    title: 'Client Cancellation and Rescheduling',
    paragraphs: [
      'The reservation payment compensates the Performer for holding the date and turning away other work. It is nonrefundable after the Performer confirms the booking, except when this agreement expressly requires a refund.',
    ],
    bullets: [
      'Cancellation at least 14 calendar days before the event: the reservation payment is retained and any additional amount paid is refunded.',
      'Cancellation 8 to 13 calendar days before the event: 50 percent of the total event fee is due, and any amount paid above that figure is refunded.',
      'Cancellation 7 or fewer calendar days before the event: the full event fee is due.',
      'With at least 14 calendar days notice, the Client may request one transfer of the reservation payment to an available date within six months. A second change, late change, or change outside that period may be treated as a cancellation.',
    ],
  },
  {
    number: '4',
    title: 'Performer Cancellation and Unavoidable Events',
    paragraphs: [
      "If illness, injury, unsafe travel, severe weather, government action, venue closure, family emergency, or another event beyond reasonable control prevents the performance, the parties will first try to reschedule within six months. If the Performer cancels and the parties cannot agree on a new date, the Performer will refund all amounts paid. That refund is the Client's exclusive monetary remedy for a Performer cancellation, except where applicable law requires otherwise.",
      'For outdoor events, the Client must provide a safe indoor alternative when conditions make outdoor performance unsafe. The Performer may stop, shorten, or relocate activities when reasonably necessary for safety. Amounts paid are not refundable when the Client declines an available safe alternative.',
    ],
  },
  {
    number: '5',
    title: 'Timing Event Changes and Overtime',
    paragraphs: [
      'The Client will provide accurate directions, parking information, access instructions, and a contact who can answer the phone before and during arrival. Delays caused by the Client, guests, or venue do not extend the scheduled end time unless the Performer agrees and is available. Approved overtime will be billed in 15-minute increments at a rate agreed in writing before overtime begins.',
      "If the Performer arrives late, the Performer will use reasonable efforts to provide the full booked time. If that is not possible, the Client will receive a proportional refund for time not performed. Changes to the date, location, duration, package, or expected attendance require the Performer's written approval and may change the price.",
    ],
  },
  {
    number: '6',
    title: 'Adult Supervision and Participant Conduct',
    paragraphs: [
      'A responsible adult must remain present and attentive throughout the performance. The Performer is an entertainer, not a babysitter or childcare provider, and will not be left in sole supervision of any child. The Client is responsible for guests, crowd control, venue rules, and obtaining permission from the venue and parents or guardians when required.',
    ],
    bullets: [
      'Guests must not pull the mask or costume, strike or climb on the Performer, attempt unsafe stunts, use weapons, or interfere with the Performer or equipment.',
      'Pets must be secured away from the performance area unless approved otherwise in writing.',
      'The Client will disclose any accessibility, allergy, medical, sensory, behavioral, or mobility need that may require a reasonable change to the activities, without disclosing more medical information than necessary.',
      'The Performer may pause or end the performance if a person, animal, object, or condition creates a safety risk, or if harassment, threats, intoxication, illegal conduct, or repeated interference continues after a reasonable request to stop. No refund is due when the Client or a guest causes early termination.',
    ],
  },
  {
    number: '7',
    title: 'Activities and Assumption of Ordinary Risk',
    paragraphs: [
      'Games may include walking, running, jumping, posing, dancing, and other age-appropriate movement. Participation is voluntary. The Client will provide a clear, dry, well-lit performance area free from obstacles and will stop any participant who cannot safely join an activity.',
      "To the extent permitted by law, the Client accepts the ordinary risks inherent in voluntary movement activities and releases the Performer from claims caused solely by those inherent risks or by conditions under the Client's or venue's control. This section does not release claims caused by the Performer's negligence, gross negligence, recklessness, willful misconduct, or any liability that cannot legally be waived.",
    ],
  },
  {
    number: '8',
    title: 'Photography Video and Personal Use',
    paragraphs: [
      "The Client and guests may photograph or record the performance for personal, noncommercial use and may share those recordings on personal social-media accounts. They may not sell the recordings, use them in paid advertising, train an artificial-intelligence system with them, imply an endorsement, or license them to another business without the Performer's written permission.",
      "The Performer will not use a recognizable image, voice, or video of a minor for marketing unless that minor's parent or legal guardian has given separate written permission. Permission for one child does not cover other children or guests. Media permission is optional and is not a condition of booking.",
      "For a hospital, clinic, school, or similar facility, photography or recording also requires any separate approval required by the facility. The Performer will not intentionally publish a facility logo, patient information, medical information, or another person's identifiable image without appropriate permission.",
    ],
  },
  {
    number: '9',
    title: 'Property and Venue Responsibility',
    paragraphs: [
      "The Client is responsible for the venue, decorations, furniture, food, animals, equipment, and personal property at the event. The Performer is responsible for damage directly caused by the Performer's negligence. The Performer is not responsible for ordinary wear, accidental contact inherent in agreed activities, or damage caused by guests, venue conditions, or property not disclosed as fragile or hazardous.",
    ],
  },
  {
    number: '10',
    title: 'Independent Character Entertainment',
    paragraphs: [
      'Spider for Hire is an independent costumed entertainment service. It is not affiliated with, sponsored by, or endorsed by Marvel, Disney, Sony, or any other studio, publisher, or rights holder. The Client will not advertise the Performer as an official representative of a rights holder. Any character names supplied by the Client describe the requested theme only and do not create an affiliation or license.',
    ],
  },
  {
    number: '11',
    title: 'Indemnification and Limits on Liability',
    paragraphs: [
      "The Client will defend and indemnify the Performer against third-party claims, damages, and reasonable costs to the extent caused by the Client's breach of this agreement, lack of authority or permission, unsafe venue condition under the Client's control, or negligent or intentional act of the Client or a guest. This obligation does not apply to the extent a claim was caused by the Performer's negligence, gross negligence, recklessness, or willful misconduct.",
      "To the extent permitted by law, neither party is liable to the other for indirect, incidental, special, exemplary, or consequential damages arising only from cancellation or disappointment. Except for unpaid fees, indemnification obligations, fraud, willful misconduct, gross negligence, personal injury caused by negligence, or liability that cannot legally be limited, each party's total liability will not exceed the total event fee paid or payable.",
    ],
  },
  {
    number: '12',
    title: 'Disputes and Missouri Law',
    paragraphs: [
      'Before filing a claim, a party will send written notice describing the dispute and requested resolution. The parties will make a good-faith effort to resolve the dispute for at least 30 days after the notice is received. Either party may still seek emergency relief or file an eligible claim in small-claims court.',
      "Missouri law governs this agreement. A court proceeding that is not eligible for small-claims court must be brought in a state or federal court serving St. Louis County, Missouri. Each party will bear its own attorneys' fees unless a statute or court order provides otherwise.",
    ],
  },
  {
    number: '13',
    title: 'General Terms',
    paragraphs: [
      'This agreement, the written booking details, and any signed addendum are the entire agreement. If they conflict, a later written addendum signed by both parties controls. A change or waiver must be in writing. Email and an electronic-signature platform count as writing for this purpose.',
      "The Client may not transfer the booking to another person or commercial event without the Performer's written approval. If a provision is unenforceable, it will be limited only as much as necessary and the remaining provisions will continue in effect. A delay in enforcing a right does not waive that right.",
    ],
  },
  {
    number: '14',
    title: 'Electronic Signatures and Records',
    paragraphs: [
      "The parties agree to use electronic records and signatures. Checking the required agreement box at Stripe and submitting payment with the intent to agree counts as the Client's electronic signature when the checkout page clearly links to this agreement. The Stripe checkout record, payment receipt, written booking details, and this agreement version form the signed electronic record.",
      'The Client may download, print, and retain a complete copy before paying. Electronic copies are treated as originals. The booking is not confirmed until the Performer sends written confirmation.',
    ],
  },
]

function EventAgreement() {
  const [adultAuthority, setAdultAuthority] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const readyForCheckout = adultAuthority && termsAccepted

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Event Services Agreement | Spider for Hire'
    return () => {
      document.title = previousTitle
    }
  }, [])

  const continueToCheckout = () => {
    if (!readyForCheckout) return
    window.location.assign(PAYMENT_LINK)
  }

  return (
    <div className="agreement-page">
      <header className="agreement-header">
        <a className="agreement-brand" href="/" aria-label="Return to Spider for Hire home">
          <span aria-hidden="true">🕷</span>
          <strong>SPIDER FOR HIRE</strong>
        </a>
        <a href="/" className="agreement-home-link">BACK TO HOME</a>
      </header>

      <main className="agreement-main">
        <section className="agreement-intro" aria-labelledby="agreement-title">
          <p className="agreement-kicker">// BOOKING AGREEMENT</p>
          <h1 id="agreement-title">EVENT SERVICES<br />AGREEMENT</h1>
          <div className="agreement-version">
            <span>VERSION {AGREEMENT_VERSION}</span>
            <a href="/documents/spider-for-hire-event-services-agreement-2026-11-14.pdf" download>
              DOWNLOAD A COPY ↓
            </a>
          </div>
          <p>
            This agreement is between Jimmie Miller, operating under the name Spider for Hire
            (the Performer), and the adult booking the event (the Client). Read and retain a copy
            before continuing to Stripe.
          </p>
          <div className="agreement-process" aria-label="Signing process">
            <div><span>01</span><strong>REVIEW</strong><small>Read this agreement</small></div>
            <div><span>02</span><strong>SIGN</strong><small>Accept at Stripe checkout</small></div>
            <div><span>03</span><strong>CONFIRM</strong><small>Receive written confirmation</small></div>
          </div>
        </section>

        <article className="agreement-document">
          <section className="agreement-booking-note">
            <h2>Booking Details</h2>
            <p>
              The event date, time, venue, package, price, travel charges, and approved changes in
              the written quote, confirmation email, and associated Stripe checkout are part of
              this agreement. Save those records with this agreement.
            </p>
          </section>

          {agreementSections.map((section) => (
            <section className="agreement-section" key={section.number}>
              <div className="agreement-section-number" aria-hidden="true">{section.number.padStart(2, '0')}</div>
              <div>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets ? (
                  <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                ) : null}
              </div>
            </section>
          ))}
        </article>

        <section className="agreement-sign" aria-labelledby="sign-heading">
          <p className="agreement-kicker">// ELECTRONIC SIGNATURE</p>
          <h2 id="sign-heading">READY TO SIGN?</h2>
          <p>
            These acknowledgments prepare the checkout. Your legally significant acceptance is the
            required agreement checkbox and payment submission on Stripe. Do not continue unless the
            Stripe page displays that required checkbox and links back to this agreement.
          </p>

          <label className="agreement-check">
            <input
              type="checkbox"
              checked={adultAuthority}
              onChange={(event) => setAdultAuthority(event.target.checked)}
            />
            <span>I am at least 18 years old and authorized to book this event.</span>
          </label>
          <label className="agreement-check">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <span>I reviewed version {AGREEMENT_VERSION}, can retain a copy, and intend to sign electronically at checkout.</span>
          </label>

          <button
            className="agreement-pay-button"
            type="button"
            disabled={!readyForCheckout}
            onClick={continueToCheckout}
          >
            CONTINUE TO SIGN AND PAY →
          </button>
          <p className="agreement-sign-note">
            The booking remains pending until payment clears and Spider for Hire sends written confirmation.
          </p>
        </section>
      </main>

      <footer className="agreement-footer">
        <strong>SPIDER FOR HIRE</strong>
        <a href="mailto:jimmie@altaredalchemie.com">jimmie@altaredalchemie.com</a>
        <span>Independent character entertainment</span>
      </footer>
    </div>
  )
}

export default EventAgreement
