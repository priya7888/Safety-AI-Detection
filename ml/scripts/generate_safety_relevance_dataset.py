"""
Script to generate the safety relevance training dataset.
Classes:
- SAFETY_RELATED: Industrial workplace safety observations, hazards, near misses, unsafe acts, unsafe conditions.
- UNRELATED: General chitchat, compliments, greetings, sports, technology/programming questions, trivia, humor, nonsense.
"""

import random
import pandas as pd
from pathlib import Path

random.seed(42)

# Specific required examples
REQUIRED_UNRELATED = [
    "you are very beautiful",
    "hello",
    "good morning",
    "how are you",
    "I love cricket",
    "I like cricket",
    "what is Python",
    "tell me a joke",
    "good evening",
    "good afternoon",
    "hey there",
    "who are you",
    "what is your name",
    "can you help me with homework",
    "what is the capital of France",
    "tell me something funny",
    "you are so smart",
    "I like football",
    "who is the best cricket player",
    "explain quantum physics",
    "how to bake a cake",
    "write a poem for me",
    "do you have feelings",
    "nice to meet you",
    "what is the time now",
    "weather is nice today",
    "I am feeling bored",
    "let us play a game",
    "what is JavaScript",
    "how to write a Python function",
    "why is the sky blue",
    "can you dance",
    "I want to sleep",
    "my favorite food is pizza",
    "recommend a movie to watch",
    "what is artificial intelligence",
    "who won the world cup",
    "I love playing video games",
    "have a nice day",
    "see you later"
]

REQUIRED_SAFETY = [
    "Worker entered a confined space without proper gas testing.",
    "Oil was leaking from the process pipeline near the pump.",
    "Worker was not wearing required fall protection while working at height.",
    "Electrical panel was opened without proper isolation.",
    "A worker nearly fell while climbing an unsafe ladder.",
    "Workers entered a vessel while toxic gas was present and the isolation was incomplete.",
    "A minor housekeeping issue was observed near the work area and was corrected immediately.",
    "A worker was exposed to an unguarded high-energy source during maintenance.",
    "Scaffold plank unsecured at elevation near high voltage feeder.",
    "High pressure steam valve packing leaking severely near main walkway without barricade.",
    "Forklift reversed rapidly through crowded pedestrian doorway with broken horn.",
    "Damaged 440V power cable submerged in rainwater puddle near personnel walkway.",
    "Heavy steel pipe clamp fell from rig floor Derrick to walkway with no barricade.",
    "Pressurized hydraulic line ruptured under 200 bar, spraying fluid near operator.",
    "Technician entered 11kV electrical switchgear room without conducting LOTO energy isolation.",
    "Nitrogen purge valve passing residual gas into worker area without warning sign.",
    "Overhead crane wire rope showed broken strands during pre-lift inspection.",
    "Personnel working inside distillation column without certified standby observer.",
    "Flammable solvent stored adjacent to hot work welding operation without fire blanket."
]

# Vocabulary components for generating diverse UNRELATED samples
greetings = [
    "hello there", "hi friend", "good morning everyone", "good night", "hey assistant",
    "greetings", "whats up", "howdy", "good day", "hope you are doing well",
    "happy new year", "happy birthday", "congratulations", "welcome back", "thank you so much"
]

compliments_and_chat = [
    "you are very beautiful", "you are very pretty", "you are gorgeous", "you look stunning today",
    "you are amazing", "you are so helpful and kind", "I like your personality", "you are the best",
    "you are awesome", "you are intelligent and nice", "can we be friends", "I like talking to you",
    "you are wonderful", "you are so sweet", "I enjoy chatting with you", "you are really cool"
]

sports_and_hobbies = [
    "I love cricket and watch every match", "who is the best batsman in the world",
    "football match was exciting last night", "tennis tournament was great",
    "do you like basketball", "I enjoy playing badminton on weekends",
    "formula 1 race had a dramatic finish", "cricket world cup final was intense",
    "swimming is good for health", "I go for running every morning",
    "hiking in the mountains is fun", "learning guitar in my free time",
    "chess is a game of deep strategy", "I love watching olympic games",
    "IPL match yesterday was thrilling", "who will win the premier league"
]

tech_and_programming = [
    "what is Python programming language", "explain object oriented programming in Java",
    "how does a neural network work", "what is the difference between SQL and NoSQL",
    "how to build a website with HTML and CSS", "explain React component lifecycle",
    "what is Docker containerization", "how to sort an array in C++",
    "what is git rebase and merge", "explain REST API architecture",
    "how to install packages using pip", "what is cloud computing in AWS",
    "how to write a binary search algorithm", "explain recursion in computer science",
    "what is typescript used for", "how does an operating system manage memory"
]

general_knowledge = [
    "what is the capital of France", "how far is the sun from earth",
    "who wrote the play Romeo and Juliet", "what is photosynthesis in plants",
    "explain the theory of relativity", "what is the currency of Japan",
    "how many continents are there on earth", "what is the speed of light",
    "who was the first person on the moon", "what causes ocean tides",
    "which is the longest river in the world", "how do airplanes generate lift",
    "what is the boiling point of water", "why do leaves change color in autumn",
    "how does the human heart pump blood", "what is the deepest ocean trench"
]

daily_life_and_social = [
    "what should I cook for dinner tonight", "recommend a good coffee recipe",
    "I am going to shopping mall today", "traffic was terrible on my commute",
    "planning a vacation for next month", "my dog learned a new trick today",
    "watching a documentary on television", "reading a fascinating fantasy novel",
    "grocery shopping list for the week", "ordering delicious pizza for lunch",
    "getting ready for a weekend party", "listening to classical music while relaxing",
    "cleaning my bedroom and organizing books", "trying out a new restaurant in town",
    "celebrating birthday with close friends", "taking a warm cup of green tea"
]

humor_and_chitchat = [
    "tell me a funny joke about cats", "make me laugh with a witty pun",
    "tell me a riddle that is hard to solve", "can you tell funny bedtime stories",
    "what is the meaning of life", "are you smarter than humans",
    "do androids dream of electric sheep", "tell me a lighthearted tongue twister",
    "sing me a cheerful song", "say something inspiring today"
]

nonsense_and_noise = [
    "asdfghjkl qwerty zxcvbnm", "12345 67890 testing one two three",
    "bla bla bla nothing important", "random meaningless words here",
    "just testing the keyboard input", "hello hello hello hello",
    "lorem ipsum dolor sit amet", "abcd efgh ijkl mnop",
    "test test 1 2 3 test", "zzzzzzzz sleeping now"
]

# Vocabulary components for generating diverse SAFETY_RELATED samples
actors = [
    "Worker", "Maintenance technician", "Contractor", "Operator", "Rigger",
    "Electrician", "Scaffolder", "Welder", "Field inspection team", "Crew member",
    "Process operator", "Crane operator", "Instrument technician", "Pipefitter", "Pump operator"
]

actions_unsafe = [
    "entered a confined space", "climbed scaffolding", "performed electrical maintenance",
    "worked at 8-meter height", "operated overhead bridge crane", "opened pressurized separator manifold",
    "conducted hot-work welding", "bypassed safety emergency stop", "handled corrosive acid drums",
    "approached high-voltage transformer", "attempted flange bolt tightening", "transferred hydrocarbon fuel",
    "entered deep excavation trench", "performed line break on toxic pipeline", "worked near unguarded rotating shaft",
    "cleared jam inside operating conveyor", "operated mobile forklift", "performed grinding without face shield"
]

hazard_conditions = [
    "without proper gas testing and ventilation", "without wearing required safety harness lanyard",
    "while electrical circuit remained energized without LOTO", "with frayed wire rope and missing latch",
    "while residual pressure was still trapped at 30 bar", "adjacent to flammable vapor cloud",
    "with toxic H2S gas alarm sounding in pit", "without physical barricades around drop zone",
    "without permit to work authorization", "with damaged insulation on 440V power cable",
    "while structural support showed severe corrosion", "in close proximity to moving heavy vehicle",
    "with missing guardrail and unprotected floor opening", "without required breathing apparatus",
    "while hydraulic fluid was spraying under high pressure", "with safety interlock switch physically defeated"
]

locations = [
    "in distillation column area", "at rig floor derrick", "inside compressor room",
    "near crude oil storage tank", "at substation switchgear bay", "along elevated pipe rack",
    "at boiler house unit 2", "in chemical dosing pit", "at loading gantry bay",
    "inside valve manifold vault", "at offshore platform wellhead", "in fabrication workshop"
]

consequences = [
    "creating severe fall from height exposure", "posing acute electrocution and arc flash risk",
    "leading to potential toxic gas asphyxiation", "creating catastrophic vapor cloud explosion hazard",
    "presenting high-consequence struck-by dropped object threat", "resulting in high-pressure fluid injection hazard",
    "posing mechanical crush and entanglement risk", "creating unmitigated flash fire exposure",
    "leading to potential personnel entrapment", "creating high-energy barrier failure scenario"
]

housekeeping_and_routine_safety = [
    "Small oil spill on walkway cleaned up immediately with absorbent pads.",
    "Housekeeping observation: loose wooden pallet removed from emergency exit path.",
    "Minor trip hazard caused by extension cord across hallway corrected by rerouting.",
    "Empty chemical container rinsed and placed in designated hazardous waste storage.",
    "Eye wash station inspection showed low water pressure and was logged for repair.",
    "First aid kit in control room restocked with fresh bandages and antiseptic.",
    "Emergency exit sign light bulb was found flickering and replaced during daily round.",
    "Fire extinguisher pressure gauge checked during routine monthly safety audit.",
    "Handrail on exterior access staircase felt slightly loose and was tightened.",
    "Safety footwear inspection verified all workers wearing compliant steel-toe boots.",
    "Slip hazard: water pooling near ice machine mopped and caution sign placed.",
    "Safety sign faded by sunlight replaced with high-visibility reflective warning sign.",
    "Daily toolbox talk completed covering energy isolation and line of fire awareness.",
    "Personal protective equipment audit found safety glasses worn properly by all crew.",
    "Spill containment berm inspected and drained of clean rainwater accumulation."
]

def generate_dataset():
    records = []

    # 1. Add required and explicit UNRELATED samples
    for text in REQUIRED_UNRELATED:
        records.append({"text": text, "label": "UNRELATED"})

    # Expand UNRELATED samples to ~1,200 records
    unrelated_pools = [
        greetings, compliments_and_chat, sports_and_hobbies,
        tech_and_programming, general_knowledge, daily_life_and_social,
        humor_and_chitchat, nonsense_and_noise
    ]

    for pool in unrelated_pools:
        for item in pool:
            records.append({"text": item, "label": "UNRELATED"})

    # Synthetic combinatorial unrelated variants
    for _ in range(800):
        pool = random.choice(unrelated_pools)
        base = random.choice(pool)
        prefix = random.choice(["", "Hey, ", "Excuse me, ", "Hi, ", "Tell me, ", "By the way, ", "I want to know, "])
        suffix = random.choice(["", ".", "!", "?", " please.", " thanks.", " :)", " today."])
        combined = f"{prefix}{base}{suffix}".strip()
        records.append({"text": combined, "label": "UNRELATED"})

    # 2. Add required and explicit SAFETY_RELATED samples
    for text in REQUIRED_SAFETY:
        records.append({"text": text, "label": "SAFETY_RELATED"})

    for item in housekeeping_and_routine_safety:
        records.append({"text": item, "label": "SAFETY_RELATED"})

    # Synthetic combinatorial safety observations
    for _ in range(1100):
        actor = random.choice(actors)
        action = random.choice(actions_unsafe)
        hazard = random.choice(hazard_conditions)
        loc = random.choice(locations)
        conseq = random.choice(consequences)

        pattern = random.choice([1, 2, 3, 4])
        if pattern == 1:
            t = f"{actor} {action} {hazard} {loc}, {conseq}."
        elif pattern == 2:
            t = f"During maintenance, {actor.lower()} {action} {hazard}."
        elif pattern == 3:
            t = f"Inspection {loc} identified that {actor.lower()} {action} {hazard}."
        else:
            t = f"Unsafe condition {loc}: {action} {hazard}."
        records.append({"text": t, "label": "SAFETY_RELATED"})

    # Deduplicate and balance
    df = pd.DataFrame(records).drop_duplicates(subset=["text"]).sample(frac=1.0, random_state=42).reset_index(drop=True)

    # Balance classes to exactly 1,000 per class (2,000 total)
    unrelated_df = df[df["label"] == "UNRELATED"]
    safety_df = df[df["label"] == "SAFETY_RELATED"]

    # Ensure required texts are preserved
    for req in REQUIRED_UNRELATED:
        if req not in unrelated_df["text"].values:
            unrelated_df = pd.concat([pd.DataFrame([{"text": req, "label": "UNRELATED"}]), unrelated_df], ignore_index=True)

    for req in REQUIRED_SAFETY:
        if req not in safety_df["text"].values:
            safety_df = pd.concat([pd.DataFrame([{"text": req, "label": "SAFETY_RELATED"}]), safety_df], ignore_index=True)

    sample_size = min(len(unrelated_df), len(safety_df), 1200)
    unrelated_sample = unrelated_df.head(sample_size)
    safety_sample = safety_df.head(sample_size)

    final_df = pd.concat([unrelated_sample, safety_sample]).sample(frac=1.0, random_state=42).reset_index(drop=True)
    return final_df

if __name__ == "__main__":
    df = generate_dataset()
    out_path = Path(r"c:\Users\Rohini\OneDrive\Documents\sih26\ml\data\safety_relevance_dataset.csv")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Safety relevance dataset saved to {out_path}")
    print(f"Shape: {df.shape}")
    print("Class distribution:")
    print(df["label"].value_counts())
