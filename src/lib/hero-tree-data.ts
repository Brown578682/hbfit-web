// Static hero tree data — sourced directly from honorboundfit.com posts
// Each entry mirrors the original post content exactly as written by Rich Brown

export interface HeroEntry {
  slug: string
  name: string
  rank: string
  branch: string
  hometown?: string
  unit?: string
  imageSrc: string
  submittedBy?: string
  content: string
  // For USS Cole: individual sailor entries
  sailors?: USSColeSailor[]
}

export interface USSColeSailor {
  name: string
  hometown: string
  rank: string
  summary: string
}

export const HERO_ENTRIES: HeroEntry[] = [
  {
    slug: 'john-basilone',
    name: 'John Basilone',
    rank: 'Gunnery Sergeant (GySgt)',
    branch: 'United States Marine Corps',
    hometown: 'Raritan, New Jersey',
    unit: 'D Company, 1st Battalion, 7th Marines, 1st Marine Division (Guadalcanal); C Company, 1st Battalion, 27th Marines, 5th Marine Division (Iwo Jima)',
    imageSrc: '/images/heroes/John-Basilone.avif',
    submittedBy: 'Rich Brown',
    content: `John Basilone remains one of the most revered Marines in American history—a symbol of grit, sacrifice, and indomitable courage. A machine gun section leader with the 1st Battalion, 7th Marines, Basilone earned the Medal of Honor for his extraordinary actions on Guadalcanal. During an intense, sustained Japanese assault, he held critical defensive positions with a handful of Marines, repairing weapons under fire, running ammunition through enemy-held terrain, and personally inflicting devastating losses on the attackers. His leadership and refusal to yield were instrumental in preventing a breakthrough that could have cost the Marines the entire line.

After receiving the Medal of Honor, Basilone was pulled from combat to participate in war bond tours—but he insisted on returning to the fight. Assigned to the 5th Marine Division, he landed on Iwo Jima on February 19, 1945. Within minutes of hitting the beach, he destroyed a blockhouse with demolitions, guided a tank safely through a minefield and kill zone, and continued directing Marines forward until he was killed by enemy fire. For these actions he posthumously received the Navy Cross. Basilone's legacy endures as the embodiment of the Marine Corps ethos: a warrior who never asked others to do what he wasn't willing to do himself, and who led from the very front until his last breath.`,
  },
  {
    slug: 'mitchell-paige',
    name: 'Mitchell Paige',
    rank: 'Colonel',
    branch: 'United States Marine Corps',
    hometown: 'Charleroi, Pennsylvania',
    unit: '2nd Battalion, 7th Marines, 1st Marine Division (Guadalcanal)',
    imageSrc: '/images/heroes/Mitchell-Paige.avif',
    submittedBy: 'Rich Brown',
    content: `Mitchell Paige is remembered as one of the fiercest machine gun leaders in Marine Corps history, earning the Medal of Honor for actions that helped save the 1st Marine Division during the Battle of Guadalcanal. On the night of October 25, 1942, Japanese forces launched a massive, coordinated assault against the Marine lines. Paige's machine gun section absorbed the brunt of the attack. As his Marines were killed or wounded, he single-handedly operated four different machine guns, moving between positions under relentless fire and maintaining a steady stream of fire that held back repeated enemy charges. His refusal to yield, and his ability to keep the guns in action despite overwhelming odds, prevented a breakthrough and stabilized a collapsing flank.

When the Japanese assault finally faltered, Paige rallied the remaining Marines and led a bayonet charge that drove the enemy off the ridge entirely. His gallantry became one of the defining legends of Guadalcanal. After the war, Paige received a commission and continued to serve honorably through the Korean War, eventually retiring as a colonel. A humble and fiercely patriotic Marine, he dedicated his later life to speaking with young Americans about service, sacrifice, and love of country. His legacy endures as a reminder that a single determined Marine can make a difference when everything hangs in the balance.`,
  },
  {
    slug: 'william-g-leftwich',
    name: 'William G. Leftwich',
    rank: 'Lieutenant Colonel (LtCol)',
    branch: 'United States Marine Corps',
    hometown: 'Memphis, Tennessee',
    unit: 'Commander, 1st Reconnaissance Battalion, 1st Marine Division',
    imageSrc: '/images/heroes/William-G-Leftwich.avif',
    submittedBy: 'Rich Brown',
    content: `William Groom Leftwich Jr. was one of the Marine Corps' most respected combat leaders of the Vietnam era, known for his intelligence, calm under fire, and fierce loyalty to the Marines he led. A native of Memphis, Tennessee, he graduated from the U.S. Naval Academy, where he served as Commander of the Brigade of Midshipmen, and went on to a distinguished career as an infantry and reconnaissance officer. In Vietnam, he first served as Senior Task Force Advisor to the Vietnamese Marine Brigade, where his heroism in leading a counterattack to relieve the besieged village of Hoai An on 9 March 1965 earned him the Navy Cross. Wounded multiple times during that action, he refused evacuation until air support was coordinated and his Marines were positioned to succeed.

By 1970, Leftwich was commanding the 1st Reconnaissance Battalion, 1st Marine Division—a job that placed him at the very tip of the spear. On November 18, 1970, after personally accompanying a helicopter extraction to pull one of his recon teams out of heavy contact in mountainous terrain, the aircraft crashed into a hillside in poor weather, killing Leftwich and all aboard. His loss was deeply felt across the Corps, and his legacy has been honored in many ways: the destroyer USS Leftwich (DD-984) was named for him, the Armel-Leftwich Visitor Center at the Naval Academy bears his name, and the Marine Corps' Leftwich Trophy is awarded annually to an outstanding captain in the Fleet Marine Force for leadership in his memory. For Marines and warriors who come after, Leftwich stands as the model of a commander who never asked others to take a risk he was unwilling to share.`,
  },
  {
    slug: 'daniel-b-chaires',
    name: 'Daniel B. Chaires',
    rank: 'Lance Corporal (LCpl)',
    branch: 'United States Marine Corps',
    hometown: 'Tallahassee, Florida',
    unit: '2nd Bn, 3rd Marines, 3rd Marine Division',
    imageSrc: '/images/heroes/Daniel-B-Chaires.avif',
    submittedBy: 'his Team Leader and friend, Rich Brown',
    content: `Daniel B. Chaires volunteered to serve in the United States Marine Corps, following in his father's footsteps. He was determined to enlist—even enduring a difficult process that included multiple physicals before being accepted. He was assigned to Echo Company, 2nd Battalion, 3rd Marines out of Kaneohe Bay, Hawaii, and deployed to Iraq in support of Operation Iraqi Freedom.

On October 25, 2006, while on patrol in Iraq's Anbar province, LCpl Chaires was wounded by enemy fire in a well-set ambush. Despite being hit, he provided security and returned fire, reportedly staying engaged long enough to allow medics to reach him and fellow Marines to withdraw. He later succumbed to his wounds, giving his life in service to his country at the age of 20.

Chaires is remembered by his community in Tallahassee, and his legacy endures in tributes and memorials by fellow Marines — a young Marine whose sacrifice stands as a solemn reminder of the costs of war and the valor of those who answer the call.`,
  },
  {
    slug: 'kevin-b-joyce',
    name: 'Kevin B. Joyce',
    rank: 'Lance Corporal (LCpl)',
    branch: 'United States Marine Corps',
    hometown: 'Klagetoh / Ganado, Arizona, on the Navajo Nation',
    unit: '2nd Bn, 3rd Marines, 3rd Marine Division',
    imageSrc: '/images/heroes/Kevin-B-Joyce.avif',
    submittedBy: 'his friend, Rich Brown',
    content: `Lance Corporal Kevin Boyd Joyce was a young Navajo Marine from the Klagetoh/Ganado area of Arizona who answered the call to serve after graduating high school. Assigned to Echo Company, 2nd Battalion, 3rd Marines out of Kaneohe Bay, Hawaii, he deployed to Afghanistan in 2005 as part of Operation Enduring Freedom. In Kunar Province—one of the most rugged and dangerous parts of the country—Kevin and his fellow Marines were tasked with patrolling steep valleys, maintaining security around remote outposts, and supporting Afghan forces in the fight against insurgents.

On the night of June 25, 2005, while returning to base along a narrow road beside the Pech River, the edge of the road gave way beneath Kevin's vehicle. He and two other Marines bailed out as the vehicle slid; the others made it out, but the river's powerful current swept him away. After an intense search, he was officially recovered on July 4, 2005.

Forward Operating Base Joyce was later named in his honor, ensuring his name would remain on the maps of the very valley where he served. Friends, family, and fellow Marines remember him as a quiet, good-natured warrior who carried both his people's heritage and the Eagle, Globe, and Anchor into one of the toughest combat zones of the war.`,
  },
  {
    slug: 'steven-a-valdez',
    name: 'Steven A. Valdez',
    rank: 'Lance Corporal (LCpl)',
    branch: 'United States Marine Corps',
    hometown: 'McRae, Arkansas',
    unit: 'Echo Company, Weapons Platoon, 2nd Bn, 3rd Marines, 3rd Marine Division',
    imageSrc: '/images/heroes/steven-valdez.avif',
    submittedBy: 'his friend, Rich Brown',
    content: `Lance Corporal Steven A. Valdez answered the call to serve in the United States Marine Corps after graduating high school, leaving behind his hometown of McRae, Arkansas. Assigned to the 2nd Battalion, 3rd Marines out of Kaneohe Bay, he deployed to Afghanistan in support of Operation Enduring Freedom. On September 26, 2005 — just 20 years old — Steven was killed by enemy mortar fire while defending Camp Blessing, giving his young life in service of his country.

Though his time in uniform was short, Steven's sacrifice remains a powerful reminder of the cost of liberty and the courage of those who volunteer. By sharing his story on the Hero Tree, we ensure that even a young Marine from Arkansas — far from home — is remembered among our community's honored heroes.`,
  },
  {
    slug: 'anthony-capra',
    name: 'Anthony Capra',
    rank: 'Technical Sergeant (Tech Sgt)',
    branch: 'United States Air Force',
    hometown: 'Hanford, California; Indian Head, Maryland',
    unit: 'Detachment 63, 688th Armament Systems Squadron, Indian Head, Maryland; 96th Civil Engineer Squadron, Eglin AFB, Florida',
    imageSrc: '/images/heroes/anthony-capra.avif',
    submittedBy: 'Michelle King',
    content: `Tech Sgt Anthony "Tony" Capra was an Air Force explosive ordnance disposal (EOD) technician whose life and service reflected quiet courage and deep devotion—to his country, his family, and his teammates. A native of Denver with strong ties to Hanford, California, and Indian Head, Maryland, he entered the Air Force in 1997 and quickly found his calling in the EOD community. From Eglin Air Force Base in Florida to deployments downrange, Tony built a reputation as the kind of NCO you wanted on the job when things were at their worst: sharp under pressure, meticulous with details, and always willing to shoulder risk so others didn't have to. He had already earned a Bronze Star during a prior Iraq deployment before returning again in 2008.

On April 9, 2008, during his 107th combat mission, Tony was conducting post-blast analysis on a roadside bomb crater near Forward Operating Base Paliwoda, in the Golden Hills area west of Balad. As he investigated the scene, he discovered a secondary improvised explosive device only a few meters away; while attempting to render that device safe, it detonated, fatally wounding him. For his actions and leadership, he was posthumously awarded the Bronze Star Medal with "V" device and Oak Leaf Cluster. Friends and commanders remembered him as a man who could light up a room, an EOD tech who made the lonely walk toward the threat so others could live, and a devoted husband and father of five whose legacy endures in the lives he protected and the freedoms he helped preserve.`,
  },
  {
    slug: 'toby-humphrey',
    name: "Ford Tyson \"Toby\" Humphrey, Jr.",
    rank: 'Deputy Sheriff',
    branch: "Stafford County Sheriff's Office, Virginia",
    hometown: 'Stafford, Virginia',
    imageSrc: '/images/heroes/toby-humphrey.avif',
    submittedBy: 'The Quinn Family',
    content: `Deputy Sheriff Ford Tyson "Toby" Humphrey, Jr. gave his life in service to the people of Stafford County. On the night of October 9, 1980, he responded to a domestic disturbance call and was shot while attempting to de-escalate the situation — paying the ultimate price at just 25 years old. Before becoming a deputy, Toby was known in the community not only for his commitment to law enforcement, but also as a volunteer with the Fredericksburg Rescue Squad — a reminder that his dedication to service extended beyond the badge.

Today, his legacy lives on not just in memory, but in the very infrastructure of local public safety. The county's modern Public Safety Center was named the "Ford T. Humphrey Building" in his honor — ensuring every future generation knows the name of a man who served, responded, and never came home. His sacrifice stands as a stark reminder of the dangers faced by those who commit themselves to protecting others, and as a lasting tribute to loyalty, duty, and quiet valor.`,
  },
  {
    slug: 'jason-mooney',
    name: 'Jason Mooney',
    rank: 'Deputy Sheriff',
    branch: "Stafford County Sheriff's Office, Virginia",
    hometown: 'Stafford, Virginia',
    imageSrc: '/images/heroes/jason-mooney.avif',
    submittedBy: 'The Quinn Family',
    content: `Deputy Sheriff Jason Edward Mooney answered the call to serve not just once—but twice. As a US Marine and then as a patrol deputy with Stafford County, he devoted his short life to protecting others. On October 19, 2007, while responding to what began as a serious accident on I-95, Mooney was killed when his vehicle crashed. He was just 24 years old, yet his commitment and sense of duty had already left a mark on the community.

Jason's legacy is a reminder of the risks public servants face when they go to work to safeguard strangers and neighbors alike. The Stafford County Sheriff's Office continues to honor him each year, and the local fire/rescue community remembers him as a Marine, a deputy, and a volunteer — a brother in uniform whose sacrifice is woven into the fabric of local service.`,
  },
  {
    slug: 'jessica-cheney',
    name: 'Jessica Cheney',
    rank: 'Trooper II',
    branch: 'Virginia State Police',
    hometown: 'Virginia',
    unit: 'Division II — Stafford County and surrounding region',
    imageSrc: '/images/heroes/jessica-cheney.avif',
    submittedBy: 'The Quinn Family',
    content: `Jessica Jean Cheney dedicated herself to serving the citizens of Virginia, following family tradition and answering the call of duty. After graduating from the Virginia State Police Academy in June 1996 — at the time the youngest female trooper ever — she served in Division II, patrolling Stafford County and the surrounding region. Her commitment to public safety, professionalism, and community protection reflected the highest ideals of law enforcement, and she quickly became respected among her colleagues.

On January 17, 1998, while directing traffic at the scene of a separate motor vehicle accident on U.S. Route 1, Trooper Cheney was struck by a passing vehicle that crested a hill and failed to stop. Severely injured, she was airlifted to a hospital but tragically succumbed to her wounds that evening. Her badge — number 980 — was the first ever retired by the Virginia State Police, a permanent symbol of her sacrifice. Her loss remains a solemn reminder of the risks borne daily by those who stand between danger and the public, and of the price some pay in service to their communities.`,
  },
  {
    slug: 'mia-ethridge',
    name: 'Mia Ethridge',
    rank: 'Firefighter / EMT',
    branch: 'Louisa County Department of Fire & EMS; Stafford Volunteer Fire Department',
    hometown: 'Stafford, Virginia',
    imageSrc: '/images/heroes/mia-ethridge.avif',
    submittedBy: 'Michelle King',
    content: `Mia Regina Ethridge answered the call to serve her community with the kind of passion and heart that many spend a lifetime searching for. A young woman in her early twenties, she balanced her volunteer roots in the Stafford County Fire & Rescue service while answering a full-time call with Louisa County Department of Fire & EMS. In that short time she became known for her bright-eyed energy, easy smile, and a commitment to learn and serve. She was often among the first to step up — whether training, mentoring newer members, or simply lifting the mood in the firehouse with her lively spirit. Her drive had already set her on a path toward water rescue certification and paramedic training.

On July 9, 2023, while responding to a fire in difficult weather, the engine she rode in ran off the road and struck a tree — a tragic accident that would ultimately claim her life after an eight-week hospitalization. The fire-rescue community and the citizens she served mourned the loss deeply. In death, Mia demonstrated the same giving spirit she carried in life: her family donated her organs, offering others a chance at life even after her sacrifice. Today, she stands as a reminder — a "sunbeam" extinguished too soon — but also a beacon of selfless service, courage, and the impact a single young firefighter can have on her community.`,
  },
  {
    slug: 'uss-cole-victims',
    name: 'The 17 Victims of the USS Cole Bombing',
    rank: 'United States Navy',
    branch: 'United States Navy',
    hometown: 'Multiple',
    unit: 'USS Cole (DDG-67)',
    imageSrc: '/images/heroes/uss-cole.avif',
    submittedBy: 'LN1 (Retired) Geoff Wood',
    content: `On October 12, 2000, the guided-missile destroyer USS Cole (DDG-67) was attacked by al-Qaeda suicide bombers while refueling in the port of Aden, Yemen. The blast tore a massive hole in the ship's hull, killing 17 sailors and injuring dozens more in the deadliest attack on a U.S. Navy vessel since the 1980s.

Those 17 sailors came from small towns and big cities all across America—Virginia, Texas, California, North Dakota, Maryland, New York, Wisconsin, North Carolina, Georgia, Florida, Mississippi, and Pennsylvania. They were chiefs and junior sailors, technicians and cooks, kids fresh out of high school and seasoned petty officers. What unites them is that they were all doing their duty aboard Cole that morning, standing the watch so others could sleep in peace. This post honors each of them by name, rate, and hometown, so their stories are remembered together.`,
    sailors: [
      {
        name: 'Kenneth Eugene Clodfelter',
        hometown: 'Mechanicsville, Virginia',
        rank: 'Hull Maintenance Technician 2nd Class, United States Navy',
        summary: `Kenneth was a young husband and father whose world revolved around his wife and little boy; his parents still describe him first as a devoted dad who just happened to wear Navy blue. Years later, the Navy honored him at a Memorial Day NASCAR race, a fitting tribute for a Virginia kid who loved racing and service in equal measure.`,
      },
      {
        name: 'Richard Dean Costelow',
        hometown: 'Morrisville, PA',
        rank: 'Chief Electronics Technician, United States Navy',
        summary: `Richard's wife once described him in a memorial speech as "my hero" and a man whose quiet faith and integrity anchored their family. Shipmates remembered that he never hesitated to take extra time to mentor younger sailors on complex systems or on life in the fleet.`,
      },
      {
        name: 'Lakeina Monique Francis',
        hometown: 'Woodleaf, NC',
        rank: 'Mess Management Specialist Seaman, United States Navy',
        summary: `Lakeina grew up in a one-stoplight farming community, but she dreamed of seeing the world and building a bigger life through the Navy. Friends and family said that even after her death, the little town of Woodleaf wrapped itself around her parents, holding vigil on their porch night after night to honor the girl who left home in uniform and never came back.`,
      },
      {
        name: 'Timothy Lee Gauna',
        hometown: 'Rice, TX',
        rank: 'Information Systems Technician Seaman, United States Navy',
        summary: `Timothy was a Texas kid who loved computers, music, and working with his hands, which made the information systems rating a natural fit. His family has shared that he was the kind of son who could fix your broken electronics and your bad day in the same visit, with patience and a grin.`,
      },
      {
        name: 'Cherone Louis Gunn',
        hometown: 'Portsmouth / Virginia Beach, VA',
        rank: 'Signalman Seaman, United States Navy',
        summary: `Cherone was a Kempsville High School football player and office volunteer, remembered as a "sweet-natured young man" whose smile disarmed people before his sense of humor did. He dreamed of becoming a police officer and saw the Navy as his stepping stone, trading a Friday-night field for a destroyer's deck to serve something bigger than himself.`,
      },
      {
        name: 'James Rodrick McDaniels',
        hometown: 'Norfolk, VA',
        rank: 'Seaman, United States Navy',
        summary: `James was still just a teenager, drawn to the sea he'd grown up around in Norfolk and proud to wear the same uniform he'd watched on the waterfront his whole life. Family and friends remember him as soft-spoken but fiercely loyal—the kind of shipmate you trusted to show up when the work was dirty, or the watch was long.`,
      },
      {
        name: 'Marc Ian Nieto',
        hometown: 'Fond du Lac, WI (raised in TX)',
        rank: 'Engineman 2nd Class, United States Navy',
        summary: `Marc was only two weeks from leaving the Navy, with a job offer from GE already in hand and a proposal accepted by the woman he loved. His family later donated his uniforms and personal effects to the Wisconsin Veterans Museum so that his story—of discipline, plans, and a future stolen—would continue to be told.`,
      },
      {
        name: 'Ronald Scott Owens',
        hometown: 'Vero Beach, FL',
        rank: 'Electronic Warfare Technician 2nd Class, United States Navy',
        summary: `Ronald left civilian life behind for the Navy because he wanted to be part of something that mattered, eventually earning his way into the demanding world of electronic warfare. Those who served with him talk about how he handled complex gear with ease but never lost the easygoing Florida warmth that made younger sailors feel like they belonged.`,
      },
      {
        name: 'Lakiba Nicole Palmer',
        hometown: 'San Diego, CA',
        rank: 'Seaman, United States Navy',
        summary: `Lakiba ran track, played basketball, and served in Junior ROTC before graduating San Diego High School and shipping out—she was all energy and forward motion. Her hometown later renamed the street where she grew up and an American Legion post in her honor, a permanent reminder that a young woman from that block went to sea and gave everything for her country.`,
      },
      {
        name: 'Joshua Langdon Parlett',
        hometown: 'Churchville, MD',
        rank: 'Engineman Fireman, United States Navy',
        summary: `Joshua was the kind of kid who loved tinkering with engines long before he wore Navy coveralls, so working in Cole's engineering spaces felt like home. Friends say he carried a quiet, steady presence that made hard days at sea easier just by having him on the watchbill next to your name.`,
      },
      {
        name: 'Patrick Howard Roy',
        hometown: 'Cornwall-on-Hudson, NY',
        rank: 'Fireman, United States Navy',
        summary: `Patrick was a high-school football player and Civil War buff who chose the Navy but asked to be buried at Antietam, wanting to rest among earlier generations of Americans who'd fallen in uniform. At his funeral, speakers said his life proved that love of history isn't just about the past—it's about deciding what kind of story you're willing to write with your own.`,
      },
      {
        name: 'Kevin Shawn Rux',
        hometown: 'Portland, ND',
        rank: 'Electronic Warfare Technician 1st Class, United States Navy',
        summary: `Kevin served a decade in the Navy, briefly tried civilian police work, then chose to put the uniform back on and re-enlist—a decision his family says came from a deep sense of calling. West Virginia later named a bridge in his honor, so every driver who crosses it passes over a living memorial to a sailor who kept coming back to the fight.`,
      },
      {
        name: 'Ronchester Mananga Santiago',
        hometown: 'Kingsville, TX',
        rank: 'Mess Management Specialist 3rd Class, United States Navy',
        summary: `Ronchester was one of two sailors from Texas' Coastal Bend lost that day, remembered back home as a hard-working young man who was just starting to build a life of service. Local coverage of the anniversary of the attack often highlights his smile and the pride his community still feels that a kid from Kingsville wore the Navy uniform with such honor.`,
      },
      {
        name: 'Timothy Lamont Saunders',
        hometown: 'Ringgold, VA',
        rank: 'Operations Specialist 2nd Class, United States Navy',
        summary: `Timothy was a former high-school athlete who poured that same drive into mastering the chaos of the combat information center, where a destroyer's picture of the fight is built. His family has spoken about how he balanced professional intensity with being a loving son and friend—someone who could track a sky full of contacts and still call home to check on people.`,
      },
      {
        name: 'Gary Graham Swenchonis Jr.',
        hometown: 'Rockport, TX',
        rank: 'Fireman, United States Navy',
        summary: `Gary came from a Navy family and carried that tradition forward with pride, known back home by the nickname "Bubba." Stories from friends and local news remember him as a laid-back Texas beach kid who loved the water and music, and who chose to risk his life at sea so others wouldn't have to.`,
      },
      {
        name: 'Andrew Triplett',
        hometown: 'Macon / Shuqualak, MS',
        rank: 'Ensign (Lt. j.g.), United States Navy',
        summary: `Andrew rose through the enlisted ranks to Chief Petty Officer and then to officer through the Limited Duty Officer program—proof of what brains, grit, and perseverance can do in one Navy career. Mississippi later dedicated a stretch of U.S. Highway 45 as the Chief Petty Officer Andrew Triplett Memorial Highway, so his name now runs alongside the roads he used to drive as a kid.`,
      },
      {
        name: 'Craig Bryan Wibberley',
        hometown: 'Williamsport (born Hagerstown), MD',
        rank: 'Seaman, United States Navy',
        summary: `Craig was a young Marylander who loved computers and planned to make a career in information technology after the Navy; his family created scholarships and memorial efforts to help other students chase the opportunities he never lived to see. At memorial ceremonies, speakers often note that he was the age of many high-school seniors in the audience—reminding them that service and sacrifice are never abstract.`,
      },
    ],
  },
]

export function getHeroBySlug(slug: string): HeroEntry | undefined {
  return HERO_ENTRIES.find((e) => e.slug === slug)
}
