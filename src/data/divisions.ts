export type DivisionId =
  | "lab-glassware"
  | "lab-consumables"
  | "ppe-products"
  | "industrial-safety"
  | "mro-items"
  | "general-supply";

export interface BilingualText {
  en: string;
  bn: string;
}

export interface Subcategory {
  id: string;
  name: BilingualText;
}

export interface Division {
  id: DivisionId;
  name: BilingualText;
  shortName: BilingualText;
  description: BilingualText;
  sourcingNote: BilingualText;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  subcategories: Subcategory[];
}

export const DIVISIONS: Division[] = [
  {
    id: "lab-glassware",
    name: {
      en: "Lab Glassware & Scientific Instruments",
      bn: "ল্যাব গ্লাসওয়্যার ও বৈজ্ঞানিক যন্ত্রপাতি",
    },
    shortName: {
      en: "Lab Glassware & Instruments",
      bn: "ল্যাব গ্লাসওয়্যার ও যন্ত্রপাতি",
    },
    description: {
      en: "Precision borosilicate reagent bottles, Class A volumetric pipettes, adjustable micropipettes, peristaltic pumps, and research laboratory instruments.",
      bn: "বোরোসিলিকেট রিএজেন্ট বোতল, ক্লাস-এ ভলিউমেট্রিক পিপেট, মাইক্রোপিপেট, পেরিস্টালটিক পাম্প এবং গবেষণামূলক ল্যাবরেটরি যন্ত্রপাতি।",
    },
    sourcingNote: {
      en: "Looking for specific Schott Duran, Pyrex, DLAB, or analytical lab models not shown here? We import & supply all major laboratory brands on institutional order.",
      bn: "এখানে নেই এমন কোনো নির্দিষ্ট Schott Duran, Pyrex বা DLAB মডেল খুঁজছেন? আমরা অর্ডারের ভিত্তিতে সকল ব্র্যান্ডের ল্যাব সরঞ্জাম সরবরাহ করি।",
    },
    iconName: "FlaskConical",
    accentColor: "#c0272d",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    subcategories: [
      {
        id: "reagent-bottles-glassware",
        name: {
          en: "Reagent Bottles & Lab Glassware",
          bn: "রিএজেন্ট বোতল ও গ্লাসওয়্যার",
        },
      },
      {
        id: "pipettes-liquid-handling",
        name: {
          en: "Micropipettes & Volumetric Pipettes",
          bn: "মাইক্রোপিপেট ও ভলিউমেট্রিক পিপেট",
        },
      },
      {
        id: "pumps-scientific-instruments",
        name: {
          en: "Pumps & Precision Instruments",
          bn: "পাম্প ও বৈজ্ঞানিক যন্ত্রপাতি",
        },
      },
    ],
  },
  {
    id: "lab-consumables",
    name: {
      en: "Lab Solutions & Consumables",
      bn: "ল্যাব সলিউশন ও কনজিউমেবলস",
    },
    shortName: {
      en: "Lab Solutions & Consumables",
      bn: "ল্যাব কনজিউমেবলস",
    },
    description: {
      en: "FDA/ISO/CE certified Petri dishes, 2mL autosampler vials with PTFE/silicone septa, heat seal sterilization reels, and precision sintered filters.",
      bn: "এফডিএ/আইএসও/সিই প্রত্যয়িত পেট্রি ডিশ, ২ এমএল অটোস্যাম্পলার ভায়াল, হিট সিল স্টেরিলাইজেশন রিল এবং স্টেইনলেস স্টিল ফিল্টার।",
    },
    sourcingNote: {
      en: "Need bulk laboratory consumables, chromatography vials, culture media, or filtration membranes? We supply pharmaceuticals & QC labs across Bangladesh.",
      bn: "ফার্মাসিউটিক্যাল ও কিউসি ল্যাবের জন্য বাল্ক কনজিউমেবলস, ভায়াল বা ফিল্টার প্রয়োজন? আমরা সারাদেশে পাইকারি সরবরাহ করি।",
    },
    iconName: "TestTubes",
    accentColor: "#1d4ed8",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    subcategories: [
      {
        id: "vials-septa",
        name: {
          en: "Autosampler Vials & Caps",
          bn: "অটোস্যাম্পলার ভায়াল ও ক্যাপ",
        },
      },
      {
        id: "petri-dishes-culture",
        name: {
          en: "Sterile Petri Dishes",
          bn: "স্টেরাইল পেট্রি ডিশ",
        },
      },
      {
        id: "sterilization-filtration",
        name: {
          en: "Sterilization Reels & Mesh Filters",
          bn: "স্টেরিলাইজেশন রিল ও মেশ ফিল্টার",
        },
      },
    ],
  },
  {
    id: "ppe-products",
    name: {
      en: "PPE Products",
      bn: "পিপিই (PPE) ও ব্যক্তিগত সুরক্ষা সামগ্রী",
    },
    shortName: {
      en: "PPE Products",
      bn: "পিপিই সামগ্রী",
    },
    description: {
      en: "Industrial steel-toe safety shoes, pharma autoclave boots, 1000V electrical & chemical gloves, EN 140 respirators, welding shields, helmets, and harnesses.",
      bn: "স্টিল-টো সেফটি সুজ, অটোক্লেভ বুট, ১০০০ ভোল্ট ইলেকট্রিক্যাল ও কেমিক্যাল গ্লাভস, রেসপিরেটর মাস্ক, ওয়েল্ডিং শিল্ড, হেলমেট ও সেফটি হারনেস।",
    },
    sourcingNote: {
      en: "We stock 3 flagship shoe & PPE lines online, plus we source 20+ additional international PPE brands (Vaultex, Safety Jogger, 3M, Karam, Honeywell) on wholesale order.",
      bn: "ওয়েবসাইটে প্রদর্শিত মডেলের বাইরেও আমরা যেকোনো দেশি-বিদেশি ব্র্যান্ডের (Safety Jogger, Vaultex, 3M, Karam) সেফটি সুজ ও পিপিই পাইকারি সরবরাহ করি।",
    },
    iconName: "HardHat",
    accentColor: "#15803d",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    subcategories: [
      {
        id: "safety-footwear",
        name: {
          en: "Safety Shoes & Autoclave Boots",
          bn: "সেফটি সুজ ও অটোক্লেভ বুট",
        },
      },
      {
        id: "hand-protection",
        name: {
          en: "Electrical (1000V) & Chemical Gloves",
          bn: "ইলেকট্রিক্যাল ও কেমিক্যাল গ্লাভস",
        },
      },
      {
        id: "respiratory-masks",
        name: {
          en: "Respirator Masks & Filters",
          bn: "রেসপিরেটর মাস্ক ও ফিল্টার",
        },
      },
      {
        id: "eye-face-hearing",
        name: {
          en: "Welding Shields, Goggles & Ear Muffs",
          bn: "ওয়েল্ডিং শিল্ড, গগলস ও ইয়ার মাফ",
        },
      },
      {
        id: "head-body-fall",
        name: {
          en: "Safety Helmets, Vests & Harnesses",
          bn: "হেলমেট, সেফটি ভেস্ট ও হারনেস",
        },
      },
    ],
  },
  {
    id: "industrial-safety",
    name: {
      en: "Industrial Safety Items",
      bn: "ইন্ডাস্ট্রিয়াল সেফটি সরঞ্জাম",
    },
    shortName: {
      en: "Industrial Safety",
      bn: "ইন্ডাস্ট্রিয়াল সেফটি",
    },
    description: {
      en: "Emergency stainless-steel shower & eyewash decontamination stations, high-voltage electrical switchboard isolation mats, and fire protection equipment.",
      bn: "জরুরি সেফটি শাওয়ার ও আইওয়াশ স্টেশন, হাই-ভোল্টেজ ইলেকট্রিক্যাল আইসোলেশন ম্যাট এবং ফায়ার ফাইটিং ও অগ্নি নিরাপত্তা সরঞ্জাম।",
    },
    sourcingNote: {
      en: "Outfitting a factory floor, substation, or chemical plant for compliance audit? Request a complete site safety equipment quotation.",
      bn: "ফ্যাক্টরি, সাবস্টেশন বা কেমিক্যাল প্ল্যান্টের কমপ্লায়েন্স অডিটের জন্য সম্পূর্ণ সেফটি সরঞ্জামের কোটেশন নিন।",
    },
    iconName: "ShieldAlert",
    accentColor: "#d97706",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    subcategories: [
      {
        id: "fire-protection",
        name: {
          en: "Fire Blankets, Extinguishers & Cabinets",
          bn: "ফায়ার ব্ল্যাঙ্কেট, এক্সটিংগুইশার ও ক্যাবিনেট",
        },
      },
      {
        id: "electrical-safety-mats",
        name: {
          en: "Electrical Switchboard Isolation Mats",
          bn: "ইলেকট্রিক্যাল আইসোলেশন ম্যাট",
        },
      },
      {
        id: "emergency-shower-eyewash",
        name: {
          en: "Emergency Shower & Eyewash Stations",
          bn: "ইমার্জেন্সি শাওয়ার ও আইওয়াশ স্টেশন",
        },
      },
    ],
  },
  {
    id: "mro-items",
    name: {
      en: "MRO Items",
      bn: "এমআরও (MRO) ও রক্ষণাবেক্ষণ সামগ্রী",
    },
    shortName: {
      en: "MRO Items",
      bn: "এমআরও সামগ্রী",
    },
    description: {
      en: "Maintenance, Repair & Operations supplies including SAFT 3.6V industrial lithium batteries, stainless digital calipers, tools, lubricants, and hardware.",
      bn: "ফ্যাক্টরি রক্ষণাবেক্ষণ ও অপারেশন সামগ্রী—SAFT ৩.৬ ভোল্ট ইন্ডাস্ট্রিয়াল লিথিয়াম ব্যাটারি, ডিজিটাল ক্যালিপার, টুলস, লুব্রিকেন্ট ও হার্ডওয়্যার।",
    },
    sourcingNote: {
      en: "Send us your factory MRO requisition list (PLC batteries, precision tools, industrial tapes, fasteners) for fast consolidated wholesale supply.",
      bn: "আপনার ফ্যাক্টরির যেকোনো এমআরও রিকুইজিশন লিস্ট পাঠান—আমরা দ্রুত পাইকারি মূল্যে সরবরাহ করব।",
    },
    iconName: "Settings",
    accentColor: "#1e3a8a",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    subcategories: [
      {
        id: "industrial-batteries",
        name: {
          en: "Industrial Lithium & PLC Batteries",
          bn: "ইন্ডাস্ট্রিয়াল লিথিয়াম ও পিএলসি ব্যাটারি",
        },
      },
      {
        id: "precision-tools-hardware",
        name: {
          en: "Digital Calipers, Tools & Maintenance",
          bn: "ডিজিটাল ক্যালিপার, টুলস ও মেইনটেন্যান্স",
        },
      },
    ],
  },
  {
    id: "general-supply",
    name: {
      en: "General Supply Solutions",
      bn: "জেনারেল সাপ্লাই ও প্রাতিষ্ঠানিক টেন্ডার সলিউশন",
    },
    shortName: {
      en: "General Supply",
      bn: "জেনারেল সাপ্লাই",
    },
    description: {
      en: "Enlisted institutional & hospital tender supplier. We source and supply hospital beds, clinical furniture, cleanroom setups, and custom corporate requisitions.",
      bn: "হাসপাতাল, ক্লিনিক ও কর্পোরেট প্রতিষ্ঠানের তালিকাভুক্ত (Enlisted) সরবরাহকারী। হাসপাতালের বেড, মেডিকেল ফার্নিচার, ক্লিনরুম ও যেকোনো প্রাতিষ্ঠানিক অর্ডার সরবরাহ।",
    },
    sourcingNote: {
      en: "Enlisted Vendor for Hospitals & Corporate Tenders: Invite M/S Eshayat Enterprise to quote on your next hospital bed, medical furniture, or general supply tender.",
      bn: "হাসপাতাল ও প্রতিষ্ঠানের টেন্ডার বা কোটেশনের জন্য আমাদের আমন্ত্রণ জানান—আমরা সর্বনিম্ন পাইকারি দরে মানসম্মত পণ্য সরবরাহের নিশ্চয়তা দিই।",
    },
    iconName: "ShoppingBag",
    accentColor: "#6d28d9",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    subcategories: [
      {
        id: "hospital-medical-supply",
        name: {
          en: "Hospital Beds & Medical Furniture",
          bn: "হাসপাতালের বেড ও মেডিকেল ফার্নিচার",
        },
      },
      {
        id: "institutional-tender-sourcing",
        name: {
          en: "Corporate Tender & Custom Indenting",
          bn: "কর্পোরেট টেন্ডার ও কাস্টম সোর্সিং",
        },
      },
    ],
  },
];

export function getDivisionById(id: string): Division | undefined {
  return DIVISIONS.find((d) => d.id === id);
}
