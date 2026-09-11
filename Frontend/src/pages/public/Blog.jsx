import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import SEO from "../../components/SEO";
import { ChevronLeft, Calendar, Clock, ArrowRight, MapPin, Check, X, Users, DollarSign, Info } from "lucide-react";

import minneriyaImg from "../../assets/minneriya.jpg";
import kaudullaImg from "../../assets/kaudulla.jpg";
import wasgamuwaImg from "../../assets/wasgamuwa.jpg";
import huruluImg from "../../assets/hurulu.jpg";

const blogSections = [
  {
    id: "minneriya",
    title: "Minneriya National Park",
    subtitle: "The Great Elephant Gathering",
    tags: ["Wildlife", "Elephants", "Dry Season"],
    readTime: "4 min read",
    date: "Aug 15, 2026",
    img: minneriyaImg,
    paragraphs: [
      "Minneriya National Park is world-renowned for the magnificent \"Elephant Gathering\" that occurs during the dry season, typically between July and October. Hundreds of wild elephants converge around the Minneriya tank to graze on the fresh grass revealed by the receding waters.",
      "Spanning over 8,800 hectares, the park offers a diverse landscape of dry tropical forest, grasslands, and wetlands. Beyond elephants, you might spot leopards, sloth bears, sambar deer, and a vast array of bird species including painted storks, pelicans, and the endemic Sri Lanka junglefowl.",
      "Whether you are a wildlife enthusiast or a casual traveler, a safari here promises breathtaking scenery and unforgettable close encounters with nature at its most spectacular.",
    ],
    tourPackages: [
      {
        name: "Morning Safari",
        price: "$90.00",
        duration: "2.5 - 3 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "5:30 AM - 7:30 AM",
        description: "A morning safari at Minneriya National Park offers a serene start to the day, with opportunities to witness wildlife awakening in their natural habitat. You're likely to spot herds of wild elephants, especially during the dry season (July–October), as they gather around the Minneriya Tank to drink and bathe. Other common sightings include sambar deer, monkeys, rabbits, jackals, toque macaques, wild buffalo, crocodiles, and a variety of bird species. Morning safari time you can see about 20% of elephants but if you're lucky you can see more. The soft morning light also makes it ideal for photography and peaceful wildlife observation.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Minneriya Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Children Policy: Free for under 5 years | Child Rate for 5–10 years | Adult Rate for 11+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94 778902811",
          "Not recommended for pregnant women or participants with serious medical conditions",
          "Tours may shift to Kaudulla or Eco Park if fewer elephants are visible (no extra fee, no refunds)"
        ],
        cancellation: "10% fee (20+ days before), scaling up to 60% fee (1+ days before)"
      },
      {
        name: "Evening Safari",
        price: "$90.00",
        duration: "2.5 - 3 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "12:00 PM - 2:30 PM",
        description: "An evening safari in Minneriya National Park offers an unforgettable wildlife experience, especially during the dry season (July – October) when hundreds of Asian elephants gather around the ancient Minneriya Tank — a spectacular natural event known as \"The Gathering.\" As the sun sets, visitors can witness herds of elephants bathing, grazing, and interacting in the open plains. Along the way, you may also spot deer, monkeys, crocodiles, bird species like eagles and storks, and occasionally sloth bears or leopards. The golden evening light creates a perfect backdrop for nature lovers and photographers alike.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Minneriya Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: July – October (Elephant Gathering is most spectacular). Peak: Aug & Sept.",
          "Children Policy: Free for under 5 years | Child Rate for 5–10 years | Adult Rate for 11+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94 778902811",
          "Not recommended for pregnant women or participants with serious medical conditions",
          "Tours may shift to Kaudulla or Eco Park if fewer elephants are visible (no extra fee, no refunds)",
          "Book With Confidence: Customer care available 24/7, No-hassle best price guarantee"
        ],
        cancellation: "10% fee (20+ days before), 20% fee (10+ days before), scaling up to 60% fee (1+ days before)"
      },
      {
        name: "Half Day Safari (Morning or Evening)",
        price: "$100.00",
        duration: "3.5 - 4 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "5:30 AM or 2:00 PM",
        description: "A half-day safari in Minneriya National Park offers an exciting opportunity to witness Sri Lanka's rich wildlife and scenic landscapes in a compact yet fulfilling experience. The highlight is the chance to see large herds of Asian elephants, especially during the dry season (July to October), when they gather around the Minneriya Tank to feed, bathe, and socialize. Along the way, you may also encounter other wildlife such as sambar deer, spotted deer, toque macaques, crocodiles, and a wide variety of birds including peacocks, eagles, and storks. The safari takes you through grasslands, forest patches, and wetland areas, providing diverse habitats and excellent photo opportunities.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Minneriya Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: July – October (Elephant Gathering is most spectacular). Peak: Aug & Sept.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94 778902811",
          "Not recommended for pregnant women or participants with serious medical conditions",
          "Tours may shift to Kaudulla or Eco Park if fewer elephants are visible (no extra fee, no refunds)"
        ],
        cancellation: "10% fee (20+ days before), 25% fee (10+ days before), scaling up to 60% fee (1+ days before)"
      }
    ]
  },
  {
    id: "kaudulla",
    title: "Kaudulla National Park",
    subtitle: "The Pristine Wildlife Corridor",
    tags: ["Bird Watching", "Jeep Safari", "Nature"],
    readTime: "3 min read",
    date: "Sep 2, 2026",
    img: kaudullaImg,
    paragraphs: [
      "Often seen as the sister park to Minneriya, Kaudulla National Park is another crucial wildlife corridor spanning approximately 6,900 hectares. It is centered around the ancient Kaudulla reservoir, built by King Mahasen.",
      "When the Minneriya tank fills up, the elephant herds naturally migrate to Kaudulla. A jeep safari here during the late afternoon offers spectacular views of large herds bathing, playing, and feeding against the stunning backdrop of the golden sunset.",
      "The park is also a haven for birdwatchers, with large flocks of cormorants, spot-billed pelicans, and grey herons. The undisturbed, pristine nature of Kaudulla makes it an essential stop for any true wildlife lover visiting Sri Lanka.",
    ],
    tourPackages: [
      {
        name: "Morning Safari",
        price: "$90.00",
        duration: "2.5 - 3 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "5:30 AM - 7:00 AM",
        description: "A morning in Kaudulla National Park offers an exciting opportunity to witness large herds of wild elephants, especially during the dry season (August to October) when they gather around the Kaudulla Tank. Alongside elephants, you may also spot sambar deer, wild boar, peacocks, toque macaques, and a variety of birds. During morning safari time you can typically see about 20% of the elephants, but if you're lucky you can see more. The landscape is a mix of grasslands, forests, and wetlands, making for scenic photography and excellent wildlife viewing.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Kaudulla Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: Dry Season (Aug – Dec). Peak gathering: Sept & Oct (200+ elephants).",
          "Children Policy: Free for under 5 years | Child Rate for 5–10 years | Adult Rate for 11+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94 778902811",
          "Not recommended for pregnant women or participants with serious medical conditions",
          "Tours may shift to Minneriya or Eco Park if fewer elephants are visible (no extra fee, no refunds)"
        ],
        cancellation: "10% fee (20+ days before), 25% fee (10+ days before), scaling up to 60% fee (1+ days before)"
      },
      {
        name: "Evening Safari",
        price: "$90.00",
        duration: "2.5 - 3 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "12:30 PM - 2:30 PM",
        description: "An evening safari in Kaudulla National Park offers an exciting opportunity to witness large herds of wild elephants, especially during the dry season (August to October) when they gather around the Kaudulla Tank. Alongside elephants, you may also spot sambar deer, wild boar, peacocks, toque macaques, and a variety of birds. During the evening safari, you have the highest chance of seeing the magnificent elephant gathering as they congregate around the water. The landscape is a mix of grasslands, forests, and wetlands, making for scenic sunset photography and excellent wildlife viewing.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Kaudulla Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: Dry Season (Aug – Dec). Peak gathering: Sept & Oct (200+ elephants).",
          "Children Policy: Free for under 5 years | Child Rate for 5–10 years | Adult Rate for 11+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94 778902811",
          "Not recommended for pregnant women or participants with serious medical conditions",
          "Tours may shift to Minneriya or Eco Park if fewer elephants are visible (no extra fee, no refunds)"
        ],
        cancellation: "10% fee (20+ days before), 25% fee (10+ days before), scaling up to 60% fee (1+ days before)"
      },
      {
        name: "Half Day Safari (Morning or Evening)",
        price: "$100.00",
        duration: "3.5 - 4 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "5:30 AM or 12:30 PM",
        description: "A half-day safari in Kaudulla National Park offers an exciting opportunity to witness large herds of wild elephants, especially during the dry season (August to October) when they gather around the Kaudulla Tank. Alongside elephants, you may also spot sambar deer, wild boar, peacocks, toque macaques, and a variety of birds. While morning safaris offer a peaceful start with about 20% of the elephants visible, evening safaris bring the spectacular full gathering. The landscape is a mix of grasslands, forests, and wetlands, making for scenic photography and excellent wildlife viewing.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Kaudulla Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: Dry Season (Aug – Dec). Peak gathering: Sept & Oct (200+ elephants).",
          "Children Policy: Free for under 5 years | Child Rate for 5–10 years | Adult Rate for 11+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94 778902811",
          "Not recommended for pregnant women or participants with serious medical conditions",
          "Tours may shift to Minneriya or Eco Park if fewer elephants are visible (no extra fee, no refunds)"
        ],
        cancellation: "10% fee (20+ days before), 25% fee (10+ days before), scaling up to 60% fee (1+ days before)"
      }
    ]
  },
  {
    id: "wasgamuwa",
    title: "Wasgamuwa National Park",
    subtitle: "The Gathering Place of Bears",
    tags: ["Off The Beaten Path", "Sloth Bears", "Adventure"],
    readTime: "5 min read",
    date: "Oct 10, 2026",
    img: wasgamuwaImg,
    paragraphs: [
      "Wasgamuwa National Park is an off-the-beaten-path destination that offers a more remote and intimate safari experience. Bordered by the Mahaweli and Amban rivers, the park's dense forests and expansive grasslands are rich in biodiversity.",
      'The name \"Wasgamuwa\" translates to \"gathering place of bears\" in ancient Sinhala, paying tribute to the elusive sloth bears that inhabit the area. The park is also home to elephants, leopards, water buffalo, and marsh crocodiles.',
      "Because it is far less crowded than other parks, Wasgamuwa allows visitors to enjoy the wilderness in relative solitude. Its rugged beauty and ancient historical ruins add a unique and unforgettable charm to the safari adventure.",
    ],
    tourPackages: [
      {
        name: "Wasgamuwa Safari (Morning or Evening)",
        price: "$100.00",
        duration: "4 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "5:00 AM (Morning) or 11:00 AM - 12:00 PM (Evening)",
        description: "On a Wasgamuwa safari, you can see a wide variety of wildlife in a peaceful and less crowded environment. The park is especially known for its large herds of wild elephants, which are often seen near rivers and open grasslands. You may also spot animals like deer, monkeys, wild boar, water buffalo, and even elusive species like sloth bears and leopards, though those are rare. Bird lovers can enjoy watching over 140 species, including several endemic to Sri Lanka. Reptiles such as crocodiles and water monitors are commonly found near water sources. Wasgamuwa offers a rich and authentic wildlife experience, especially for those who prefer quieter safaris away from the crowds.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana (pickup 60-90 mins prior)",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Park Entrance Tickets (Handungamuwa or Kirioya entrance)",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Village House Activity",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for safari driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: Dry Season (May – Sept). Peak: June-Sept. Shoulder: Nov-May.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with heart complaints or serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "hurulu",
    title: "Hurulu Eco Park",
    subtitle: "The Vital Elephant Corridor",
    tags: ["Eco Tourism", "Biosphere", "Leopards"],
    readTime: "3 min read",
    date: "Nov 5, 2026",
    img: huruluImg,
    paragraphs: [
      "Hurulu Eco Park forms a crucial link in the elephant corridor connecting Minneriya, Kaudulla, and other surrounding reserves. Covering around 10,000 hectares, it is proudly designated as a UNESCO biosphere reserve.",
      "During certain months when the water levels rise in Minneriya and Kaudulla, the elephant herds seek refuge in the dense vegetation of Hurulu Eco Park, making it a location for year-round elephant sightings in the region.",
      "The park's unique terrain offers an adventurous jeep ride through narrow trails and thick scrub. Keep your eyes peeled for raptors, wild boar, and the elusive Sri Lankan leopard that calls this park home.",
    ],
    tourPackages: [
      {
        name: "Hurulu Eco Park Safari (Morning or Evening)",
        price: "$70.00",
        duration: "3 - 3.5 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "6:30 AM (Morning) or 1:30 PM (Evening)",
        description: "At Hurulu Eco Park, visitors can enjoy close-up sightings of Asian elephants, especially during the dry season when herds migrate from nearby parks like Minneriya and Kaudulla. The park's lush dry evergreen forest also shelters spotted deer, wild boar, toque macaques, sambar deer, and a variety of bird species such as peacocks, eagles, and kingfishers. While rarer, animals like sloth bears and leopards may also be spotted. The safari offers a quieter, more intimate wildlife experience compared to the busier nearby parks.",
        departureLocations: "Habarana Area (Pickup from Sigiriya, Dambulla, Kandalama Area with additional fee)",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Hurulu Eco Park Entrance Ticket",
          "Park Service Fee ($10), Jeep & Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for safari driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: Dec - June when herds migrate here. Also good from May - Oct.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with heart complaints",
          "Tours may shift to Minneriya or Kaudulla if fewer elephants are visible (no extra fee, no refunds)"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "full-day-safari",
    title: "Full Day Safari Experience",
    subtitle: "Hurulu Eco Park & Minneriya or Kaudulla",
    tags: ["Full Day", "Multi-Park", 'Elephant Corridor'],
    readTime: "5 min read",
    date: "Dec 12, 2026",
    img: minneriyaImg,
    paragraphs: [
      "A safari covering both Hurulu Eco Park and either Minneriya or Kaudulla National Parks offers a rich and varied wildlife experience, as all these parks are part of the 'Elephant Corridor' in Sri Lanka's North Central Province.",
      "The main highlight is the chance to see large herds of Asian elephants, especially during the dry season (July to October), when they migrate between the parks in search of food and water — often resulting in sightings of over 200 elephants in one place. Beyond elephants, you may encounter sambar deer, spotted deer, wild boar, toque macaques, grey langurs, and excellent birdwatching opportunities.",
      "Each park has its own charm — Minneriya is known for its ancient tank and open grasslands, Kaudulla features more forest cover, and Hurulu offers unique terrain. A combined safari increases your chances of wildlife sightings and offers a deeper appreciation of the region's natural diversity."
    ],
    tourPackages: [
      {
        name: "Full Day Safari (Hurulu + Minneriya/Kaudulla)",
        price: "$150.00",
        duration: "8 Hours (Split Session)",
        guests: "Max 6 Guests per Jeep",
        startTime: "6:00 AM",
        description: "An amazing full-day experience covering two parks! This safari covers both Hurulu Eco Park and either Minneriya or Kaudulla National Park. Follow the migrating herds of Asian elephants between the parks and increase your chances of seeing the spectacular gatherings. Each park has its own charm—Minneriya features ancient tanks and open grasslands, Kaudulla has more forest cover, and Hurulu offers unique terrain. A combined safari gives you the deepest appreciation of the region's natural diversity.",
        departureLocations: "Habarana Area (Pickup from Sigiriya, Dambulla, Kandalama Area with additional fee)",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Park Entrance Tickets (Both Parks)",
          "Park Service Fee & Jeep/Driver Entrance Fees",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles",
          "Sri Lankan King Coconut after safari"
        ],
        excluded: [
          "Tips for safari driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: ["Light-colored clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Tour Programme: 6:00 AM (Morning Safari) -> 10:00 AM (Rest at Hotel) -> 2:00 PM (Evening Safari) -> 6:00 PM (Drop-off)",
          "Optional Mid-day: Hiriwadunna Village Tour with Lunch available during the break.",
          "Best Period to Visit: July - October for the Gathering, or Dec-Jan to catch migrating herds.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day & next-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "dambulla-safari",
    title: "Dambulla Cultural & Safari Tour",
    subtitle: "Cave Temple, Economic Center & Evening Safari",
    tags: ["Culture", "Temple", "Wildlife"],
    readTime: "5 min read",
    date: "Jan 10, 2027",
    img: minneriyaImg,
    paragraphs: [
      "Located in the heart of Sri Lanka, Dambulla offers a unique blend of spiritual heritage and vibrant local life. The iconic Dambulla Rock Cave Temple, a UNESCO World Heritage Site, invites visitors to explore over 2,000 years of Buddhist history through its stunning cave shrines filled with ancient murals and statues.",
      "Just minutes away, the Dambulla Economic Center pulses with energy as one of the island's largest wholesale markets, where farmers, traders, and buyers converge day and night amidst colorful piles of fresh produce. Together, these two sites capture the essence of Dambulla — a place where sacred tradition and everyday life beautifully coexist.",
      "Following your cultural exploration, embark on an evening safari in Minneriya, Kaudulla, or Hurulu Eco Park. You'll likely see majestic herds of wild elephants grazing, bathing, or moving together through grasslands and forest. Each park offers a slightly different landscape, but all are rich in biodiversity and perfect for nature lovers."
    ],
    tourPackages: [
      {
        name: "Dambulla Tour & Evening Safari",
        price: "$110.00",
        duration: "9 - 10 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "8:00 AM - 9:00 AM",
        description: "A perfect 9-hour combination of Sri Lankan culture and wildlife. Start your morning exploring the ancient murals of the Dambulla Rock Cave Temple and the bustling Dambulla Economic Center. After a lunch break, you will head out for a thrilling evening safari at Minneriya, Kaudulla, or Hurulu Eco Park to witness the spectacular gatherings of wild elephants and diverse wildlife.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Dambulla Temple Entrance Tickets",
          "Safari Park Entrance Tickets",
          "Park Service Fee & Jeep/Driver Entrance Fee",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks"
        ],
        whatToBring: [
          "Temple Dress Code: Must cover knees & shoulders. No shorts/sleeveless.",
          "Passport",
          "Cap or hat & Sunscreen",
          "Drinking water",
          "Camera"
        ],
        additionalInfo: [
          "Tour Plan: 9:00 AM (Dambulla Temple & Econ Center) -> 12:30 PM (Lunch) -> 2:30 PM (Safari Tour) -> 6:00 PM (Return)",
          "Safari Park Selection: We will choose Minneriya, Kaudulla, or Eco Park based on where elephant sightings are best that day.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "hiriwadunna-village-tour",
    title: "Hiriwadunna Village Tour",
    subtitle: "Experience Authentic Sri Lankan Rural Life",
    tags: ["Culture", "Village Life", "Eco Tourism"],
    readTime: "4 min read",
    date: "Feb 22, 2027",
    img: huruluImg,
    paragraphs: [
      "A Habarana village tour offers an authentic glimpse into traditional Sri Lankan rural life, set amidst the scenic countryside of the island's cultural triangle. The tour provides a meaningful opportunity to connect with the local community, appreciate their warm hospitality, and understand age-old customs that have remained unchanged for generations.",
      "The experience typically includes a peaceful bullock cart ride through rustic village paths, giving you an authentic taste of rural life passing lush paddy fields and mud huts. Following this, you will enjoy a calm catamaran boat ride across a tranquil lake surrounded by lotus and water lilies.",
      "As part of the village safari, guests can take part in hands-on activities like grinding rice, weaving palm leaves, and observing a live cooking demonstration. The highlight is participating in preparing a simple, delicious Sri Lankan lunch cooked over a wood-fired clay stove, followed by a hearty traditional buffet lunch."
    ],
    tourPackages: [
      {
        name: "Hiriwadunna Village Safari",
        price: "$40.00",
        duration: "2 Hours 30 Minutes",
        guests: "Max 6 Guests",
        startTime: "8:00 AM",
        description: "Immerse yourself in traditional Sri Lankan village life. This tour includes a tuk-tuk pickup, a scenic bullock cart ride through paddy fields, and a serene catamaran boat ride across a lotus-filled lake. You will then arrive at a local village home for traditional activities, a cooking demonstration, and a freshly prepared authentic Sri Lankan buffet lunch cooked over a wood-fired clay stove.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Habarana, and Minneriya",
        included: [
          "Hotel Pickup & Drop-off (Tuk-Tuk / Safari Jeep)",
          "Driver Cum Guide",
          "Bullock Cart Ride Fee",
          "Catamaran Boat Ride Fee",
          "Authentic Sri Lankan Buffet Lunch",
          "Village Activities & Cooking Demo"
        ],
        excluded: [
          "Tips for driver & village locals (Recommended)"
        ],
        whatToBring: [
          "Cap or hat",
          "Sunscreen",
          "Drinking water",
          "Camera"
        ],
        additionalInfo: [
          "Tour Plan: Tuk-Tuk Pickup -> Bullock Cart Ride -> Catamaran Boat Ride -> Village Cooking Demo -> Buffet Lunch -> Tuk-Tuk Return.",
          "Children must be accompanied by an adult.",
          "Please include your Mobile/Local Contact number & Hotel pickup details in the booking.",
          "Not recommended for pregnant women or participants with heart complaints / serious medical conditions.",
          "For same-day & next-day bookings: Contact WhatsApp +94778902811"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "polonnaruwa-safari",
    title: "Polonnaruwa Ruins & Safari Tour",
    subtitle: "Medieval Capital & Evening Safari",
    tags: ["History", "UNESCO", "Wildlife"],
    readTime: "5 min read",
    date: "Mar 15, 2027",
    img: kaudullaImg,
    paragraphs: [
      "Step back in time as you explore the majestic ruins of Polonnaruwa, Sri Lanka's medieval capital and a UNESCO World Heritage Site. Once a thriving royal city in the 11th to 13th centuries, Polonnaruwa is a remarkable testament to the island's rich history, advanced engineering, and spiritual depth. Wander through ancient palaces, intricately carved temples, and giant Buddha statues that whisper stories of a grand civilization. From the sacred Gal Vihara to the imposing Royal Palace, each stone holds echoes of kings, monks, and artisans who shaped this cultural marvel.",
      "Following your historical exploration, you will embark on an evening safari in Minneriya, Kaudulla, or Hurulu Eco Park. You'll likely see majestic herds of wild elephants—sometimes in the hundreds—grazing, bathing, or moving together through grasslands and forest.",
      "These parks are part of an elephant corridor, so sightings depend on the season. Along with elephants, you may spot other wildlife such as deer, monkeys, peacocks, crocodiles, and a variety of birds, all set against beautiful backdrops of open plains, forests, and ancient water reservoirs. Each park offers a slightly different landscape and experience, but all are rich in biodiversity and perfect for nature lovers."
    ],
    tourPackages: [
      {
        name: "Polonnaruwa Ruins & Evening Safari",
        price: "$129.00",
        duration: "10 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "7:30 AM - 8:30 AM",
        description: "A comprehensive 10-hour tour blending ancient history with stunning wildlife. Start the morning with an exploration of the ancient medieval ruins of Polonnaruwa. After a buffet lunch, head into the wilderness for an evening safari at Minneriya, Kaudulla, or Hurulu Eco Park.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Visit to Polonnaruwa Ruins",
          "Safari Park Entrance Tickets",
          "Buffet Lunch",
          "Park Service Fee ($10) & Jeep/Driver Fees",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Polonnaruwa Ruins Entry Fee ($30 per person)",
          "Tips for driver & park ranger (Recommended)",
          "Additional Food & Drinks"
        ],
        whatToBring: [
          "Temple Dress Code: Must cover knees & shoulders. No shorts/sleeveless.",
          "Passport",
          "Cap or hat & Sunscreen",
          "Drinking water",
          "Camera"
        ],
        additionalInfo: [
          "Tour Plan: 9:00 AM (Polonnaruwa Ruins) -> 12:30 PM (Lunch) -> 2:30 PM (Safari Tour) -> 6:00 PM (Return)",
          "Safari Park Selection: We will choose Minneriya, Kaudulla, or Eco Park based on where elephant sightings are best that day.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "sigiriya-pidurangala-safari",
    title: "Sigiriya / Pidurangala & Safari Tour",
    subtitle: "Majestic Rock Hiking & Evening Safari",
    tags: ["Hiking", "Landmark", "Wildlife"],
    readTime: "5 min read",
    date: "Apr 2, 2027",
    img: kaudullaImg,
    paragraphs: [
      "Climbing Sigiriya offers a majestic experience as you ascend the iconic Lion Rock fortress, with its ancient frescoes, mirror wall, royal gardens, and panoramic views from the top—alongside rich history as a 5th-century palace and UNESCO site. In contrast, Pidurangala is a more natural, less crowded hike with a bit of rock scrambling at the end, but rewards you with stunning sunrise or sunset views—including a perfect view of Sigiriya itself.",
      "Sigiriya is best for history and archaeology lovers, while Pidurangala is ideal for budget travelers, photographers, and hikers seeking a peaceful atmosphere and incredible scenery.",
      "Following your hike, embark on an evening safari in Minneriya, Kaudulla, or Hurulu Eco Park. You'll likely see majestic herds of wild elephants grazing, bathing, or moving together through grasslands and forest. Each park offers a slightly different landscape, but all are rich in biodiversity and perfect for nature lovers."
    ],
    tourPackages: [
      {
        name: "Sigiriya or Pidurangala & Evening Safari",
        price: "$120.00",
        duration: "9 - 10 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "Flex: 4:30 AM (Sunrise) or 7:30/8:30 AM",
        description: "A perfect blend of active hiking and serene wildlife observation. Start the day scaling either the famous Sigiriya Lion Rock fortress or the rugged Pidurangala rock for stunning views. After a lunch break, head out for a thrilling evening safari at Minneriya, Kaudulla, or Hurulu Eco Park to witness the spectacular gatherings of wild elephants and diverse wildlife.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Pidurangala or Sigiriya hiking transport",
          "Safari Park Entrance Tickets",
          "Park Service Fee ($10) & Jeep/Driver Fees",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Sigiriya Entrance Tickets ($35 per person)",
          "Tips for driver & park ranger (Recommended)",
          "Food & Drinks & Lunch"
        ],
        whatToBring: [
          "Light-colored clothing",
          "Cap or hat & Sunscreen",
          "Drinking water",
          "Camera"
        ],
        additionalInfo: [
          "Tour Plan: 9:00 AM (Rock Hike) -> 12:30 PM (Lunch) -> 2:30 PM (Safari Tour) -> 6:00 PM (Return)",
          "Sunrise Option: Start at 4:30 AM if you prefer a cooler hike and a stunning sunrise.",
          "Safari Park Selection: We will choose Minneriya, Kaudulla, or Eco Park based on where elephant sightings are best that day.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  },
  {
    id: "sigiriya-village-tour",
    title: "Sigiriya Village Tour",
    subtitle: "Experience Authentic Sri Lankan Rural Life",
    tags: ["Culture", "Village Life", "Eco Tourism"],
    readTime: "4 min read",
    date: "May 10, 2027",
    img: huruluImg,
    paragraphs: [
      "A Sigiriya village tour offers an authentic glimpse into traditional Sri Lankan rural life, set amidst the scenic countryside of the island's cultural triangle. The tour provides a meaningful opportunity to connect with the local community, appreciate their warm hospitality, and understand age-old customs that have remained unchanged for generations.",
      "The experience typically includes a peaceful bullock cart ride through rustic village paths, giving you an authentic taste of rural life passing lush paddy fields and mud huts. Following this, you will enjoy a calm catamaran boat ride across a tranquil lake surrounded by lotus and water lilies.",
      "As part of the village safari, guests can take part in hands-on activities like grinding rice, weaving palm leaves, and observing a live cooking demonstration. The highlight is participating in preparing a simple, delicious Sri Lankan lunch cooked over a wood-fired clay stove, followed by a hearty traditional buffet lunch."
    ],
    tourPackages: [
      {
        name: "Sigiriya Village Safari",
        price: "$40.00",
        duration: "2 Hours 30 Minutes",
        guests: "Max 6 Guests",
        startTime: "8:30 AM - 2:00 PM",
        description: "Immerse yourself in traditional Sri Lankan village life near Sigiriya. This tour includes a tuk-tuk pickup, a scenic bullock cart ride through paddy fields, and a serene catamaran boat ride across a lotus-filled lake. You will then arrive at a local village home for traditional activities, a cooking demonstration, a local snack, and a freshly prepared authentic Sri Lankan buffet lunch cooked over a wood-fired clay stove.",
        departureLocations: "Hotels in Sigiriya / Habarana city area (Additional fee applies for Dambulla/Kandalama)",
        included: [
          "Hotel Pickup & Drop-off (Sigiriya area)",
          "Driver Cum Guide",
          "Bullock Cart Ride Fee",
          "Catamaran Boat Ride Fee",
          "Authentic Sri Lankan Buffet Lunch",
          "Snack at Village house",
          "Tuk-Tuk Ride",
          "Village House Activity"
        ],
        excluded: [
          "Tips for driver & village locals (Recommended)",
          "Additional Food & Drinks"
        ],
        whatToBring: [
          "Cap or hat",
          "Sunscreen",
          "Drinking water",
          "Camera"
        ],
        additionalInfo: [
          "Tour Plan: Tuk-Tuk Pickup -> Bullock Cart Ride -> Catamaran Boat Ride -> Village Cooking Demo & Snack -> Buffet Lunch -> Tuk-Tuk Return.",
          "Children must be accompanied by an adult.",
          "Please include your Mobile/Local Contact number & Hotel pickup details in the booking.",
          "Not recommended for pregnant women or participants with heart complaints / serious medical conditions.",
          "For same-day & next-day bookings: Contact WhatsApp +94778902811"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  }
];

export default function Blog() {
  const { theme } = useTheme();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [expandedPkg, setExpandedPkg] = useState({});

  const isDark = theme === "dark";

  const togglePkg = (sectionId, pkgIdx) => {
    const key = `${sectionId}-${pkgIdx}`;
    setExpandedPkg((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  return (
    <>
      <SEO
        title="Safari Tours & Travel Guides | Wild Jeep Safari"
        description="Explore our safari tours and travel guides for Minneriya, Kaudulla, Wasgamuwa, Hurulu Eco Park, and cultural tours across Sri Lanka."
      />

      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-neutral-950 text-neutral-100" : "bg-gray-50 text-neutral-900"
        }`}
      >
        {/* Top Navigation Bar */}
        <header
          className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
            isDark
              ? "bg-neutral-950/95 border-neutral-800"
              : "bg-white/95 border-neutral-200"
          } backdrop-blur-md`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-sacramento transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Content Layout with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex gap-8 lg:gap-12">
          {/* Sticky Sidebar — desktop only */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <p
                className={`text-[11px] font-bold uppercase tracking-widest mb-4 ${
                  isDark ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                Safari Tours
              </p>
              <nav className="space-y-0.5">
                {blogSections.map((s) => (
                  <a
                    key={`side-${s.id}`}
                    href={`#${s.id}`}
                    className={`block text-sm py-2 px-3 rounded-lg transition-all duration-200 ${
                      activeSection === s.id
                        ? "bg-sacramento/10 text-sacramento font-semibold border-l-2 border-sacramento"
                        : `${
                            isDark
                              ? "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50"
                              : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                          }`
                    }`}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
          {blogSections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={`scroll-mt-20 ${index > 0 ? "mt-16 sm:mt-20" : ""}`}
            >
              {/* Section Hero Card */}
              <div
                className={`rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border ${
                  isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"
                }`}
              >
                {/* Image with overlay */}
                <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden">
                  <img
                    src={section.img}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {section.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                      {section.title}
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 mt-1">{section.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-5 sm:p-8">
                  <div
                    className={`space-y-3 text-sm sm:text-base leading-relaxed ${
                      isDark ? "text-neutral-300" : "text-neutral-600"
                    }`}
                  >
                    {section.paragraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tour Package Cards */}
              {section.tourPackages && (
                <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                  <h3
                    className={`text-lg sm:text-xl font-bold flex items-center gap-2 px-1 ${
                      isDark ? "text-neutral-200" : "text-neutral-800"
                    }`}
                  >
                    <DollarSign size={20} className="text-sacramento" />
                    Available Packages ({section.tourPackages.length})
                  </h3>

                  {section.tourPackages.map((pkg, idx) => {
                    const isOpen = expandedPkg[`${section.id}-${idx}`];
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl sm:rounded-2xl border overflow-hidden transition-shadow duration-200 ${
                          isOpen ? "shadow-md" : "shadow-sm"
                        } ${
                          isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"
                        }`}
                      >
                        {/* Package summary row */}
                        <button
                          onClick={() => togglePkg(section.id, idx)}
                          className="w-full text-left p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 cursor-pointer group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                              <h4 className="text-base sm:text-lg font-bold truncate">
                                {pkg.name}
                              </h4>
                              <span className="text-lg sm:text-xl font-bold text-sacramento whitespace-nowrap">
                                {pkg.price}
                              </span>
                            </div>
                            <div
                              className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm ${
                                isDark ? "text-neutral-400" : "text-neutral-500"
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <Clock size={13} /> {pkg.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={13} /> {pkg.startTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={13} /> {pkg.guests}
                              </span>
                            </div>
                          </div>

                          {/* Desktop expand indicator */}
                          <div
                            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                              isOpen ? "text-sacramento" : isDark ? "text-neutral-500 group-hover:text-neutral-300" : "text-neutral-400 group-hover:text-neutral-600"
                            }`}
                          >
                            {isOpen ? "Hide Details" : "View Details"}
                            <ChevronLeft
                              size={14}
                              className={`transition-transform duration-200 ${isOpen ? "rotate-90" : "-rotate-90"}`}
                            />
                          </div>

                          {/* Mobile expand bar */}
                          <div
                            className={`sm:hidden text-center text-xs font-semibold py-2 rounded-lg ${
                              isOpen
                                ? "text-sacramento bg-sacramento/10"
                                : isDark
                                ? "text-neutral-400 bg-neutral-800"
                                : "text-neutral-500 bg-neutral-100"
                            }`}
                          >
                            {isOpen ? "▲ Hide Details" : "▼ View Details"}
                          </div>
                        </button>

                        {/* Expanded package details */}
                        {isOpen && (
                          <div
                            className={`border-t ${
                              isDark ? "border-neutral-800" : "border-neutral-100"
                            }`}
                          >
                            {/* Description */}
                            <div className="p-4 sm:p-6">
                              <p
                                className={`text-sm leading-relaxed ${
                                  isDark ? "text-neutral-300" : "text-neutral-600"
                                }`}
                              >
                                {pkg.description}
                              </p>
                            </div>

                            {/* Included / Excluded grid */}
                            <div
                              className={`grid grid-cols-1 md:grid-cols-2 border-t ${
                                isDark ? "border-neutral-800" : "border-neutral-100"
                              }`}
                            >
                              <div className="p-4 sm:p-6">
                                <h5 className="text-sm font-bold mb-3 flex items-center gap-2">
                                  <Check size={16} className="text-green-500" /> What's Included
                                </h5>
                                <ul className="space-y-2">
                                  {pkg.included.map((item, i) => (
                                    <li
                                      key={i}
                                      className={`text-sm flex items-start gap-2 ${
                                        isDark ? "text-neutral-300" : "text-neutral-600"
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div
                                className={`p-4 sm:p-6 border-t md:border-t-0 md:border-l ${
                                  isDark ? "border-neutral-800" : "border-neutral-100"
                                }`}
                              >
                                <h5 className="text-sm font-bold mb-3 flex items-center gap-2">
                                  <X size={16} className="text-red-400" /> What's Excluded
                                </h5>
                                <ul className="space-y-2">
                                  {pkg.excluded.map((item, i) => (
                                    <li
                                      key={i}
                                      className={`text-sm flex items-start gap-2 ${
                                        isDark ? "text-neutral-300" : "text-neutral-600"
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>

                                <div className="mt-5">
                                  <h5 className="text-sm font-bold mb-2">What to Bring</h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {pkg.whatToBring.map((item, i) => (
                                      <span
                                        key={i}
                                        className={`text-xs px-2.5 py-1 rounded-full ${
                                          isDark
                                            ? "bg-neutral-800 text-neutral-300"
                                            : "bg-neutral-100 text-neutral-600"
                                        }`}
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Info + Departure + Policy Link */}
                            <div
                              className={`p-4 sm:p-6 border-t space-y-4 ${
                                isDark ? "border-neutral-800" : "border-neutral-100"
                              }`}
                            >
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin size={16} className="text-sacramento mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-bold">Pickup: </span>
                                  <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                                    {pkg.departureLocations}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                                  <Info size={14} className="text-sacramento" /> Good to Know
                                </h5>
                                <ul className="space-y-1.5">
                                  {pkg.additionalInfo.map((info, i) => (
                                    <li
                                      key={i}
                                      className={`text-xs sm:text-sm flex items-start gap-2 ${
                                        isDark ? "text-neutral-400" : "text-neutral-500"
                                      }`}
                                    >
                                      <span className="text-sacramento mt-0.5 shrink-0">•</span>
                                      {info}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div
                                className={`text-xs rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 ${
                                  isDark ? "bg-neutral-800/50 text-neutral-400" : "bg-neutral-50 text-neutral-500"
                                }`}
                              >
                                <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>
                                  Looking for cancellation and refund terms?
                                </span>
                                <Link
                                  to="/return-refund-policy"
                                  className="font-bold text-sacramento hover:underline flex items-center gap-1"
                                >
                                  View Refund & Return Policy →
                                </Link>
                              </div>

                              {/* CTA Button */}
                              <div className="pt-2">
                                <Link
                                  to="/#packages"
                                  className="inline-flex items-center justify-center gap-2 bg-sacramento hover:bg-castleton text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200"
                                >
                                  Book a Safari
                                  <ArrowRight size={16} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          {/* Bottom CTA */}
          <div className="mt-16 sm:mt-20 text-center pb-8">
            <p className={`text-sm mb-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Can't find what you're looking for?
            </p>
            <Link
              to="/#packages"
              className="inline-flex items-center gap-2 bg-sacramento hover:bg-castleton text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all duration-200"
            >
              View All Packages
              <ArrowRight size={16} />
            </Link>
          </div>
        </main>
        </div>
      </div>
    </>
  );
}

