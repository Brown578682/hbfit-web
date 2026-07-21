// prisma/seed.ts — Seeds Core Values posts and Hero Tree entries from WordPress XML data
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CORE_VALUES = [
  {
    slug: "respect-is-given-before-it-is-earned",
    title: "Respect Is Given Before It Is Earned",
    category: "CORE_VALUES" as const,
    featuredImage: "/images/Honor-Bound-FIT-logo-med.png",
    content: `Most people think respect is a transaction. You show up, you perform, you earn it. That's how it works in most places: you pay your dues, you prove yourself, and eventually the veterans in the room acknowledge your existence.

That's not how we do it here.

At Honor Bound FIT, respect is not a reward for performance. It's the starting position. Every person who walks through that door gets it — before they lift a weight, before they show what they're made of, before anyone knows their story.

Why? Because we believe every person carries dignity that precedes their résumé. The new guy sweating through his first workout deserves the same baseline respect as the veteran who's been here for years. The woman who's never touched a barbell in her life deserves to be treated with the same regard as the guy with the competition calluses.

This doesn't mean standards don't exist. It doesn't mean accountability disappears. It means the default is dignity — and people have to actively work against that default to lose it.

When you lead with respect, you build trust faster. You create an environment where people aren't afraid to be beginners, where asking for help isn't weakness, where the room pulls together instead of performing for each other.

Lead with respect. Watch what it builds.`,
  },
  {
    slug: "compare-yourself",
    title: "Compare Yourself to Who You Were Yesterday, Not to Who Someone Else Is Today.",
    category: "CORE_VALUES" as const,
    content: `The moment you walk into the gym and start looking around, you've already lost.

I know that feeling. You rack up a weight that feels heavy to you, and three feet away some guy is warming up with it. You're grinding through a set and the woman next to you finishes her fifth and barely looks winded. You start wondering what you're doing here, whether you belong, whether you're cut out for this.

That's the wrong competition.

The only person whose progress matters to your development is the person you were yesterday. Did you add five pounds? Did you show up when you didn't want to? Did you push through the set you wanted to quit on? That's the metric. That's the scoreboard that actually tells you something.

The guy who's stronger than you has been at it longer. The woman who makes it look easy has put in thousands of hours you haven't seen. Their current position isn't your competition — it's a picture of what sustained effort looks like over time.

Your job is simple: be better today than you were yesterday. Not better than anyone else. Better than the version of you that walked in last week.

That's the only comparison that makes you stronger.`,
  },
  {
    slug: "relentlessly-pursue",
    title: "Relentlessly Pursue The Things You Suck At Until Today's Challenges Are Tomorrow's Warm-ups.",
    category: "CORE_VALUES" as const,
    content: `Everyone enjoys doing the things they're good at. It feels good to move weight you know you can handle. It feels good to run distances you've already conquered. It feels good to operate inside the boundaries of competence.

But comfort is a liar.

"Comfort is an illusion; a false security bred from familiarity. To get comfortable is to stop growing."

The things you avoid are the things that will define your ceiling. The movement that frustrates you, the weakness you work around, the exercise you skip because you're not good at it — that's where the growth is hiding.

The warrior doesn't avoid the hard thing. The warrior hunts it. Deliberately. Repeatedly. Until the thing that used to break him is the thing he uses to warm up.

That's the standard: relentless pursuit of your own deficiencies. Not with self-punishment, but with the understanding that today's struggle is tomorrow's baseline. What breaks you now is building the version of you that won't break next time.

Find your weak spot. Attack it. Make it a warm-up.`,
  },
  {
    slug: "surround-yourself",
    title: "Surround Yourself With Good People Who Hold You Accountable to Your Values, Goals, and Commitments.",
    category: "CORE_VALUES" as const,
    content: `"Your input determines your outlook. Your outlook determines your output, and your output determines your future." — Zig Ziglar

Control Your Inputs to Predict Your Outcomes

If the people in your circle tolerate excuses, you will eventually make them. If they accept half-effort, you will deliver half-effort. If they don't call you on your inconsistency, your inconsistency will quietly become your character.

The inverse is also true.

Surround yourself with people who expect more from you than you expect from yourself — people who remind you what you said you were going to do, who notice when you're coasting, who have the courage to say the uncomfortable thing because they care more about your growth than your comfort.

Those people are rare. They're worth protecting.

At Honor Bound FIT, accountability isn't surveillance. It's investment. When someone holds you to a standard, they're telling you they believe you're capable of it. That's respect, not criticism.

Choose your circle carefully. It will shape your trajectory more than any training program, any diet, any strategy. You become what you're around. Make sure what you're around is worth becoming.`,
  },
  {
    slug: "regardless-of-environment",
    title: "Regardless of Environment, Circumstances, and Opposition: Individuals are Responsible for Their Own Attitudes, Behavior, and Outcomes.",
    category: "CORE_VALUES" as const,
    content: `Modern culture is quick to explain behavior as a product of circumstance. Environment, upbringing, injustice, trauma, and opposition are often treated not only as factors, but as final verdicts for outcomes. While these forces undeniably shape difficulty, they do not absolve responsibility.

Everyone faces something. Most people face real adversity — disadvantage, hardship, setbacks that weren't their fault. And still, across the full range of human experience, we find individuals who faced every conceivable obstacle and chose to respond with discipline, dignity, and agency.

Viktor Frankl survived the Nazi concentration camps. His family was killed. Everything was taken. And he wrote: "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom."

That space — that gap between what happens to you and what you do about it — is where character lives. You don't control the stimulus. You control the response.

This is not a dismissal of systemic hardship. It's a refusal to surrender the most important thing you own: your agency. Because the moment you decide that circumstances determine outcomes, you've handed that agency to circumstances. And circumstances don't care about you the way you do.

Own your response. Own your outcomes. That ownership is the beginning of every meaningful change.`,
  },
  {
    slug: "good-friends",
    title: "Good Friends Have Hard Conversations",
    category: "CORE_VALUES" as const,
    content: `There's a certain kind of friendship that never disagrees, never challenges, never risks discomfort. Everything is smooth. Everything is "fine." Nothing difficult is ever said.

And those friendships never last. They collapse under the weight of everything that was left unsaid — because avoiding hard conversations doesn't make hard things disappear. It just delays them, and adds resentment in the meantime.

Real friendship isn't comfortable. Real friendship is someone who cares enough about you to tell you the thing you don't want to hear. Who says "I think you're making a mistake" and means it as an act of love, not criticism. Who risks the awkwardness of the conversation because the alternative — watching you walk off a cliff in silence — is not something they're willing to do.

Hard conversations are one of the most important things a good friend can offer. And receiving them is a skill too — the ability to hear hard truth without defensiveness, to separate the message from the discomfort, to recognize the care embedded in the honesty.

If everyone in your life always agrees with you, you're not being loved — you're being managed.

Choose friends who will tell you the truth. And become the kind of friend who does the same.`,
  },
  {
    slug: "children-belong-to-parents",
    title: "Children Belong to Their Parents",
    category: "CORE_VALUES" as const,
    content: `In every society, there are lines that must not be crossed. One of the most sacred is the line between parents and their children.

A mother and father bring a child into the world; they nurture, guide, discipline, and raise that child into adulthood. That bond is natural, pre-political, and ancient. It precedes governments, institutions, and ideologies.

The right of parents to raise their children according to their values — to teach them their faith, their culture, their understanding of right and wrong — is not a privilege granted by the state. It is a right that the state should recognize, protect, and refuse to override except in cases of genuine harm.

This doesn't mean parents are infallible. It doesn't mean children have no rights of their own. But it does mean that outside parties — whether government, schools, or institutions — should be deeply cautious before substituting their judgment for a parent's. The default should always be: parents decide.

When that default erodes, when the state or institutions begin to believe they know better than parents what a child needs, something fundamental breaks. Not just in families — in the social fabric itself.

Parents are the first line. Protect that line.`,
  },
  {
    slug: "the-obstacle-is-the-way",
    title: "The Obstacle is the Way. Growth is Found in Suffering.",
    category: "CORE_VALUES" as const,
    content: `Every warrior knows that comfort never forged a fighter. Iron is sharpened on stone, and the human soul is refined in the crucible of hardship.

At Honor Bound FIT, we don't run from obstacles — we run toward them. Because the obstacle is not the end of the path. The obstacle is the path.

Admiral Stockdale spent seven and a half years as a prisoner of war in North Vietnam. He was tortured repeatedly. He never broke. Years later, reflecting on who survived and who didn't, he said something that cuts to the core: "You must never confuse faith that you will prevail in the end — which you can never afford to lose — with the discipline to confront the most brutal facts of your current reality."

That's the balance. Not blind optimism. Not despair. Honest confrontation with the hard thing, combined with the unshakable belief that you will get through it.

The obstacle isn't blocking your growth. It is your growth. The weight that's too heavy, the distance that's too far, the situation that seems impossible — these are not interruptions to your development. They are your development.

Embrace the hard thing. It's building something in you that comfort never could.`,
  },
  {
    slug: "mans-most-sacred-duty",
    title: "A Man's Most Sacred Duty is to Protect Women and Children",
    category: "CORE_VALUES" as const,
    content: `There is no higher calling for a man than to protect those who cannot protect themselves.

At Honor Bound FIT, we believe this truth is written on the soul of every warrior. Strength, skill, and discipline mean nothing if they are not wielded in defense of others — most especially in defense of women and children.

This is not a commentary on equality or capability. Women are capable — often extraordinarily so. It is a statement about calling. The masculine instinct to protect is not a relic of a less enlightened age. It is a feature, not a bug, of what it means to be a man who takes his responsibilities seriously.

The man who builds himself up — who trains, who disciplines himself, who develops strength and character — does it not just for himself, but so that he has something to give. So that when the moment comes, he can stand between danger and the people who depend on him.

This is why we train. Not just to be physically capable, but to cultivate the mentality of a guardian. Someone who sees vulnerability and moves toward it rather than away from it.

Strength is meant to protect. That's what it's for.`,
  },
  {
    slug: "acknowledge-obey-grateful",
    title: "\"Acknowledge, Obey, & Be Grateful\"",
    category: "CORE_VALUES" as const,
    featuredImage: "/images/Washington-Night-Ops.png",
    content: `"It is the duty of all nations to acknowledge, obey, and be grateful to Almighty God."

George Washington, a figure of unparalleled respect and admiration, left an indelible mark with his leadership, vision, and steadfast principles. As the inaugural President of the United States and a pivotal figure in the American Revolution, Washington's legacy extends beyond his military and political achievements to encompass his personal beliefs and values.

His words on the duty to acknowledge, obey, and be grateful to Almighty God reflect a deep-seated conviction that shaped his leadership and the founding principles of the nation.

Washington's acknowledgment of a higher power served as a moral compass that guided his decisions and actions. In an era of great uncertainty and conflict, his faith provided a foundation of stability and purpose. He viewed gratitude as an essential virtue — one that connected individuals to something greater than themselves and fostered a sense of communal responsibility.

At Honor Bound FIT, we carry this principle forward. We train the body, strengthen the mind, and cultivate the spirit. Gratitude is not weakness — it is wisdom. The acknowledgment that we did not build ourselves, that we are recipients of something greater, is the beginning of genuine character.

Be grateful. It costs nothing. It changes everything.`,
  },
  {
    slug: "greatest-political-document",
    title: "The Greatest Political Document Ever Written",
    category: "CORE_VALUES" as const,
    featuredImage: "/images/Honor-Bound-FIT-US-Constitution.png",
    content: `The United States Constitution isn't just a set of rules — it's a transformational document. It's a moral and political blueprint for freedom and order. This isn't exaggeration. It's truth — bold and sometimes inconvenient, but truth all the same.

A Moral Foundation Rooted in Timeless Truths

The Constitution was written by men who understood that human nature is flawed — that power corrupts, that majorities can oppress minorities, that governments tend toward tyranny if left unchecked. So they built a system specifically designed to fight those tendencies.

Separation of powers. Checks and balances. An independent judiciary. Freedom of speech, religion, and assembly. The right to bear arms. Protection against unreasonable search and seizure. The presumption of innocence.

These aren't bureaucratic technicalities. They are hard-won wisdom, purchased in blood across centuries of human experience with tyranny, monarchy, and mob rule.

No document in human history has produced more freedom for more people over a longer period of time. That's not American arrogance — it's American fact.

The Constitution is not perfect. It was written by imperfect people in an imperfect era. But its framework — the idea that government derives its just powers from the consent of the governed, and that individual rights precede and supersede government authority — is revolutionary still.

Understand it. Defend it. Be grateful for it.`,
  },
];

const HERO_TREE = [
  {
    slug: "john-basilone",
    name: "John Basilone",
    branch: "USMC",
    rank: "Gunnery Sergeant",
    hometown: "Raritan, New Jersey",
    unit: "D Company, 1st Battalion, 7th Marines",
    content: `Full Name: John Basilone\nHometown: Raritan, New Jersey\nRank/Branch: Gunnery Sergeant (GySgt), United States Marine Corps\nKey Unit(s): D Company, 1st Battalion, 7th Marines, 1st Marine Division\n\nJohn Basilone is one of the most decorated Marines in American history. During the Battle of Guadalcanal in October 1942, he commanded two sections of machine guns against an overwhelming Japanese assault. For nearly two days, he held his position, keeping his guns firing and personally carrying ammunition through enemy fire. His actions that night helped turn the tide of the battle.\n\nFor his actions at Guadalcanal, Basilone was awarded the Medal of Honor — the first enlisted Marine to receive it in World War II.\n\nRather than remain stateside as a war hero, Basilone voluntarily returned to combat. He was killed on February 19, 1945, during the Battle of Iwo Jima, leading his platoon against a Japanese blockhouse. He was posthumously awarded the Navy Cross.\n\nHe was 28 years old.`,
  },
  {
    slug: "mitchell-paige",
    name: "Mitchell Paige",
    branch: "USMC",
    rank: "Colonel (retired)",
    hometown: "Charleroi, Pennsylvania",
    unit: "2nd Battalion, 7th Marines, 1st Marine Division",
    content: `Full Name: Mitchell Paige\nHometown: Charleroi, Pennsylvania\nRank/Branch: Colonel, United States Marine Corps\nKey Unit(s): 2nd Battalion, 7th Marines, 1st Marine Division\n\nOn the night of October 25-26, 1942, Platoon Sergeant Mitchell Paige manned his machine gun position on Guadalcanal as Japanese forces attacked in overwhelming numbers. As his men fell around him, Paige moved from gun to gun, keeping the weapons firing. At one point he was the only man left standing.\n\nWhen dawn came, he led a bayonet charge that drove the remaining enemy from the ridge. For his actions, he was awarded the Medal of Honor.\n\nMitchell Paige served until 1959 and died in 2003. He is buried in La Quinta, California.`,
  },
  {
    slug: "william-g-leftwich",
    name: "William G. Leftwich",
    branch: "USMC",
    rank: "Lieutenant Colonel",
    hometown: "Memphis, Tennessee",
    unit: "3rd Reconnaissance Battalion",
    content: `Full Name: William Groom Leftwich\nHometown: Memphis, Tennessee\nRank/Branch: Lieutenant Colonel (LtCol), United States Marine Corps\nKey Unit(s): Commander, 3rd Reconnaissance Battalion\n\nLieutenant Colonel William G. Leftwich was killed on November 18, 1970, when his helicopter was shot down during a reconnaissance mission in Vietnam. He was 36 years old.\n\nLeftwich was widely regarded as one of the finest officers of his generation. A graduate of the Naval Academy, he was known for his tactical brilliance, personal courage, and extraordinary care for his Marines.\n\nHe was posthumously awarded the Navy Cross for his actions on the night he was killed — having repeatedly exposed himself to enemy fire to extract wounded Marines before his helicopter was brought down.\n\nLeftwich Hall at Marine Corps Base Quantico is named in his honor. His legacy lives in every reconnaissance Marine who follows.`,
  },
  {
    slug: "daniel-b-chaires",
    name: "Daniel B. Chaires",
    branch: "USMC",
    rank: "Lance Corporal",
    hometown: "Tallahassee, Florida",
    unit: "2nd Battalion, 7th Marines",
    content: `Full Name: Daniel Burroughs Chaires\nHometown: Tallahassee, Florida\nRank/Branch: Lance Corporal (LCpl), United States Marine Corps\nKey Unit(s): 2nd Battalion, 7th Marines\n\nLance Corporal Daniel B. Chaires was killed in action during Operation Enduring Freedom in Afghanistan. He gave his life in service to his country and his fellow Marines.\n\nHe is honored on the Hero Tree for his sacrifice and his connection to our community.`,
  },
  {
    slug: "kevin-b-joyce",
    name: "Kevin B. Joyce",
    branch: "USMC",
    rank: "Lance Corporal",
    hometown: "Klagetoh / Ganado, Arizona (Navajo Nation)",
    unit: "United States Marine Corps",
    content: `Full Name: Kevin Boyd Joyce\nHometown: Klagetoh / Ganado, Arizona, on the Navajo Nation\nRank/Branch: Lance Corporal (LCpl), United States Marine Corps\n\nLance Corporal Kevin B. Joyce served with honor and distinction in the United States Marine Corps. He is honored on the Hero Tree for his service and sacrifice.\n\nHis Navajo heritage reflects a proud tradition — the Navajo people have served in the United States military at extraordinary rates for generations, continuing the legacy of the Code Talkers and those who came before.`,
  },
  {
    slug: "steven-a-valdez",
    name: "Steven A. Valdez",
    branch: "USMC",
    rank: "Lance Corporal",
    hometown: "McRae, Arkansas",
    unit: "Echo Company, USMC",
    content: `Full Name: Steven Armando Valdez\nHometown: McRae, Arkansas\nRank/Branch: Lance Corporal (LCpl), United States Marine Corps\nKey Unit(s): Echo Company\n\nLance Corporal Steven A. Valdez served in the United States Marine Corps. He is honored on the Hero Tree for his service and the sacrifice he made for his country and his fellow Marines.`,
  },
  {
    slug: "anthony-capra",
    name: "Anthony Capra",
    branch: "USAF",
    rank: "Technical Sergeant",
    hometown: "Hanford, California / Indian Head, Maryland",
    unit: "United States Air Force",
    content: `Full Name: Anthony Louis Capra\nHometown: Hanford, California; Indian Head, Maryland\nRank/Branch: Technical Sergeant (TSgt), United States Air Force\n\nTechnical Sergeant Anthony Capra served in the United States Air Force with distinction. He is honored on the Hero Tree for his service to this nation.`,
  },
  {
    slug: "ford-tyson-humphrey",
    name: 'Ford Tyson "Toby" Humphrey, Jr.',
    branch: "Law Enforcement",
    rank: "Deputy Sheriff",
    hometown: "Stafford, Virginia",
    unit: "Stafford County Sheriff's Office, Virginia",
    content: `Full Name: Ford Tyson "Toby" Humphrey, Jr.\nHometown: Stafford, Virginia\nService/Role: Deputy Sheriff, Stafford County Sheriff's Office, Virginia\n\nDeputy Sheriff Toby Humphrey served the people of Stafford County, Virginia, with dedication and honor. He is remembered by his community and his fellow officers.\n\nHe is honored on the Hero Tree for his service as a law enforcement officer and his connection to the Honor Bound FIT community.`,
  },
  {
    slug: "jason-mooney",
    name: "Jason Mooney",
    branch: "Law Enforcement",
    rank: "Deputy Sheriff",
    hometown: "Stafford, Virginia",
    unit: "Stafford County Sheriff's Office, Virginia",
    content: `Full Name: Jason Edward Mooney\nHometown: Stafford, Virginia\nService/Role: Deputy Sheriff, Stafford County Sheriff's Office, Virginia\nDeath: October 19, [year]\n\nDeputy Sheriff Jason Mooney served the people of Stafford County with honor and commitment. He gave his life in the line of duty.\n\nHe is honored on the Hero Tree for his service and sacrifice, and for his connection to the community that Honor Bound FIT serves.`,
  },
  {
    slug: "jessica-cheney",
    name: "Jessica Cheney",
    branch: "Law Enforcement",
    rank: "Trooper II",
    hometown: "Virginia",
    unit: "Virginia State Police",
    content: `Full Name: Jessica Jean Cheney\nHometown: Virginia\nService/Role: Virginia State Police (VSP), Trooper II\nDeath: January 17, 1998 — Struck by a passing vehicle during a traffic stop on I-95.\n\nTrooper Jessica Cheney gave her life protecting the people of Virginia. She was struck and killed while conducting a traffic stop on Interstate 95 on January 17, 1998.\n\nShe is honored on the Hero Tree for her sacrifice and her service to the Commonwealth of Virginia.`,
  },
  {
    slug: "mia-ethridge",
    name: "Mia Ethridge",
    branch: "Fire & EMS",
    rank: "Firefighter / EMT",
    hometown: "Stafford, Virginia",
    unit: "Louisa County Department of Fire & EMS / Stafford Volunteer Fire & Rescue",
    content: `Full Name: Mia Regina Ethridge\nHometown: Stafford, Virginia\nService/Role: Firefighter / EMT, Louisa County Department of Fire & EMS, Stafford Volunteer Fire & Rescue\n\nMia Ethridge served her community as both a firefighter and an EMT. She dedicated herself to protecting and saving lives in Stafford and Louisa counties.\n\nShe is honored on the Hero Tree for her service as a first responder and her connection to the Honor Bound FIT community.`,
  },
  {
    slug: "uss-cole-victims",
    name: "The 17 Victims of the USS Cole Bombing",
    branch: "US Navy",
    rank: "Various",
    unit: "USS Cole (DDG-67)",
    content: `On October 12, 2000, the guided-missile destroyer USS Cole (DDG-67) was attacked by al-Qaeda suicide bombers while refueling in the port of Aden, Yemen. The attack killed 17 American sailors and wounded 39 others.\n\nThe 17 killed:\n1. Hull Maintenance Technician 3rd Class Kenneth Eugene Clodfelter\n2. Electronics Technician Chief Petty Officer Richard Costelow\n3. Mess Management Specialist Seaman Lakeina Monique Francis\n4. Information Systems Technician Seaman Timothy Lee Gauna\n5. Signalman Seaman Cherone Louis Gunn\n6. Seaman James Rodrick McDaniels\n7. Electronics Warfare Technician 2nd Class Marc Ian Nieto\n8. Electronics Warfare Technician 2nd Class Ronald Scott Owens\n9. Seaman Lakiba Nicole Palmer\n10. Engineman 2nd Class Joshua Langdon Parlett\n11. Fireman Patrick Howard Roy\n12. Electronics Warfare Technician 1st Class Kevin Shawn Rux\n13. Mess Management Specialist 2nd Class Ronchester Mananga Santiago\n14. Operations Specialist 2nd Class Timothy Lamont Saunders\n15. Fireman Otis Vincent Tolbert\n16. Yeoman 3rd Class Craig Bryan Wibberley\n17. Hull Maintenance Technician 3rd Class Derrick Lynn Harris\n\nThey were killed in service to their country. We remember them all.`,
  },
];

async function main() {
  console.log("🌱 Seeding Core Values...");
  for (const post of CORE_VALUES) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { title: post.title, content: post.content, featuredImage: post.featuredImage ?? null },
      create: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        category: post.category,
        featuredImage: post.featuredImage ?? null,
        status: "PUBLISHED",
      },
    });
    console.log(`  ✓ ${post.title.substring(0, 60)}...`);
  }

  console.log("\n🌱 Seeding Hero Tree...");
  for (const hero of HERO_TREE) {
    await prisma.heroTreeEntry.upsert({
      where: { slug: hero.slug },
      update: { name: hero.name, content: hero.content },
      create: {
        name: hero.name,
        slug: hero.slug,
        branch: hero.branch,
        rank: hero.rank,
        hometown: hero.hometown ?? null,
        unit: hero.unit ?? null,
        content: hero.content,
        status: "PUBLISHED",
      },
    });
    console.log(`  ✓ ${hero.name}`);
  }

  console.log("\n🌱 Seeding Membership Plans...");
  const plans = [
    { slug: "base", name: "Base Membership", monthlyPrice: 100_00, stripePriceId: "price_1TvlxvLg281PLi1sXGjqVF2S", isGap: false, requiresApproval: false, sortOrder: 0 },
    { slug: "gap-veteran", name: "GAP Program — Veteran", monthlyPrice: 75_00, stripePriceId: "price_1TvlxzLg281PLi1svslpa5iN", isGap: true, requiresApproval: true, sortOrder: 1 },
    { slug: "gap-active", name: "GAP Program — Active Duty / Guard / Reserve", monthlyPrice: 75_00, stripePriceId: "price_1Tvly5Lg281PLi1sUE7gt2PP", isGap: true, requiresApproval: true, sortOrder: 2 },
    { slug: "gap-first-responder", name: "GAP Program — First Responder", monthlyPrice: 75_00, stripePriceId: "price_1Tvly9Lg281PLi1s9KylEiZ0", isGap: true, requiresApproval: true, sortOrder: 3 },
    { slug: "gap-medical", name: "GAP Program — Medical Student", monthlyPrice: 75_00, stripePriceId: "price_1TvlyDLg281PLi1s0P35yWAp", isGap: true, requiresApproval: true, sortOrder: 4 },
    { slug: "gap-clergy", name: "GAP Program — Clergy", monthlyPrice: 75_00, stripePriceId: "price_1TvlyHLg281PLi1smyL09kw6", isGap: true, requiresApproval: true, sortOrder: 5 },
    { slug: "homeschool-heroes", name: "Homeschool Heroes", monthlyPrice: 75_00, stripePriceId: "price_1TvlyMLg281PLi1swaEgpvXs", isGap: false, requiresApproval: false, sortOrder: 6 },
    { slug: "tribal-elders", name: "Tribal Elders", monthlyPrice: 75_00, stripePriceId: "price_1TvlyTLg281PLi1sBfbCboFM", isGap: false, requiresApproval: false, sortOrder: 7 },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: { stripePriceId: plan.stripePriceId },
      create: {
        name: plan.name,
        slug: plan.slug,
        monthlyPrice: plan.monthlyPrice,
        addOnPrice: 50_00,
        householdCap: 200_00,
        stripePriceId: plan.stripePriceId,
        isGap: plan.isGap,
        requiresApproval: plan.requiresApproval,
        sortOrder: plan.sortOrder,
      },
    });
    console.log(`  ✓ ${plan.name}`);
  }

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
