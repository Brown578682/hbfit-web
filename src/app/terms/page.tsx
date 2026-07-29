import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Honor Bound FIT',
  description:
    'Terms and Conditions, Liability Waiver, and Release of Claims for Honor Bound FIT membership and participation.',
}

export default function TermsPage() {
  return (
    <main className="bg-black text-white min-h-screen font-montserrat pt-16">

      {/* Sticky legal notice */}
      <div className="sticky top-16 z-40 bg-zinc-950 border-b border-white/10 py-2 px-4 text-center text-xs text-zinc-400 tracking-wide">
        This document constitutes a legally binding agreement. Read carefully before signing.
      </div>

      {/* DRAFT Banner */}
      <div className="bg-amber-400 text-black text-center py-3 px-4 font-bold text-sm tracking-widest uppercase">
        ⚠ DRAFT — NOT YET IN EFFECT — FOR REVIEW PURPOSES ONLY ⚠
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 leading-relaxed">

        {/* Title */}
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2 font-montserrat">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-zinc-400 mb-1 uppercase tracking-widest">
          Combined Membership Agreement &amp; Liability Waiver
        </p>
        <p className="text-xs text-zinc-500 mb-10">
          Honor Bound FIT LLC &nbsp;·&nbsp; 45 Centreport Parkway Suite 137, Fredericksburg, VA 22406
          <br />
          <span className="text-amber-400 font-semibold">DRAFT — Review by a qualified Virginia attorney recommended before use.</span>
        </p>

        <p className="text-zinc-300 mb-10">
          These Terms &amp; Conditions ("Agreement") govern your membership and participation in all activities offered
          by <strong className="text-white">Honor Bound FIT LLC</strong> ("HBFIT," "we," "us," or "our"), a Virginia
          limited liability company. By enrolling in a membership, attending any session, or accessing our facility,
          you ("Member," "you," or "your") agree to be bound by this Agreement in its entirety. If you do not agree,
          do not enroll or participate.
        </p>

        {/* ─── SECTION 1 ─── */}
        <section id="section-1" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 1 — Membership &amp; Billing
          </h2>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            1.1 Billing Cycles
          </h3>
          <p className="text-zinc-300 mb-4">
            HBFIT memberships are billed in <strong className="text-white">4-week (28-day) cycles</strong>, not
            calendar months. Your first billing cycle begins on the date your membership is activated. Subsequent
            cycles renew automatically every 28 days until cancelled in accordance with Section 1.3 below.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            1.2 Payment Authorization
          </h3>
          <p className="text-zinc-300 mb-4">
            By providing your payment information, you authorize HBFIT to charge the applicable membership fee to
            your payment method on file at the start of each 4-week billing cycle. Failure to maintain a valid
            payment method may result in immediate suspension or termination of your membership. You are
            responsible for all fees incurred, including any outstanding balances, late fees, or costs of
            collection.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            1.3 Cancellation Policy
          </h3>
          <p className="text-zinc-300 mb-4">
            You may cancel your membership at any time by providing written notice to HBFIT at least{' '}
            <strong className="text-white">seven (7) calendar days before your next billing cycle renewal date</strong>.
            Cancellation requests received fewer than 7 days before the next renewal date will take effect at the
            end of the following billing cycle; you will be charged for that additional cycle. Written notice may be
            submitted by email to{' '}
            <a href="mailto:rich@honorboundfit.com" className="text-amber-400 underline">
              rich@honorboundfit.com
            </a>{' '}
            or via any written cancellation process made available on the HBFIT member portal.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            1.4 No Refunds
          </h3>
          <p className="text-zinc-300 mb-4">
            All membership fees are <strong className="text-white">non-refundable</strong>. HBFIT does not issue
            prorated refunds for partial billing cycles, unused sessions, personal schedule conflicts, illness,
            injury, travel, or any other reason. If a session is cancelled by HBFIT and cannot be rescheduled
            within the same billing cycle, HBFIT may, at its sole discretion, issue a credit toward a future cycle.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            1.5 Price Changes
          </h3>
          <p className="text-zinc-300 mb-4">
            HBFIT reserves the right to modify membership pricing at any time. You will receive at least{' '}
            <strong className="text-white">fourteen (14) calendar days' advance written notice</strong> of any
            price increase, delivered to the email address on file. Your continued use of the membership after the
            effective date of a price change constitutes your acceptance of the new pricing. If you do not agree to
            a price change, you must cancel your membership pursuant to Section 1.3 before the effective date.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            1.6 Holds &amp; Freezes
          </h3>
          <p className="text-zinc-300 mb-4">
            Membership holds or freezes may be available at HBFIT's sole discretion. Any approved hold must be
            requested in writing. HBFIT is not obligated to grant hold requests.
          </p>
        </section>

        {/* ─── SECTION 2 ─── */}
        <section id="section-2" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 2 — Health Acknowledgment &amp; Medical Clearance
          </h2>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            2.1 Fitness for Participation
          </h3>
          <p className="text-zinc-300 mb-4">
            You represent and warrant that you are in sufficiently good physical health to engage in strenuous
            physical exercise and fitness training, including but not limited to strength training, cardiovascular
            conditioning, metabolic conditioning, functional fitness, and any other activities offered by HBFIT.
            You have not been advised by a physician or other licensed healthcare provider to refrain from such
            activities.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            2.2 Duty to Obtain Medical Clearance
          </h3>
          <p className="text-zinc-300 mb-4">
            If you have or have ever had any cardiovascular condition, respiratory condition, musculoskeletal
            injury, metabolic disorder (including diabetes), neurological disorder, or any other condition that
            may be affected by vigorous physical activity, <strong className="text-white">you must obtain
            written clearance from a licensed physician before beginning or continuing participation</strong> at
            HBFIT. You agree to inform your HBFIT coach of any such conditions, medications, or limitations that
            may be relevant to your safety during training.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            2.3 Duty to Disclose Changes
          </h3>
          <p className="text-zinc-300 mb-4">
            You agree to promptly inform HBFIT of any changes to your health status that may affect your ability
            to safely participate in training, including new diagnoses, new medications, recent surgeries, or any
            acute illness or injury.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            2.4 No Medical Advice
          </h3>
          <p className="text-zinc-300 mb-4">
            Nothing provided by HBFIT — including coaching cues, programming, nutrition guidance, or any
            communications from HBFIT staff — constitutes medical advice, diagnosis, or treatment.{' '}
            <strong className="text-white">HBFIT coaches are fitness professionals, not licensed physicians,
            physical therapists, or registered dietitians.</strong> Always consult qualified healthcare
            professionals for medical questions or concerns.
          </p>
        </section>

        {/* ─── SECTION 3 ─── */}
        <section id="section-3" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 3 — Member Conduct &amp; Facility Rules
          </h2>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            3.1 Code of Conduct
          </h3>
          <p className="text-zinc-300 mb-3">
            HBFIT is built on a culture of respect, accountability, and shared purpose. As a Member, you agree to
            uphold the following standards of conduct:
          </p>
          <ul className="list-none space-y-2 mb-6">
            {[
              'Treat all Members, coaches, staff, and guests with dignity and respect, regardless of fitness level, background, or identity.',
              'Refrain from bullying, harassment, intimidation, verbal abuse, or discriminatory conduct of any kind.',
              'Use appropriate, non-offensive language at all times within the facility and in any HBFIT-affiliated online communities.',
              'Arrive on time and prepared for scheduled sessions. Notify HBFIT of cancellations as early as possible.',
              'Follow all instructions and safety guidelines provided by coaches and staff.',
              'Compete with integrity — celebrate others\' progress and refrain from unsolicited coaching or negative comparisons.',
              'Never use the facility or HBFIT resources for solicitation, commercial promotion, or recruitment without prior written consent from HBFIT management.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            3.2 Facility Rules
          </h3>
          <ul className="list-none space-y-2 mb-6">
            {[
              'Wear appropriate athletic footwear at all times while training. No bare feet on the training floor unless expressly permitted.',
              'Re-rack all weights and return all equipment to its designated location after use.',
              'Wipe down equipment with provided sanitizing materials before and after use.',
              'Do not use equipment you have not been cleared to use by an HBFIT coach.',
              'No dropping of weights except as specifically coached and permitted for Olympic lifting or other prescribed movements.',
              'Personal electronic devices may be used for music; use headphones when applicable. No disruptive use of speakerphone.',
              'Do not bring outside personal training clients or conduct personal training services of any kind in the facility.',
              'Guests require prior approval from HBFIT management and must sign a waiver before entering the training floor.',
              'Consumption of alcohol or illicit substances before or during training is strictly prohibited.',
              'HBFIT is not responsible for lost, stolen, or damaged personal property.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            3.3 Right to Revoke Membership
          </h3>
          <p className="text-zinc-300 mb-4">
            HBFIT reserves the right, in its sole and absolute discretion, to suspend or permanently revoke the
            membership and facility access of any Member who violates this Code of Conduct or Facility Rules,
            who engages in conduct that HBFIT deems threatening, disruptive, or harmful to other Members or
            staff, or who otherwise fails to uphold the standards of the HBFIT community. In the event of
            revocation for cause, no refund of prepaid membership fees will be issued.
          </p>
        </section>

        {/* ─── SECTION 4 ─── */}
        <section id="section-4" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 4 — Assumption of Risk
          </h2>

          <p className="text-zinc-300 mb-4">
            You expressly acknowledge that participation in fitness training, physical exercise, and all other
            activities offered by HBFIT involves <strong className="text-white">inherent risks of injury and
            harm</strong>, some of which may be serious or life-threatening. These risks exist regardless of the
            care taken by HBFIT, its coaches, or its staff. By participating, you voluntarily accept and assume
            all such risks, known and unknown, including but not limited to:
          </p>

          <ul className="list-none space-y-2 mb-6">
            {[
              'Muscle strains, pulls, tears, and chronic overuse injuries',
              'Joint injuries including sprains, dislocations, labral tears, and damage to ligaments and tendons',
              'Bone fractures and stress fractures',
              'Back and spinal injuries, including herniated discs and nerve impingement',
              'Cardiovascular events including irregular heart rhythm, heart attack, stroke, and sudden cardiac arrest',
              'Heat-related illness including heat exhaustion and potentially fatal heat stroke',
              'Falls, slips, or trips resulting in impact injuries',
              'Rhabdomyolysis (breakdown of muscle tissue that can cause kidney failure)',
              'Fainting, loss of consciousness, and related injuries from falls',
              'Eye, dental, or facial injuries from equipment or accidental contact',
              'Allergic reactions to equipment materials, cleaning products, or environmental factors',
              'Aggravation or exacerbation of pre-existing medical conditions',
              'Death',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 font-bold mt-0.5 shrink-0">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-zinc-300">
            You further acknowledge that these risks may arise from your own actions, the actions of other
            Members, the condition of the facility, equipment, or surfaces, environmental conditions, or other
            causes beyond HBFIT's reasonable control. Your voluntary participation constitutes your assumption
            of these risks.
          </p>
        </section>

        {/* ─── SECTION 5 ─── */}
        <section id="section-5" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 5 — Release and Waiver of Liability
          </h2>

          <p className="text-zinc-300 mb-4">
            Please read this section with particular care. It contains a complete release and waiver of legal claims
            against Honor Bound FIT LLC and related parties.
          </p>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-5 mb-4">
            <p className="text-zinc-200 uppercase text-sm leading-7 tracking-wide">
              IN CONSIDERATION OF BEING PERMITTED TO PARTICIPATE IN ANY AND ALL ACTIVITIES, PROGRAMS, CLASSES,
              EVENTS, AND SERVICES OFFERED BY HONOR BOUND FIT LLC ("HBFIT"), WHETHER CONDUCTED ON-SITE AT 45
              CENTREPORT PARKWAY SUITE 137, FREDERICKSBURG, VIRGINIA, OR AT ANY OFF-SITE LOCATION, INCLUDING
              OUTDOOR TRAINING VENUES, COMPETITIONS, EVENTS, OR ANY OTHER LOCATION ASSOCIATED WITH HBFIT
              PROGRAMMING, YOU, ON BEHALF OF YOURSELF AND YOUR HEIRS, ASSIGNS, PERSONAL REPRESENTATIVES, AND
              NEXT OF KIN, HEREBY:
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-7 tracking-wide">
              1. RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE HONOR BOUND FIT LLC, ITS OWNER AND
              OPERATOR RICH BROWN, ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, COACHES, INDEPENDENT
              CONTRACTORS, AGENTS, AFFILIATES, SUCCESSORS, AND ASSIGNS (COLLECTIVELY, THE "RELEASED PARTIES")
              FROM ANY AND ALL LIABILITY, CLAIMS, DEMANDS, ACTIONS, AND CAUSES OF ACTION WHATSOEVER, ARISING
              OUT OF OR RELATED TO ANY LOSS, DAMAGE, INJURY, OR DEATH THAT MAY BE SUSTAINED BY YOU, OR TO ANY
              PROPERTY BELONGING TO YOU, WHETHER CAUSED BY THE NEGLIGENCE OF THE RELEASED PARTIES OR
              OTHERWISE, WHILE PARTICIPATING IN ANY ACTIVITY ASSOCIATED WITH HBFIT, OR WHILE IN, ON, OR UPON
              THE PREMISES WHERE ANY SUCH ACTIVITY IS BEING CONDUCTED.
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-7 tracking-wide">
              2. THIS RELEASE COVERS ALL CLAIMS ARISING FROM PERSONAL INJURY (INCLUDING BODILY INJURY OF EVERY
              KIND), ILLNESS, DISABILITY, DEATH, PROPERTY LOSS OR DAMAGE, AND ANY OTHER HARM OF EVERY KIND AND
              NATURE, KNOWN OR UNKNOWN, WHETHER OCCURRING ON HBFIT'S PREMISES, AT AN OFF-SITE TRAINING
              LOCATION, AT A COMPETITION, OR IN CONNECTION WITH ANY HBFIT-AFFILIATED ACTIVITY OR EVENT.
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-7 tracking-wide">
              3. THIS RELEASE EXPRESSLY EXTENDS TO AND INCLUDES CLAIMS ARISING FROM THE NEGLIGENCE OF THE
              RELEASED PARTIES, INCLUDING BUT NOT LIMITED TO NEGLIGENT INSTRUCTION, NEGLIGENT SUPERVISION,
              NEGLIGENT MAINTENANCE OF THE PREMISES OR EQUIPMENT, AND ANY OTHER ACT OR OMISSION OF THE
              RELEASED PARTIES THAT MAY BE CONSIDERED NEGLIGENT.
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-7 tracking-wide">
              4. YOU ACKNOWLEDGE THAT THIS RELEASE IS INTENDED TO BE AS BROAD AND INCLUSIVE AS PERMITTED BY
              THE LAW OF THE COMMONWEALTH OF VIRGINIA AND AGREE THAT IF ANY PORTION IS HELD INVALID OR
              UNENFORCEABLE, THE REMAINDER SHALL CONTINUE IN FULL FORCE AND EFFECT.
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-7 tracking-wide">
              5. YOU HAVE HAD SUFFICIENT OPPORTUNITY TO READ THIS RELEASE, YOU HAVE READ IT, YOU UNDERSTAND IT,
              AND YOU AGREE TO BE BOUND BY IT. YOU ARE SIGNING THIS AGREEMENT FREELY AND VOLUNTARILY.
            </p>
          </div>

          <p className="text-xs text-zinc-500 italic">
            Note: Virginia Code § 8.01-7 and applicable case law govern the enforceability of liability waivers
            in the Commonwealth. HBFIT strongly recommends review of this clause by a qualified Virginia attorney
            prior to deployment.
          </p>
        </section>

        {/* ─── SECTION 6 ─── */}
        <section id="section-6" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 6 — Indemnification
          </h2>

          <p className="text-zinc-300 mb-4">
            To the fullest extent permitted by applicable law, you agree to <strong className="text-white">indemnify,
            defend, and hold harmless</strong> Honor Bound FIT LLC, Rich Brown, and all Released Parties (as
            defined in Section 5) from and against any and all claims, liabilities, obligations, losses, damages,
            penalties, fines, costs, and expenses (including reasonable attorneys' fees and court costs) arising
            from or related to:
          </p>
          <ul className="list-none space-y-2 mb-4">
            {[
              'Your participation in any HBFIT activity, program, event, or session;',
              'Your breach of any representation, warranty, or obligation under this Agreement;',
              'Your violation of any applicable law, regulation, or rule;',
              'Your negligent, reckless, or intentional conduct that causes injury or damage to any person or property;',
              'Any claim by a third party arising from your actions while at HBFIT or at any HBFIT-affiliated event.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 font-bold mt-0.5 shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-300">
            This indemnification obligation will survive the termination or expiration of this Agreement.
          </p>
        </section>

        {/* ─── SECTION 7 ─── */}
        <section id="section-7" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 7 — General Provisions
          </h2>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.1 Governing Law
          </h3>
          <p className="text-zinc-300 mb-4">
            This Agreement shall be governed by, and construed in accordance with, the laws of the{' '}
            <strong className="text-white">Commonwealth of Virginia</strong>, without regard to its conflict-of-law
            provisions.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.2 Venue &amp; Jurisdiction
          </h3>
          <p className="text-zinc-300 mb-4">
            Any legal action or proceeding arising out of or relating to this Agreement or your membership with
            HBFIT shall be brought exclusively in the state or federal courts located in{' '}
            <strong className="text-white">Spotsylvania County or the City of Fredericksburg, Virginia</strong>.
            You hereby consent to the personal jurisdiction of such courts and waive any objection to the
            laying of venue of any such action in such courts.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.3 Severability
          </h3>
          <p className="text-zinc-300 mb-4">
            If any provision of this Agreement is found to be invalid, illegal, or unenforceable under applicable
            law, such provision shall be modified to the minimum extent necessary to make it enforceable, or if
            it cannot be so modified, severed from this Agreement, and the remaining provisions shall continue
            in full force and effect.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.4 Entire Agreement
          </h3>
          <p className="text-zinc-300 mb-4">
            This Agreement, together with any enrollment form, membership addendum, or other document
            incorporated herein by reference, constitutes the entire agreement between you and HBFIT with
            respect to the subject matter hereof, and supersedes all prior or contemporaneous representations,
            understandings, negotiations, and agreements, whether written or oral.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.5 Amendment
          </h3>
          <p className="text-zinc-300 mb-4">
            HBFIT reserves the right to update or modify this Agreement at any time. Changes will be communicated
            via email and/or posting on the HBFIT website. Your continued participation following notice of an
            amendment constitutes your acceptance of the amended terms.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.6 Waiver
          </h3>
          <p className="text-zinc-300 mb-4">
            The failure of HBFIT to enforce any right or provision of this Agreement shall not constitute a waiver
            of such right or provision unless acknowledged and agreed to by HBFIT in writing.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            7.7 Contact
          </h3>
          <p className="text-zinc-300 mb-4">
            Questions regarding this Agreement may be directed to:{' '}
            <a href="mailto:rich@honorboundfit.com" className="text-amber-400 underline">
              rich@honorboundfit.com
            </a>
            <br />
            Honor Bound FIT LLC &nbsp;·&nbsp; 45 Centreport Parkway Suite 137, Fredericksburg, VA 22406
          </p>
        </section>

        {/* Draft footer */}
        <div className="bg-amber-400 text-black text-center py-3 px-4 font-bold text-sm tracking-widest uppercase rounded-lg mb-8">
          ⚠ DRAFT — NOT LEGALLY EFFECTIVE — ATTORNEY REVIEW REQUIRED BEFORE USE ⚠
        </div>

        {/* Back to top */}
        <div className="text-center mt-8 pb-8">
          <a
            href="#"
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            ↑ Back to Top
          </a>
        </div>

      </div>
    </main>
  )
}
