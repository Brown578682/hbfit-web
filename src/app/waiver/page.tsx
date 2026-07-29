import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liability Waiver & Release | Honor Bound FIT',
  description:
    'Standalone Liability Waiver and Release of Claims for Honor Bound FIT LLC — read carefully before participating.',
}

export default function WaiverPage() {
  return (
    <main className="bg-black text-white min-h-screen font-montserrat pt-16">

      {/* DRAFT Banner */}
      <div className="bg-amber-400 text-black text-center py-3 px-4 font-bold text-sm tracking-widest uppercase">
        ⚠ DRAFT — NOT YET IN EFFECT — FOR REVIEW PURPOSES ONLY ⚠
      </div>

      {/* Prominent legal warning header */}
      <div className="bg-zinc-950 border-b border-white/10 py-6 px-4 text-center">
        <p className="text-white font-black text-base sm:text-lg uppercase tracking-widest font-montserrat">
          READ THIS DOCUMENT CAREFULLY
        </p>
        <p className="text-amber-400 font-bold text-sm uppercase tracking-widest mt-1">
          — IT AFFECTS YOUR LEGAL RIGHTS —
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 leading-relaxed">

        {/* Title */}
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2 font-montserrat">
          Liability Waiver &amp; Release
        </h1>
        <p className="text-xs text-zinc-500 mb-10">
          Honor Bound FIT LLC &nbsp;·&nbsp; 45 Centreport Parkway Suite 137, Fredericksburg, VA 22406
          <br />
          <span className="text-amber-400 font-semibold">
            DRAFT — Review by a qualified Virginia attorney recommended before use.
          </span>
        </p>

        <p className="text-zinc-300 mb-10">
          This Liability Waiver and Release ("Waiver") is entered into between you ("Participant") and{' '}
          <strong className="text-white">Honor Bound FIT LLC</strong> ("HBFIT"). By participating in any HBFIT
          activity, you acknowledge that you have read, understood, and voluntarily agreed to all terms of this
          Waiver. If you do not agree, do not participate.
        </p>

        {/* ─── SECTION 1: PARTIES ─── */}
        <section id="section-1" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 1 — Parties
          </h2>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-4 mb-2">
            1.1 Participant
          </h3>
          <p className="text-zinc-300 mb-4">
            "Participant" means the individual who is enrolling in, attending, or otherwise participating in
            any HBFIT activity, including the individual who completes the online enrollment and consent process
            associated with this Waiver.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-4 mb-2">
            1.2 Honor Bound FIT LLC
          </h3>
          <p className="text-zinc-300 mb-4">
            "HBFIT" means Honor Bound FIT LLC, a Virginia limited liability company, its owner and operator
            Rich Brown, its members, managers, officers, employees, coaches, independent contractors,
            volunteers, agents, successors, and assigns (collectively, the "Released Parties").
          </p>
          <p className="text-zinc-300 mb-4">
            <strong className="text-white">Principal place of business:</strong><br />
            45 Centreport Parkway Suite 137, Fredericksburg, VA 22406
          </p>
        </section>

        {/* ─── SECTION 2: DESCRIPTION OF ACTIVITIES ─── */}
        <section id="section-2" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 2 — Description of Activities
          </h2>

          <p className="text-zinc-300 mb-4">
            This Waiver applies to all activities, programs, classes, events, and services offered, organized,
            or affiliated with HBFIT, including but not limited to:
          </p>
          <ul className="list-none space-y-2 mb-4">
            {[
              'Strength and conditioning training sessions',
              'Cardiovascular and metabolic conditioning workouts',
              'Functional fitness and movement training',
              'Olympic weightlifting and barbell training',
              'Group fitness classes and small-group training',
              'Individual and semi-private coaching sessions',
              'Nutrition and lifestyle coaching',
              'HBFIT-organized competitions and events',
              'Off-site training sessions, outdoor workouts, and activities at locations other than the HBFIT facility',
              'Any other fitness, wellness, or performance activities offered under the HBFIT brand or by HBFIT personnel',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-300">
            These activities take place at the HBFIT facility located at 45 Centreport Parkway Suite 137,
            Fredericksburg, VA, and may also take place at off-site venues, outdoor locations, event venues,
            or any other location designated by HBFIT for its programming (collectively, the "Activity
            Locations").
          </p>
        </section>

        {/* ─── SECTION 3: INHERENT RISKS ─── */}
        <section id="section-3" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 3 — Acknowledgment of Inherent Risks
          </h2>

          <p className="text-zinc-300 mb-4">
            Participant expressly acknowledges that participation in physical fitness training and the activities
            described in Section 2 involves <strong className="text-white">inherent and unavoidable risks of
            bodily injury, property damage, and death</strong>. These risks exist even when HBFIT exercises
            reasonable care. By participating, Participant voluntarily assumes all such risks, including but
            not limited to:
          </p>

          <div className="bg-zinc-900 border border-white/10 rounded-lg p-5 mb-4">
            <ul className="list-none space-y-3">
              {[
                'Acute muscle strains, pulls, and complete muscle tears',
                'Joint injuries including sprains, dislocations, labral tears, meniscus tears, and damage to ligaments and tendons',
                'Bone fractures, stress fractures, and avulsion fractures',
                'Back and spinal injuries, including herniated discs, nerve impingement, and spinal cord injury',
                'Cardiovascular events including abnormal heart rhythm, heart attack (myocardial infarction), stroke, and sudden cardiac arrest',
                'Rhabdomyolysis — a potentially life-threatening breakdown of muscle tissue that can cause acute kidney failure, requiring emergency hospitalization',
                'Heat-related illness including heat cramps, heat exhaustion, and heat stroke, which can be fatal',
                'Hyponatremia (dangerously low sodium levels from overhydration during prolonged exercise)',
                'Falls, slips, or trips resulting in impact injuries including head injuries and traumatic brain injury',
                'Fainting or loss of consciousness and resulting injuries',
                'Eye, dental, or facial injuries from equipment or accidental contact with other participants',
                'Allergic reactions to equipment materials, cleaning products, chalk, or environmental conditions',
                'Aggravation or exacerbation of undisclosed or unknown pre-existing medical conditions',
                'Overtraining injuries and chronic overuse syndromes',
                'Serious and permanent disability',
                'Death',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-zinc-300">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-zinc-300">
            Participant further acknowledges that these risks may arise from the actions of HBFIT staff,
            coaches, or other participants; from the condition of equipment, premises, or surfaces; from
            environmental conditions including weather; or from any other cause, including the negligence of
            the Released Parties.
          </p>
        </section>

        {/* ─── SECTION 4: VOLUNTARY ASSUMPTION OF RISK ─── */}
        <section id="section-4" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 4 — Voluntary Assumption of Risk
          </h2>

          <p className="text-zinc-300 mb-4">
            Participant affirms that:
          </p>
          <ul className="list-none space-y-3 mb-4">
            {[
              'Participation in HBFIT activities is entirely voluntary.',
              'Participant has been fully informed of the nature and risks of the activities described herein.',
              'Participant freely and voluntarily chooses to assume all risks associated with participation, including risks arising from the negligence of the Released Parties.',
              "Participant's assumption of risk is knowing, intelligent, and made with full understanding of its legal consequences.",
              'No representations, promises, or inducements have been made by HBFIT to cause Participant to sign this Waiver other than the opportunity to participate in HBFIT activities.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── SECTION 5: FULL RELEASE ─── */}
        <section id="section-5" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 5 — Full Release of Liability
          </h2>

          <p className="text-zinc-300 mb-4">
            <strong className="text-white">This is the core release provision. Read it carefully.</strong>
          </p>

          <div className="bg-zinc-900 border border-amber-400/30 rounded-lg p-5 mb-4">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 tracking-widest">
              — Full Release Text — DRAFT —
            </p>
            <p className="text-zinc-200 uppercase text-sm leading-8 tracking-wide">
              IN CONSIDERATION OF BEING PERMITTED TO PARTICIPATE IN ANY AND ALL ACTIVITIES, PROGRAMS, CLASSES,
              EVENTS, TRAINING SESSIONS, AND SERVICES OFFERED BY HONOR BOUND FIT LLC ("HBFIT"), WHETHER
              CONDUCTED ON-SITE AT 45 CENTREPORT PARKWAY SUITE 137, FREDERICKSBURG, VIRGINIA, OR AT ANY
              OFF-SITE LOCATION INCLUDING OUTDOOR VENUES, COMPETITIONS, OR ANY OTHER LOCATION ASSOCIATED WITH
              HBFIT PROGRAMMING, PARTICIPANT, ON BEHALF OF THEMSELVES AND THEIR HEIRS, PERSONAL
              REPRESENTATIVES, ASSIGNS, AND NEXT OF KIN, HEREBY:
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-8 tracking-wide">
              (A) RELEASES, WAIVES, DISCHARGES, AND COVENANTS NOT TO SUE HONOR BOUND FIT LLC, ITS OWNER AND
              OPERATOR RICH BROWN, ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, COACHES, INDEPENDENT
              CONTRACTORS, VOLUNTEERS, AGENTS, AFFILIATES, SUCCESSORS, AND ASSIGNS (COLLECTIVELY, THE
              "RELEASED PARTIES") FROM ANY AND ALL LIABILITY, CLAIMS, DEMANDS, ACTIONS, AND CAUSES OF ACTION
              WHATSOEVER, ARISING OUT OF OR RELATED TO ANY LOSS, DAMAGE, INJURY, DISABILITY, OR DEATH THAT
              MAY BE SUSTAINED BY PARTICIPANT, OR TO ANY PROPERTY BELONGING TO PARTICIPANT, WHETHER CAUSED BY
              THE NEGLIGENCE — INCLUDING ACTIVE NEGLIGENCE — OF THE RELEASED PARTIES OR OTHERWISE, WHILE
              PARTICIPATING IN ANY HBFIT ACTIVITY OR WHILE IN, ON, OR UPON ANY ACTIVITY LOCATION;
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-8 tracking-wide">
              (B) THIS RELEASE COVERS, WITHOUT LIMITATION, ALL CLAIMS ARISING FROM: PERSONAL INJURY OF EVERY
              KIND (INCLUDING RHABDOMYOLYSIS, CARDIAC ARREST, STROKE, AND DEATH); ILLNESS; DISABILITY,
              WHETHER TEMPORARY OR PERMANENT; PROPERTY LOSS OR DAMAGE; AND ANY OTHER HARM OF EVERY KIND AND
              NATURE, KNOWN OR UNKNOWN, FORESEEN OR UNFORESEEN, WHETHER OCCURRING ON HBFIT'S PREMISES OR AT
              ANY OFF-SITE ACTIVITY LOCATION;
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-8 tracking-wide">
              (C) THIS RELEASE EXPRESSLY EXTENDS TO AND INCLUDES CLAIMS ARISING FROM THE NEGLIGENCE OF THE
              RELEASED PARTIES, INCLUDING BUT NOT LIMITED TO: NEGLIGENT INSTRUCTION, NEGLIGENT PROGRAMMING,
              NEGLIGENT SUPERVISION, NEGLIGENT MAINTENANCE OR INSPECTION OF PREMISES OR EQUIPMENT, NEGLIGENT
              FAILURE TO WARN, AND ANY OTHER NEGLIGENT ACT OR OMISSION OF THE RELEASED PARTIES;
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-8 tracking-wide">
              (D) PARTICIPANT ACKNOWLEDGES THAT THIS RELEASE IS INTENDED TO BE AS BROAD AND INCLUSIVE AS
              PERMITTED BY THE LAW OF THE COMMONWEALTH OF VIRGINIA, AND AGREES THAT IF ANY PORTION HEREOF IS
              HELD INVALID OR UNENFORCEABLE BY A COURT OF COMPETENT JURISDICTION, THE REMAINDER SHALL CONTINUE
              IN FULL FORCE AND EFFECT;
            </p>
            <br />
            <p className="text-zinc-200 uppercase text-sm leading-8 tracking-wide">
              (E) PARTICIPANT CERTIFIES THAT THEY HAVE READ THIS RELEASE, FULLY UNDERSTAND ITS TERMS,
              UNDERSTAND THAT BY AGREEING THEY GIVE UP SUBSTANTIAL LEGAL RIGHTS, AND AGREE TO BE BOUND BY IT
              FREELY AND VOLUNTARILY WITHOUT INDUCEMENT OR COERCION.
            </p>
          </div>

          <p className="text-xs text-zinc-500 italic">
            DRAFT NOTICE: The enforceability of pre-injury liability waivers in Virginia is governed by
            Virginia Code § 8.01-7 and applicable case law. The scope of this release — particularly as it
            relates to claims of negligence — should be reviewed by a qualified Virginia attorney before this
            document is deployed for member execution.
          </p>
        </section>

        {/* ─── SECTION 6: VIRGINIA LAW NOTE ─── */}
        <section id="section-6" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 6 — Virginia Law Note
          </h2>

          <p className="text-zinc-300 mb-4">
            This Waiver is governed by the laws of the{' '}
            <strong className="text-white">Commonwealth of Virginia</strong>. Participant acknowledges that
            pre-injury liability waivers are cognizable under Virginia law and that this document is intended
            to be enforced to the fullest extent permitted.
          </p>
          <p className="text-zinc-300 mb-4">
            Relevant statutory and case law includes, without limitation:
          </p>
          <ul className="list-none space-y-2 mb-4">
            {[
              'Virginia Code § 8.01-7 — concerning actions for personal injury',
              'Hiett v. Lake Barcroft Community Association, Inc., 244 Va. 191 (1992) — Virginia Supreme Court precedent on exculpatory clauses',
              'Dominion Bankshares Corp. v. Newton, 229 Va. 524 (1985)',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-zinc-800 border border-amber-400/30 rounded p-3">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">DRAFT Notice</p>
            <p className="text-zinc-300 text-sm">
              Virginia courts have scrutinized exculpatory clauses carefully. Review by a qualified Virginia
              attorney is strongly recommended before this Waiver is presented to members for execution.
            </p>
          </div>
        </section>

        {/* ─── SECTION 7: INDEMNIFICATION ─── */}
        <section id="section-7" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 7 — Indemnification
          </h2>

          <p className="text-zinc-300 mb-4">
            To the fullest extent permitted by applicable Virginia law, Participant agrees to{' '}
            <strong className="text-white">indemnify, defend, and hold harmless</strong> the Released Parties
            from and against any and all claims, demands, losses, liabilities, damages, costs, and expenses
            (including reasonable attorneys' fees and court costs) arising from or related to:
          </p>
          <ul className="list-none space-y-2 mb-4">
            {[
              "Participant's participation in any HBFIT activity, program, event, or session;",
              "Participant's breach of any representation, warranty, or obligation under this Waiver or any HBFIT membership agreement;",
              "Participant's violation of any applicable law or regulation;",
              "Participant's negligent, reckless, or intentional conduct that causes injury or damage to any other person or to property;",
              'Any claim by a third party arising from Participant\'s actions while at HBFIT or at any HBFIT-affiliated event or Activity Location.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-300">
            This indemnification obligation shall survive termination of Participant's HBFIT membership and
            shall not be limited by the Release in Section 5.
          </p>
        </section>

        {/* ─── SECTION 8: EMERGENCY MEDICAL TREATMENT ─── */}
        <section id="section-8" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 8 — Emergency Medical Treatment Authorization
          </h2>

          <p className="text-zinc-300 mb-4">
            In the event of an injury, medical emergency, or other situation in which Participant is unable to
            make or communicate medical decisions, Participant hereby authorizes HBFIT staff to:
          </p>
          <ul className="list-none space-y-2 mb-4">
            {[
              'Call 911 and activate emergency medical services (EMS) immediately;',
              'Administer or facilitate basic first aid, including CPR and use of an automated external defibrillator (AED) if available and HBFIT staff are trained;',
              'Provide emergency responders and medical personnel with relevant medical history and emergency contact information disclosed by Participant;',
              'Consent to emergency medical treatment on behalf of Participant as may be necessary to preserve life, limb, or function pending arrival of emergency services.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-300 mb-4">
            Participant acknowledges and agrees that all costs of emergency medical treatment are solely the
            responsibility of Participant and that HBFIT shall not be liable for any costs, expenses, or
            outcomes arising from such treatment.
          </p>
          <p className="text-zinc-300">
            Participant authorizes HBFIT to contact the emergency contacts provided at enrollment in any
            emergency situation involving Participant.
          </p>
        </section>

        {/* ─── SECTION 9: HEALTH REPRESENTATIONS ─── */}
        <section id="section-9" className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 9 — Health Representations
          </h2>

          <p className="text-zinc-300 mb-4">
            Participant represents and warrants to HBFIT that, as of the date of enrollment and on each date
            of participation:
          </p>
          <ul className="list-none space-y-2 mb-6">
            {[
              'Participant is in good physical health and is not aware of any medical condition that would make participation in strenuous physical exercise unsafe.',
              'Participant has not been advised by a licensed healthcare provider to refrain from strenuous physical exercise.',
              'If Participant has any cardiovascular, respiratory, metabolic, musculoskeletal, or other condition that may be affected by vigorous physical activity, Participant has obtained written medical clearance from a licensed physician prior to participation.',
              'Participant will promptly inform HBFIT of any change in health status that may affect the safety of participation, including new diagnoses, surgeries, or acute injury or illness.',
              "Participant understands that HBFIT coaches are fitness professionals, not licensed physicians, and that nothing communicated by HBFIT constitutes medical advice, diagnosis, or treatment.",
              'All information provided to HBFIT on any enrollment form, health questionnaire, or intake document is true, accurate, and complete to the best of Participant\'s knowledge.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-zinc-300">
                <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-300">
            Participant acknowledges that HBFIT relies on these representations in permitting Participant to
            engage in HBFIT activities, and that any material misrepresentation may result in immediate
            termination of membership.
          </p>
        </section>

        {/* ─── SECTION 10: GOVERNING LAW ─── */}
        <section id="section-10" className="mb-12 bg-zinc-950 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4 border-b border-white/10 pb-2 font-montserrat">
            Section 10 — Governing Law &amp; Dispute Resolution
          </h2>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-4 mb-2">
            10.1 Governing Law
          </h3>
          <p className="text-zinc-300 mb-4">
            This Waiver shall be governed by, and construed in accordance with, the laws of the{' '}
            <strong className="text-white">Commonwealth of Virginia</strong>, without regard to its
            conflict-of-law provisions.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            10.2 Jurisdiction &amp; Venue
          </h3>
          <p className="text-zinc-300 mb-4">
            Any legal action or proceeding arising out of or relating to this Waiver shall be brought exclusively
            in the state or federal courts located in{' '}
            <strong className="text-white">Spotsylvania County or the City of Fredericksburg, Virginia</strong>.
            Participant hereby irrevocably consents to the personal jurisdiction of such courts, waives any
            objection to the laying of venue of such action, and waives any claim that such forum is
            inconvenient.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            10.3 Severability
          </h3>
          <p className="text-zinc-300 mb-4">
            If any provision of this Waiver is found to be invalid or unenforceable by a court of competent
            jurisdiction, such provision shall be modified to the minimum extent necessary to make it
            enforceable, or if it cannot be so modified, severed from this Waiver. The remaining provisions
            shall continue in full force and effect.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            10.4 Entire Agreement
          </h3>
          <p className="text-zinc-300 mb-4">
            This Waiver, together with the HBFIT Terms &amp; Conditions and any other enrollment documents
            incorporated by reference, constitutes the entire agreement between Participant and HBFIT with
            respect to the subject matter hereof, and supersedes all prior or contemporaneous representations,
            understandings, and agreements, whether written or oral.
          </p>

          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mt-6 mb-2">
            10.5 No Oral Modifications
          </h3>
          <p className="text-zinc-300">
            This Waiver may not be modified, altered, or amended except by a written instrument signed by an
            authorized representative of HBFIT. No oral representation, promise, or statement by any HBFIT
            employee, coach, or agent shall modify or supersede any term of this Waiver.
          </p>
        </section>

        {/* Final draft notice */}
        <div className="bg-amber-400 text-black rounded-lg p-4 mb-8">
          <p className="font-black text-sm uppercase tracking-widest text-center mb-2">
            ⚠ DRAFT DOCUMENT — ATTORNEY REVIEW REQUIRED ⚠
          </p>
          <p className="text-xs text-center leading-relaxed">
            This Liability Waiver &amp; Release is a DRAFT. It has not been reviewed or approved by a licensed
            Virginia attorney and is NOT legally effective or ready for member execution. Honor Bound FIT LLC
            should obtain a review by a qualified Virginia attorney specializing in fitness/sports law or
            general business litigation before using this document. Virginia law places specific requirements on
            pre-injury exculpatory clauses that must be met for this release to be enforceable.
          </p>
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
