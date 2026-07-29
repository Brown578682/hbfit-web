export type GoalCategory =
  | "strength"
  | "sports"
  | "nutrition"
  | "aesthetics"
  | "mobility"
  | "military";

export interface GoalSuggestion {
  id: string;
  title: string;
  description: string;
  unit?: string;          // e.g. "lbs", "%", "min"
  targetValue?: number;   // default target for the metric
}

export interface SportSubcategory {
  id: string;
  label: string;
  emoji: string;
  goals: GoalSuggestion[];
}

export interface CategoryDefinition {
  id: GoalCategory;
  label: string;
  emoji: string;
  color: string;           // Tailwind border/accent color
  description: string;
  goals?: GoalSuggestion[];          // direct goals (non-sports categories)
  sports?: SportSubcategory[];       // sports category only
}

// ── Strength & Conditioning ───────────────────────────────────────────────────
const strengthGoals: GoalSuggestion[] = [
  {
    id: "s1",
    title: "Deadlift 1.5× bodyweight",
    description: "Build posterior chain strength with a meaningful deadlift milestone.",
    unit: "lbs",
  },
  {
    id: "s2",
    title: "Back squat 1× bodyweight",
    description: "Develop leg strength and full-depth squat mechanics.",
    unit: "lbs",
  },
  {
    id: "s3",
    title: "Bench press 1× bodyweight",
    description: "Build pressing strength with a bodyweight bench target.",
    unit: "lbs",
  },
  {
    id: "s4",
    title: "Complete 10 unbroken pull-ups",
    description: "Master the pull-up — one of the best measures of relative strength.",
    unit: "reps",
    targetValue: 10,
  },
  {
    id: "s5",
    title: "Complete 50 unbroken push-ups",
    description: "Build upper body endurance and pressing stamina.",
    unit: "reps",
    targetValue: 50,
  },
  {
    id: "s6",
    title: "Run a mile in under 8 minutes",
    description: "A solid aerobic baseline for any athlete.",
    unit: "min",
    targetValue: 8,
  },
  {
    id: "s7",
    title: "Hold a plank for 3 minutes",
    description: "Build core stability and anti-extension strength.",
    unit: "min",
    targetValue: 3,
  },
  {
    id: "s8",
    title: "Complete the Murph workout",
    description: "1 mile run, 100 pull-ups, 200 push-ups, 300 squats, 1 mile run.",
  },
  {
    id: "s9",
    title: "Ruck 3 miles with 30 lbs",
    description: "Build work capacity and mental toughness under load.",
    unit: "miles",
    targetValue: 3,
  },
  {
    id: "s10",
    title: "Complete 100 burpees in under 10 minutes",
    description: "The ultimate full-body conditioning benchmark.",
    unit: "min",
    targetValue: 10,
  },
];

// ── Sports ────────────────────────────────────────────────────────────────────
const sportSubcategories: SportSubcategory[] = [
  {
    id: "running",
    label: "Running",
    emoji: "🏃",
    goals: [
      { id: "run1", title: "Complete a 5K", description: "Cross the finish line of your first (or best) 5K.", unit: "min" },
      { id: "run2", title: "Run a sub-25 minute 5K", description: "Break the 8-minute-mile pace over 3.1 miles.", unit: "min", targetValue: 25 },
      { id: "run3", title: "Complete a 10K", description: "Double down — finish a 10K without stopping.", unit: "min" },
      { id: "run4", title: "Run a half marathon", description: "13.1 miles. The real test of aerobic base and mental grit." },
      { id: "run5", title: "Break the 7-minute mile", description: "Push pace and VO2 max to hit sub-7.", unit: "min", targetValue: 7 },
      { id: "run6", title: "Run 3× per week for 90 days", description: "Consistency is the goal — build the habit.", unit: "days" },
      { id: "run7", title: "Complete a trail run", description: "Take it off-road — terrain, elevation, and grit." },
    ],
  },
  {
    id: "rucking",
    label: "Rucking",
    emoji: "🎒",
    goals: [
      { id: "ruck1", title: "Ruck 5 miles with 30 lbs", description: "A solid baseline ruck distance under load.", unit: "miles", targetValue: 5 },
      { id: "ruck2", title: "Complete a GoRuck Tough (12 miles)", description: "The gold standard — 12 miles, 45 lbs, team events." },
      { id: "ruck3", title: "Ruck 3× per week for 60 days", description: "Build the rucking habit for sustained conditioning." },
      { id: "ruck4", title: "Complete a 5K ruck under 45 minutes with 30 lbs", description: "Pace and load combined — a real benchmark.", unit: "min", targetValue: 45 },
      { id: "ruck5", title: "Build up to a 50 lb ruck plate", description: "Progress load over 90 days to carry serious weight.", unit: "lbs", targetValue: 50 },
      { id: "ruck6", title: "Complete a 26.2-mile ruck marathon", description: "The ultimate endurance rucking challenge." },
    ],
  },
  {
    id: "ocr",
    label: "OCR / Obstacle Racing",
    emoji: "🧱",
    goals: [
      { id: "ocr1", title: "Complete a Spartan Sprint (3–5 miles)", description: "First obstacle race — 20+ obstacles, no excuses." },
      { id: "ocr2", title: "Complete a Spartan Super (8–10 miles)", description: "Step up the distance and obstacle count." },
      { id: "ocr3", title: "Complete a Tough Mudder", description: "Team-based, 10–12 miles, built for camaraderie." },
      { id: "ocr4", title: "Finish a race without missing any obstacles", description: "Zero burpee penalties — nail every obstacle." },
      { id: "ocr5", title: "Build grip strength to conquer monkey bars", description: "Train the specific weakness that beats most OCR athletes." },
      { id: "ocr6", title: "Complete a Spartan Trifecta", description: "Sprint + Super + Beast in one calendar year." },
    ],
  },
  {
    id: "basketball",
    label: "Basketball",
    emoji: "🏀",
    goals: [
      { id: "bball1", title: "Play 3 pickup games per week", description: "Show up, run the court, compete." },
      { id: "bball2", title: "Improve vertical jump by 3 inches", description: "Train explosiveness with box jumps, depth drops, and squats.", unit: "inches", targetValue: 3 },
      { id: "bball3", title: "Run full-court without getting winded", description: "Build the conditioning to play your best for 40 minutes." },
      { id: "bball4", title: "Improve lateral quickness and defense", description: "Drop reaction time — build the hips and glutes to stay in front." },
      { id: "bball5", title: "Dunk a basketball", description: "If the rim is in reach — train to get there." },
      { id: "bball6", title: "Drop 15 lbs to improve court speed", description: "Less weight on the knees, more miles per hour.", unit: "lbs", targetValue: 15 },
    ],
  },
  {
    id: "pickleball",
    label: "Pickleball",
    emoji: "🏓",
    goals: [
      { id: "pkl1", title: "Play pickleball 3× per week", description: "Consistency on the court equals improvement." },
      { id: "pkl2", title: "Compete in a local tournament", description: "Sign up, show up, leave everything on the court." },
      { id: "pkl3", title: "Build endurance for 2-hour sessions", description: "Conditioning so the game ends before you do." },
      { id: "pkl4", title: "Develop a consistent third-shot drop", description: "The shot that separates rec players from competitive ones." },
      { id: "pkl5", title: "Improve reaction time and court coverage", description: "Train quick feet and split-step timing with ladder drills." },
      { id: "pkl6", title: "Reduce lower body stiffness to move freely on court", description: "Hip mobility and ankle work for lateral court coverage." },
    ],
  },
  {
    id: "swimming",
    label: "Swimming",
    emoji: "🏊",
    goals: [
      { id: "swim1", title: "Swim 500m without stopping", description: "Build the aerobic base and technique to go the distance.", unit: "m", targetValue: 500 },
      { id: "swim2", title: "Complete a triathlon swim leg (750m–1500m)", description: "Train open-water confidence and efficient freestyle.", unit: "m" },
      { id: "swim3", title: "Swim 3× per week for 60 days", description: "Build the low-impact conditioning habit." },
      { id: "swim4", title: "Learn proper freestyle stroke technique", description: "Efficiency beats effort — fix the fundamentals." },
      { id: "swim5", title: "Complete an open-water swim event", description: "Conquer the mental challenge of open water." },
    ],
  },
  {
    id: "cycling",
    label: "Cycling",
    emoji: "🚴",
    goals: [
      { id: "cyc1", title: "Ride 20 miles without stopping", description: "A solid aerobic baseline for any cyclist.", unit: "miles", targetValue: 20 },
      { id: "cyc2", title: "Complete a century ride (100 miles)", description: "The benchmark ride every serious cyclist targets.", unit: "miles", targetValue: 100 },
      { id: "cyc3", title: "Commute by bike 3× per week", description: "Stack fitness on top of your existing schedule." },
      { id: "cyc4", title: "Improve average speed to 18 mph", description: "Push pace and power output over distance.", unit: "mph", targetValue: 18 },
      { id: "cyc5", title: "Complete a local gran fondo or charity ride", description: "A supported event with distance and community." },
    ],
  },
  {
    id: "boxing",
    label: "Boxing / MMA",
    emoji: "🥊",
    goals: [
      { id: "box1", title: "Compete in a white-collar boxing match", description: "Train for 8–12 weeks and step in the ring." },
      { id: "box2", title: "Learn basic combinations and head movement", description: "Master the fundamentals before adding power." },
      { id: "box3", title: "Spar 3× per week for 8 weeks", description: "Controlled sparring builds real ring IQ fast." },
      { id: "box4", title: "Complete a full 3-round sparring session without gassing", description: "Conditioning that matches your skill level." },
      { id: "box5", title: "Drop weight to compete in a target class", description: "Disciplined cut to meet your ideal fighting weight.", unit: "lbs" },
      { id: "box6", title: "Build explosive punching power through strength training", description: "Posterior chain strength translates directly to knockout power." },
    ],
  },
  {
    id: "powerlifting",
    label: "Powerlifting",
    emoji: "🏋️",
    goals: [
      { id: "pl1", title: "Total 1,000 lbs (squat + bench + deadlift)", description: "The four-plate total — a legitimate powerlifting milestone.", unit: "lbs", targetValue: 1000 },
      { id: "pl2", title: "Compete in a local powerlifting meet", description: "Sign up, cut weight if needed, hit your openers." },
      { id: "pl3", title: "Pull a 400 lb deadlift", description: "Four plates — a benchmark that demands real work.", unit: "lbs", targetValue: 400 },
      { id: "pl4", title: "Bench press 225 lbs", description: "Two plates on each side — a classic strength marker.", unit: "lbs", targetValue: 225 },
      { id: "pl5", title: "Squat 315 lbs (three plates)", description: "Three plates is a milestone every lifter respects.", unit: "lbs", targetValue: 315 },
      { id: "pl6", title: "Improve total by 10% in 90 days", description: "Percentage-based progress — measurable, achievable, honest.", unit: "%" },
    ],
  },
  {
    id: "golf",
    label: "Golf",
    emoji: "⛳",
    goals: [
      { id: "golf1", title: "Break 100 for 18 holes", description: "A major milestone for any developing golfer.", unit: "strokes", targetValue: 100 },
      { id: "golf2", title: "Break 90 for 18 holes", description: "Single-digit handicap territory starts here.", unit: "strokes", targetValue: 90 },
      { id: "golf3", title: "Add 20 yards to average drive distance", description: "Rotational power and hip mobility translate directly to yards.", unit: "yards", targetValue: 20 },
      { id: "golf4", title: "Improve flexibility for a fuller shoulder turn", description: "Thoracic rotation is the hidden engine of the golf swing." },
      { id: "golf5", title: "Lose 20 lbs to move better on the course", description: "Less weight, more rotation, more energy for 18 holes.", unit: "lbs", targetValue: 20 },
      { id: "golf6", title: "Play 2 rounds per week consistently", description: "Reps on the course compound just like reps in the gym." },
    ],
  },
];

// ── Nutrition ─────────────────────────────────────────────────────────────────
const nutritionGoals: GoalSuggestion[] = [
  {
    id: "n1",
    title: "Hit my daily protein goal for 30 consecutive days",
    description: "1g per lb of bodyweight, every day, no excuses.",
    unit: "days",
    targetValue: 30,
  },
  {
    id: "n2",
    title: "Drink 100 oz of water every day for 30 days",
    description: "Hydration is the easiest performance lever most people ignore.",
    unit: "days",
    targetValue: 30,
  },
  {
    id: "n3",
    title: "Cut out processed sugar for 30 days",
    description: "Reset your relationship with food and inflammation.",
    unit: "days",
    targetValue: 30,
  },
  {
    id: "n4",
    title: "Meal prep every Sunday for 8 weeks",
    description: "Control what you eat by controlling what's in the fridge.",
    unit: "weeks",
    targetValue: 8,
  },
  {
    id: "n5",
    title: "Eliminate alcohol for 60 days",
    description: "Sleep improves, recovery accelerates, fat loss unlocks.",
    unit: "days",
    targetValue: 60,
  },
  {
    id: "n6",
    title: "Track macros every day for 90 days",
    description: "You can't out-train a diet you don't understand.",
    unit: "days",
    targetValue: 90,
  },
  {
    id: "n7",
    title: "Maintain a caloric deficit for 8 weeks",
    description: "Sustainable fat loss through consistent energy balance.",
    unit: "weeks",
    targetValue: 8,
  },
  {
    id: "n8",
    title: "Eat 5 servings of vegetables per day",
    description: "Micronutrients, fiber, and satiety — the trifecta of clean eating.",
    unit: "servings",
    targetValue: 5,
  },
  {
    id: "n9",
    title: "Learn to cook 5 new healthy meals",
    description: "Skills in the kitchen are skills in the gym.",
    unit: "meals",
    targetValue: 5,
  },
  {
    id: "n10",
    title: "Stop eating after 8 PM for 60 days",
    description: "Control your eating window and improve sleep quality.",
    unit: "days",
    targetValue: 60,
  },
];

// ── Aesthetics ────────────────────────────────────────────────────────────────
const aestheticsGoals: GoalSuggestion[] = [
  {
    id: "a1",
    title: "Lose 10 lbs of body fat",
    description: "A meaningful, achievable fat loss milestone in 90 days.",
    unit: "lbs",
    targetValue: 10,
  },
  {
    id: "a2",
    title: "Lose 20 lbs",
    description: "A transformative cut — requires discipline in both gym and kitchen.",
    unit: "lbs",
    targetValue: 20,
  },
  {
    id: "a3",
    title: "Lose 30 lbs",
    description: "A major transformation goal — commit to the full program.",
    unit: "lbs",
    targetValue: 30,
  },
  {
    id: "a4",
    title: "Reduce body fat percentage by 5%",
    description: "Percentage-based fat loss — measurable and independent of scale weight.",
    unit: "%",
    targetValue: 5,
  },
  {
    id: "a5",
    title: "Gain 10 lbs of lean muscle",
    description: "A realistic muscle-building goal over a focused training block.",
    unit: "lbs",
    targetValue: 10,
  },
  {
    id: "a6",
    title: "See visible abdominal definition",
    description: "Built in the gym, revealed in the kitchen.",
  },
  {
    id: "a7",
    title: "Drop one clothing size",
    description: "Fit into clothes you haven't worn in years — or buy new ones.",
  },
  {
    id: "a8",
    title: "Reduce waist circumference by 3 inches",
    description: "The most health-relevant measurement on your body.",
    unit: "inches",
    targetValue: 3,
  },
  {
    id: "a9",
    title: "Build visible upper body definition (arms, shoulders, chest)",
    description: "Targeted hypertrophy work + low enough body fat to see it.",
  },
  {
    id: "a10",
    title: "Lose enough weight to eliminate joint pain",
    description: "Every 10 lbs lost removes 30–40 lbs of pressure from your knees.",
    unit: "lbs",
  },
];

// ── Flexibility & Mobility ────────────────────────────────────────────────────
const mobilityGoals: GoalSuggestion[] = [
  {
    id: "m1",
    title: "Touch my toes with straight legs",
    description: "A baseline flexibility marker — hamstring and lower back health.",
  },
  {
    id: "m2",
    title: "Hold a deep squat (ass to grass) for 2 minutes",
    description: "Ankle, hip, and thoracic mobility combined in one position.",
    unit: "min",
    targetValue: 2,
  },
  {
    id: "m3",
    title: "Achieve a pain-free overhead squat with bodyweight",
    description: "The most demanding mobility test in strength training.",
  },
  {
    id: "m4",
    title: "Complete a daily 10-minute mobility routine for 90 days",
    description: "Consistency beats intensity — 10 minutes every day changes everything.",
    unit: "days",
    targetValue: 90,
  },
  {
    id: "m5",
    title: "Eliminate lower back pain through hip flexor mobility",
    description: "90% of lower back pain traces to tight hips — fix the source.",
  },
  {
    id: "m6",
    title: "Perform a full pistol squat on each leg",
    description: "Single-leg strength and ankle mobility in one demanding move.",
  },
  {
    id: "m7",
    title: "Achieve a full overhead position without shoulder impingement",
    description: "Lat and thoracic mobility work for pain-free pressing.",
  },
  {
    id: "m8",
    title: "Improve thoracic rotation for sport performance",
    description: "Essential for golf, boxing, swimming, and any rotational sport.",
  },
  {
    id: "m9",
    title: "Pass a Functional Movement Screen (FMS)",
    description: "Identify and correct movement dysfunction before it becomes injury.",
  },
  {
    id: "m10",
    title: "Hold each stretch for 2+ minutes daily for 60 days",
    description: "Tissue-level change requires time under tension — this is it.",
    unit: "days",
    targetValue: 60,
  },
];

// ── NEW SPORTS (appended to sportSubcategories array) ────────────────────────
const newSports: SportSubcategory[] = [
  {
    id: "football",
    label: "Football",
    emoji: "🏈",
    goals: [
      { id: "fb1", title: "Run a 4.6-second 40-yard dash", description: "The universal speed benchmark for football players at every level.", unit: "sec", targetValue: 4.6 },
      { id: "fb2", title: "Run a sub-5.0 second 40-yard dash", description: "Break the five-second barrier — the threshold for competitive play.", unit: "sec", targetValue: 5.0 },
      { id: "fb3", title: "Bench press 225 lbs for reps (NFL Combine standard)", description: "Test upper body strength endurance — the gold-standard football lift.", unit: "reps" },
      { id: "fb4", title: "Squat 2× bodyweight", description: "Develop explosive leg drive for blocking, tackling, and acceleration.", unit: "lbs" },
      { id: "fb5", title: "Improve vertical jump to 30+ inches", description: "Explosiveness off the line and in the air — critical for skill positions.", unit: "inches", targetValue: 30 },
      { id: "fb6", title: "Complete 30 unbroken broad jumps (explosiveness circuit)", description: "Develop lower body power with repeated broad jump conditioning drills." },
      { id: "fb7", title: "Complete 100 burpees as a conditioning benchmark", description: "Football-specific conditioning — full-body, no excuses.", unit: "reps", targetValue: 100 },
      { id: "fb8", title: "Complete agility ladder and cone drill 3× per week", description: "Build the foot speed and change-of-direction needed for game situations." },
      { id: "fb9", title: "Drop body weight to improve speed-to-strength ratio", description: "Leaner means faster — find your optimal playing weight.", unit: "lbs" },
      { id: "fb10", title: "Play in a competitive flag or tackle league", description: "Apply your training on the field — this is what you train for." },
    ],
  },
  {
    id: "soccer",
    label: "Soccer",
    emoji: "⚽",
    goals: [
      { id: "soc1", title: "Run 5 miles continuously at game pace", description: "Soccer demands 5–7 miles per match — build the aerobic engine to last 90 minutes.", unit: "miles", targetValue: 5 },
      { id: "soc2", title: "Improve sprint speed over 30 meters", description: "Explosive acceleration beats defenders — train the fast-twitch fibers.", unit: "sec" },
      { id: "soc3", title: "Complete 200 air squats in one session", description: "Build the leg endurance needed to win 50/50 balls and hold position all game.", unit: "reps", targetValue: 200 },
      { id: "soc4", title: "Improve lateral quickness — 5-10-5 shuttle under 4.8 seconds", description: "Side-to-side agility is the difference-maker in tight defensive situations.", unit: "sec", targetValue: 4.8 },
      { id: "soc5", title: "Complete a full 90-minute recreational match without subbing off", description: "The baseline conditioning goal for any soccer player returning to the game." },
      { id: "soc6", title: "Build single-leg squat strength for knee stability", description: "Soccer-specific injury prevention — strong knees stay on the pitch." },
      { id: "soc7", title: "Improve vertical jump for aerial duels", description: "Win headers — build leg power and timing to out-jump opponents.", unit: "inches" },
      { id: "soc8", title: "Score a goal in a competitive match", description: "The ultimate on-field milestone — put in the work, put it in the net." },
      { id: "soc9", title: "Complete 3 weeks of pre-season conditioning without missing a session", description: "The habit is the foundation — show up every day." },
    ],
  },
  {
    id: "wrestling",
    label: "Wrestling",
    emoji: "🤼",
    goals: [
      { id: "wres1", title: "Complete 500 air squats in one session", description: "The legs win matches — build the squat endurance to go all three periods strong.", unit: "reps", targetValue: 500 },
      { id: "wres2", title: "Complete 100 burpees in under 8 minutes", description: "Wrestling-specific conditioning — explosive, full-body, relentless.", unit: "min", targetValue: 8 },
      { id: "wres3", title: "Hold a 6-minute round without stopping movement", description: "Match-length conditioning. If you can't go six minutes in the gym, you can't go six minutes on the mat." },
      { id: "wres4", title: "Win a match by pin", description: "The ultimate outcome — dominate position, finish the fight." },
      { id: "wres5", title: "Win 5 consecutive matches in competition", description: "Competitive consistency is built in practice and proven on the mat." },
      { id: "wres6", title: "Complete 50 sprawls per day for 30 days", description: "Burn the defensive reaction into muscle memory — the sprawl wins matches.", unit: "days", targetValue: 30 },
      { id: "wres7", title: "Improve grip strength — hold a dead hang for 90 seconds", description: "Grip is a weapon in wrestling. The athlete who controls the wrists controls the match.", unit: "sec", targetValue: 90 },
      { id: "wres8", title: "Make weight class without sacrificing strength", description: "Disciplined nutrition + training to compete at the right weight — no crash cuts." },
      { id: "wres9", title: "Complete a 2-mile run in under 14 minutes for conditioning base", description: "Aerobic base underpins explosive wrestling output — build the engine.", unit: "min", targetValue: 14 },
      { id: "wres10", title: "Complete 200 sit-ups in one session for core dominance", description: "Core strength determines who breaks position first — make yours unbreakable.", unit: "reps", targetValue: 200 },
    ],
  },
  {
    id: "rugby",
    label: "Rugby",
    emoji: "🏉",
    goals: [
      { id: "rug1", title: "Complete a full 80-minute match without cramping or subbing", description: "Rugby fitness demands more than most sports — train for the full game.", unit: "min" },
      { id: "rug2", title: "Squat 1.5× bodyweight for scrum power", description: "The scrum is won in the legs — every pound on the bar is yards on the field.", unit: "lbs" },
      { id: "rug3", title: "Bench press 1.25× bodyweight for contact strength", description: "Upper body power translates to better contact, stronger carries, harder tackles.", unit: "lbs" },
      { id: "rug4", title: "Run a sub-14 minute 2-mile for aerobic base", description: "Rugby is 80 minutes of repeated sprints — the aerobic base has to be there.", unit: "min", targetValue: 14 },
      { id: "rug5", title: "Complete 100 meters of bear crawls in conditioning", description: "Rugby-specific conditioning that builds the posterior chain and mental grit." },
      { id: "rug6", title: "Improve tackle technique — complete a tackling skills clinic", description: "Safe, effective tackling is a skill — get the coaching to do it right." },
      { id: "rug7", title: "Complete a full pre-season conditioning block without missing a session", description: "Consistency in the off-season builds the player who shows up on game day." },
      { id: "rug8", title: "Improve sprint speed — 40 yards in under 5.2 seconds", description: "Speed wins space in rugby — sharper acceleration beats the defense.", unit: "sec", targetValue: 5.2 },
      { id: "rug9", title: "Score a try in a competitive match", description: "Cross the line. All the training exists for this moment." },
      { id: "rug10", title: "Drop body weight to improve speed without losing strength", description: "Lean and strong is the rugby ideal — find your optimal playing weight.", unit: "lbs" },
    ],
  },
  {
    id: "crossfit",
    label: "CrossFit",
    emoji: "🔥",
    goals: [
      { id: "cf1", title: "Complete \"Fran\" (21-15-9 thrusters & pull-ups) in under 5 minutes", description: "The benchmark WOD. Sub-5 is the standard for competitive CrossFitters.", unit: "min", targetValue: 5 },
      { id: "cf2", title: "Complete \"Murph\" under 45 minutes (unpartitioned)", description: "Hero WOD. 1 mile, 100 pull-ups, 200 push-ups, 300 squats, 1 mile — wearing a vest.", unit: "min", targetValue: 45 },
      { id: "cf3", title: "Complete \"Grace\" (30 clean-and-jerks at 135 lbs) in under 3 minutes", description: "The barbell cycling benchmark — raw strength meets raw conditioning.", unit: "min", targetValue: 3 },
      { id: "cf4", title: "Get your first muscle-up", description: "The movement that separates competitors — rings or bar." },
      { id: "cf5", title: "Get your first double-under (and string 50 in a row)", description: "The jump rope skill that unlocks faster WOD times and cleaner movement.", unit: "reps", targetValue: 50 },
      { id: "cf6", title: "Complete an Olympic lifting cycle — clean & jerk 1.25× bodyweight", description: "Power output, timing, and technique — the backbone of CrossFit performance.", unit: "lbs" },
      { id: "cf7", title: "Complete a CrossFit Open season (all 5 workouts)", description: "Put your fitness on the scoreboard — the Open is where you find your level." },
      { id: "cf8", title: "Reach the top 50% in your local box for the Open", description: "A competitive benchmark against athletes who train exactly like you do." },
      { id: "cf9", title: "String 10 unbroken toes-to-bar", description: "Core and kip mechanics — a key CrossFit gymnastics skill.", unit: "reps", targetValue: 10 },
      { id: "cf10", title: "Complete every class for 60 consecutive days", description: "The foundation of CrossFit performance is relentless attendance.", unit: "days", targetValue: 60 },
    ],
  },
  {
    id: "hyrox",
    label: "Hyrox",
    emoji: "⚡",
    goals: [
      { id: "hyr1", title: "Finish a Hyrox race (any division)", description: "8 km of running + 8 functional fitness stations. Cross the finish line.", unit: "min" },
      { id: "hyr2", title: "Finish Hyrox Open in under 90 minutes", description: "A competitive target for the Open division — requires solid running and station efficiency.", unit: "min", targetValue: 90 },
      { id: "hyr3", title: "Finish Hyrox Open in under 75 minutes", description: "Top-tier Open performance — requires sub-5:00/km running and powerful stations.", unit: "min", targetValue: 75 },
      { id: "hyr4", title: "Complete 1,000 m SkiErg without stopping", description: "One of the most demanding Hyrox stations — build the pulling endurance.", unit: "m", targetValue: 1000 },
      { id: "hyr5", title: "Sled push 50m at race weight without stopping", description: "Train the specific strength and pain tolerance for the sled — it breaks most athletes." },
      { id: "hyr6", title: "Complete 100 wall balls (9 kg) in under 6 minutes", description: "Wall balls reward consistency — build a sustainable rep cadence.", unit: "min", targetValue: 6 },
      { id: "hyr7", title: "Run 5 km in under 25 minutes", description: "Hyrox is half a running race — your pace between stations determines your finish time.", unit: "min", targetValue: 25 },
      { id: "hyr8", title: "Complete a full Hyrox simulation workout in training", description: "Run the 8 km + all 8 stations in sequence at race pace. Know what you're walking into." },
      { id: "hyr9", title: "Improve farmers carry grip endurance — 200m at race weight", description: "Most Hyrox DNFs trace to grip failure on the carry — build this specifically.", unit: "m", targetValue: 200 },
      { id: "hyr10", title: "Compete in Hyrox Doubles with a partner", description: "Train with someone else and race together — the shared suffering is the point." },
    ],
  },
  {
    id: "baseball",
    label: "Baseball / Softball",
    emoji: "⚾",
    goals: [
      { id: "bsb1", title: "Increase exit velocity by 5 mph through rotational strength training", description: "Hip rotation and core power are the engines of bat speed — build them.", unit: "mph", targetValue: 5 },
      { id: "bsb2", title: "Run 60-yard dash in under 7.0 seconds", description: "The baseball speed standard — scouts and coaches watch this closely.", unit: "sec", targetValue: 7.0 },
      { id: "bsb3", title: "Complete 50 medicine ball rotational throws per day for 30 days", description: "Sport-specific power training — the hip turn that drives every pitch and swing.", unit: "days", targetValue: 30 },
      { id: "bsb4", title: "Add 5 mph to pitching/throwing velocity through shoulder strength program", description: "Stronger rotator cuff and scapular stability = more velocity, less injury.", unit: "mph", targetValue: 5 },
      { id: "bsb5", title: "Drop 15 lbs to improve first-step quickness", description: "Speed on the bases and in the field starts with body composition.", unit: "lbs", targetValue: 15 },
      { id: "bsb6", title: "Bench press 1× bodyweight for upper body foundation", description: "Upper body strength underpins throwing power and plate presence.", unit: "lbs" },
      { id: "bsb7", title: "Complete a season without a throwing arm injury", description: "Durability is the goal — build the shoulder and elbow to handle the workload." },
      { id: "bsb8", title: "Improve lateral agility for infield range", description: "First step and lateral speed determine how many outs you make in the field." },
      { id: "bsb9", title: "Hit .300 or better in a recreational league", description: "Put the training to work — see it in the stats." },
      { id: "bsb10", title: "Complete 200 air squats daily for leg drive and base running speed", description: "Lower body endurance and explosiveness — built squat by squat.", unit: "reps", targetValue: 200 },
    ],
  },
  {
    id: "volleyball",
    label: "Volleyball",
    emoji: "🏐",
    goals: [
      { id: "vb1", title: "Increase vertical jump to 24+ inches for hitting approach", description: "Every inch of vertical is more arm swing, more angle, more kills.", unit: "inches", targetValue: 24 },
      { id: "vb2", title: "Complete 100 box jumps per session 3× per week for 6 weeks", description: "Train the explosive hip extension that adds inches to your vertical.", unit: "weeks", targetValue: 6 },
      { id: "vb3", title: "Improve lateral shuffle speed for defensive coverage", description: "Defensive positioning wins rallies — build the hip strength to cover the court." },
      { id: "vb4", title: "Complete 200 air squats in one session for leg endurance", description: "Volleyball demands repeated explosive movement — build the legs to handle every set.", unit: "reps", targetValue: 200 },
      { id: "vb5", title: "Build shoulder stability for 50+ spike reps without fatigue", description: "Rotator cuff and scapular strength keep your shoulder healthy through a full season.", unit: "reps", targetValue: 50 },
      { id: "vb6", title: "Improve approach mechanics and attack from all three positions", description: "Left, right, and middle — versatility makes you the hardest hitter to defend." },
      { id: "vb7", title: "Complete a sand volleyball tournament (beach)", description: "Sand training builds leg strength and conditioning no gym can replicate." },
      { id: "vb8", title: "Serve ace percentage — aim for 15% in competition", description: "A measurable on-court goal that reflects both skill and pressure tolerance.", unit: "%" },
      { id: "vb9", title: "Drop body weight to improve jump height and court speed", description: "Every pound lost is inches gained — find your optimal playing weight.", unit: "lbs" },
      { id: "vb10", title: "Complete full-court sprint intervals (10 × 30m) without rest for conditioning", description: "Volleyball conditioning is explosive and repeated — train it exactly.", unit: "reps", targetValue: 10 },
    ],
  },
];

// ── Military Fitness Tests ────────────────────────────────────────────────────
const militarySubcategories: SportSubcategory[] = [
  {
    id: "army-acft",
    label: "Army — ACFT",
    emoji: "🪖",
    goals: [
      { id: "acft1", title: "Score 60+ points on the ACFT (passing)", description: "The Army Combat Fitness Test minimum — qualify across all 6 events.", targetValue: 60, unit: "pts" },
      { id: "acft2", title: "Score 80+ on every ACFT event", description: "Above the minimum on all 6 events — a sign of real across-the-board fitness.", targetValue: 80, unit: "pts" },
      { id: "acft3", title: "Deadlift 340 lbs (ACFT max score — MDL)", description: "Max the 3-rep deadlift event. Requires serious posterior chain strength.", unit: "lbs", targetValue: 340 },
      { id: "acft4", title: "Complete 10 power throws of 10 lbs ball (SPT — max 12.5m)", description: "Standing power throw — explosive total-body output. Train medicine ball throws daily." },
      { id: "acft5", title: "Complete 60 hand-release push-ups in 2 minutes (HRP max)", description: "The ACFT push-up standard — full chest to deck, full lockout, no half reps.", unit: "reps", targetValue: 60 },
      { id: "acft6", title: "Complete 60-meter sprint-drag-carry under 1:33 (SDC max)", description: "The most physically demanding ACFT event — sprint, sled, lateral, farmer carry, sprint." },
      { id: "acft7", title: "Hold a 3-minute plank (LTK alternate — for those who can't hang)", description: "Core strength under time — hold the standard position for a full 3 minutes.", unit: "min", targetValue: 3 },
      { id: "acft8", title: "Run 2 miles in under 13:30 (2MR max — male/female overlap)", description: "The ACFT run — 2 miles, all out. Sub-14 is competitive. Sub-13:30 is excellent.", unit: "min", targetValue: 13 },
    ],
  },
  {
    id: "marines-pft",
    label: "Marines — PFT / CFT",
    emoji: "🦅",
    goals: [
      { id: "usmc1", title: "Score 300 on the USMC PFT (perfect score)", description: "20 pull-ups, 100 crunches in 2 min, 3-mile run in 18:00. The Marine standard.", targetValue: 300, unit: "pts" },
      { id: "usmc2", title: "Complete 20 dead-hang pull-ups (PFT max)", description: "No kipping, no swinging — dead hang to chin over bar. The Marine pull-up is the real one.", unit: "reps", targetValue: 20 },
      { id: "usmc3", title: "Complete 100 crunches in 2 minutes (PFT max)", description: "Locked hands behind head, full sit-up to 90°, controlled return. Build core endurance.", unit: "reps", targetValue: 100 },
      { id: "usmc4", title: "Run 3 miles in under 18 minutes (PFT max)", description: "Six-minute miles, three times. The benchmark of Marine cardiovascular fitness.", unit: "min", targetValue: 18 },
      { id: "usmc5", title: "Score 300 on the USMC CFT (Combat Fitness Test)", description: "Movement to contact, ammo can lift, maneuver under fire — functional combat fitness.", targetValue: 300, unit: "pts" },
      { id: "usmc6", title: "Complete 70 ammo can lifts in 2 minutes (CFT max — 30 lb can)", description: "Press a 30 lb ammo can from chest to full overhead extension. Shoulder stamina benchmark.", unit: "reps", targetValue: 70 },
      { id: "usmc7", title: "Complete movement to contact run (880m) in under 2:42", description: "Sprint 880m with combat load — the opening event of the CFT.", unit: "min" },
    ],
  },
  {
    id: "navy-pfa",
    label: "Navy — PFA",
    emoji: "⚓",
    goals: [
      { id: "navy1", title: "Score \"Outstanding\" on the Navy PFA (top tier)", description: "The highest PFA category — max-effort push-ups, sit-ups, and 1.5-mile run." },
      { id: "navy2", title: "Complete 100 push-ups in 2 minutes (Navy PFA)", description: "Chest to deck, full lockout — build the push-up endurance for max performance.", unit: "reps", targetValue: 100 },
      { id: "navy3", title: "Complete 100 sit-ups in 2 minutes (Navy PFA)", description: "Locked hands, full sit-up every rep — build the core stamina to max the sit-up event.", unit: "reps", targetValue: 100 },
      { id: "navy4", title: "Run 1.5 miles in under 9:00 (Navy PFA — outstanding)", description: "Six-minute miles — the top Navy run standard. Requires a serious aerobic base.", unit: "min", targetValue: 9 },
      { id: "navy5", title: "Pass the Navy swim qualification (swim 500 yards)", description: "Basic swim qualification required for all Navy personnel — survival competency.", unit: "yards", targetValue: 500 },
      { id: "navy6", title: "Complete the Navy SEAL PST minimums (entry standard)", description: "500-yard swim in 12:30, 42 push-ups, 50 sit-ups, 6 pull-ups, 1.5-mile run in 11:00." },
      { id: "navy7", title: "Pass Navy SEAL PST competitive scores", description: "500-yard swim in 8:00, 100 push-ups, 100 sit-ups, 20 pull-ups, 1.5-mile in 9:00." },
    ],
  },
  {
    id: "airforce-pt",
    label: "Air Force — AFFPRT",
    emoji: "✈️",
    goals: [
      { id: "af1", title: "Score \"Excellent\" on the AFFPRT (90+ points)", description: "Air Force Fitness Test top tier — aerobic run, push-ups, and sit-ups.", targetValue: 90, unit: "pts" },
      { id: "af2", title: "Complete 67 push-ups in 1 minute (AFFPRT Excellent — male)", description: "The max push-up standard on the Air Force fitness test — build rep speed and endurance.", unit: "reps", targetValue: 67 },
      { id: "af3", title: "Complete 58 sit-ups in 1 minute (AFFPRT Excellent — male)", description: "Full sit-ups, controlled and consistent — build the core endurance for max score.", unit: "reps", targetValue: 58 },
      { id: "af4", title: "Run 1.5 miles in under 9:12 (AFFPRT Excellent — male)", description: "Aerobic component of the AFFPRT — the run is weighted most heavily in scoring.", unit: "min", targetValue: 9 },
      { id: "af5", title: "Waist measurement under 32 inches (AFFPRT component — male)", description: "The Air Force PT test includes a waist measurement — body composition matters.", unit: "inches", targetValue: 32 },
      { id: "af6", title: "Score 100% on all AFFPRT components", description: "Perfect score across push-ups, sit-ups, run, and waist measurement. Set the standard." },
    ],
  },
  {
    id: "coastguard-pt",
    label: "Coast Guard — OPF",
    emoji: "🛟",
    goals: [
      { id: "cg1", title: "Pass the Coast Guard Operational Physical Fitness test", description: "Push-ups, sit-ups, 1.5-mile run — meet the standard for all active duty CG personnel." },
      { id: "cg2", title: "Complete 29 push-ups in 1 minute (CG OPF passing — male)", description: "Minimum push-up standard for male Coast Guard personnel.", unit: "reps", targetValue: 29 },
      { id: "cg3", title: "Complete 38 sit-ups in 1 minute (CG OPF passing — male)", description: "Minimum sit-up standard — build to the floor and then aim for excellent.", unit: "reps", targetValue: 38 },
      { id: "cg4", title: "Run 1.5 miles in under 12:51 (CG OPF passing — male)", description: "Coast Guard run standard — build aerobic base with 3× weekly runs.", unit: "min", targetValue: 12 },
      { id: "cg5", title: "Pass the CG Rescue Swimmer PST (AIRSTA program)", description: "500m swim, 25m underwater, 10 push-ups, 10 sit-ups, 4 pull-ups — elite Coast Guard fitness." },
      { id: "cg6", title: "Complete 100 push-ups as a conditioning benchmark above standards", description: "Train well above the minimum so the test is never a question.", unit: "reps", targetValue: 100 },
    ],
  },
  {
    id: "national-guard",
    label: "National Guard / Reserves",
    emoji: "🏛️",
    goals: [
      { id: "ng1", title: "Pass the ACFT before your next drill weekend", description: "Reserve component warriors are held to the same standard — be ready every time.", targetValue: 60, unit: "pts" },
      { id: "ng2", title: "Maintain ACFT passing scores between deployments", description: "Fitness doesn't take a break between orders — neither should you." },
      { id: "ng3", title: "Score 80+ on all ACFT events as a reservist", description: "Above-average fitness as a part-time warrior — it takes more discipline, not less." },
      { id: "ng4", title: "Complete a physical prep program before annual training (AT)", description: "Show up to AT in the best shape of your life — not the worst." },
      { id: "ng5", title: "Run 2 miles in under 16 minutes between drill weekends", description: "Keep the aerobic base alive between obligations — 3 runs per week minimum.", unit: "min", targetValue: 16 },
      { id: "ng6", title: "Maintain bodyweight standards year-round", description: "Body composition is a readiness issue — track and manage it consistently." },
    ],
  },
];


export const GOAL_CATEGORIES: CategoryDefinition[] = [
  {
    id: "strength",
    label: "Strength & Conditioning",
    emoji: "💪",
    color: "red",
    description: "Lift more, move faster, outlast the competition.",
    goals: strengthGoals,
  },
  {
    id: "sports",
    label: "Sports",
    emoji: "🏅",
    color: "blue",
    description: "Sport-specific goals tied to the events and games you love.",
    sports: [...sportSubcategories, ...newSports],
  },
  {
    id: "nutrition",
    label: "Nutrition",
    emoji: "🥩",
    color: "orange",
    description: "Fuel performance, accelerate recovery, and own what you eat.",
    goals: nutritionGoals,
  },
  {
    id: "aesthetics",
    label: "Aesthetics",
    emoji: "⚖️",
    color: "purple",
    description: "Look like you work hard — because you do.",
    goals: aestheticsGoals,
  },
  {
    id: "mobility",
    label: "Flexibility & Mobility",
    emoji: "🧘",
    color: "emerald",
    description: "Move without pain, perform without limits.",
    goals: mobilityGoals,
  },
  {
    id: "military",
    label: "Military Fitness",
    emoji: "🎖️",
    color: "amber",
    description: "Branch-specific fitness tests — pass, max, and dominate.",
    sports: militarySubcategories,
  },
];

export const TARGET_GOAL_COUNT = 5;

// Color maps for Tailwind (must be complete strings, not dynamic)
export const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  red:     { border: "border-red-700",     bg: "bg-red-900/20",     text: "text-red-400",     badge: "bg-red-900 text-red-300" },
  blue:    { border: "border-blue-700",    bg: "bg-blue-900/20",    text: "text-blue-400",    badge: "bg-blue-900 text-blue-300" },
  orange:  { border: "border-orange-700",  bg: "bg-orange-900/20",  text: "text-orange-400",  badge: "bg-orange-900 text-orange-300" },
  purple:  { border: "border-purple-700",  bg: "bg-purple-900/20",  text: "text-purple-400",  badge: "bg-purple-900 text-purple-300" },
  emerald: { border: "border-emerald-700", bg: "bg-emerald-900/20", text: "text-emerald-400", badge: "bg-emerald-900 text-emerald-300" },
  amber:   { border: "border-amber-700",   bg: "bg-amber-900/20",   text: "text-amber-400",   badge: "bg-amber-900 text-amber-300" },
};
