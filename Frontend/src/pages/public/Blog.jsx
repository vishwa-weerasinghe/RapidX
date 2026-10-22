import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import SEO from "../../components/SEO";
import api from "../../axios";
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowRight, MapPin, Check, X, Users, DollarSign, Info, Camera, Compass, Sparkles } from "lucide-react";

import minneriyaImg from "../../assets/minneriya.jpg";
import kaudullaImg from "../../assets/kaudulla.jpg";
import wasgamuwaImg from "../../assets/wasgamuwa.jpg";
import huruluImg from "../../assets/hurulu.jpg";
import { STATIC_BLOGS } from "../../constants/staticBlogs";
import { getStaticBlogPackage } from "../../constants/staticBlogPackages";
import PublicHeader from "../../components/PublicHeader";

const blogSections = [
  {
    id: "minneriya",
    blogId: STATIC_BLOGS[0].blogId,
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
        name: "Minneriya Morning Safari",
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
        name: "Minneriya Evening Safari",
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
        name: "Minneriya Half Day Safari (Morning or Evening)",
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
    blogId: STATIC_BLOGS[1].blogId,
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
        name: "Kaudulla Morning Safari",
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
        name: "Kaudulla Evening Safari",
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
        name: "Kaudulla Half Day Safari (Morning or Evening)",
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
    blogId: STATIC_BLOGS[2].blogId,
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
    blogId: STATIC_BLOGS[3].blogId,
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
        price: "Adult $50 - $70 | Child $15",
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
      },
      {
        name: "Hurulu Eco Park Half Day Safari",
        price: "Adult $50 - $72.5 | Child $35",
        duration: "3.5 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "7:00 AM – 1:30 PM",
        description: "Meet your professional safari jeep driver from your hotel for your 3–3.5 hour morning jeep safari tour of Hurulu eco park. At Hurulu Eco Park, visitors can enjoy close-up sightings of Asian elephants, especially during the dry season when herds migrate from nearby parks like Minneriya and Kaudulla. The park's lush dry evergreen forest also shelters spotted deer, wild boar, toque macaques, sambar deer, and a variety of bird species such as peacocks, eagles, and kingfishers. While rarer, animals like sloth bears and leopards may also be spotted. The safari offers a quieter, more intimate wildlife experience compared to the busier nearby parks. When your tour is complete, your vehicle will return you to your hotel or original departure point.",
        departureLocations: "Hotel in Habarana area (Pickup from Sigiriya, Dambulla, Kandalama Area with additional fee)",
        included: [
          "Comfortable Safari Jeep (Private)",
          "Experienced & professional driver",
          "Park Entrance Ticket",
          "Park Service Fee $10",
          "Jeep & Driver Entrance fee",
          "Government tax rate 18%",
          "Hotel pickup & drop-off",
          "Binoculars",
          "Water bottles"
        ],
        excluded: [
          "Tips for safari driver & park ranger (recommended)",
          "Food and drinks"
        ],
        whatToBring: ["Light color clothing", "Cap or hat", "Sunscreen", "Drinking water", "Camera"],
        additionalInfo: [
          "Best Period to Visit: Dry Season (May – September). Also January through June as migrating herds move here.",
          "Time are subject to change due to local traffic conditions. Hotel pickups start approximately 60-90 minutes prior to this time as per your hotel location. Contact our driver and verify your exact pickup time.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day & next-day bookings, please contact us via call or WhatsApp with exact pickup location at +94778902811",
          "Not recommended for participants with heart complaints or other serious medical conditions",
          "At some seasons, if there is a less number of elephants visible, we may change the tour to Kaudulla National Park or Minneriya National Park as an alternative without additional fee to give a better safari experience. (No refund for Safari Tour Changes)"
        ],
        cancellation: "20+ Days before departure: 15% fee, 15 Days before departure: 10% fee, 10 Days before departure: 40% fee, 8 Days before departure: 60% fee, 2 Days or less: 100% fee. Unusable features are non-refundable"
      }
    ]
  },
  {
    id: "full-day-safari",
    blogId: STATIC_BLOGS[4].blogId,
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
        price: "Adult $100 - $150 | Child $35",
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
          "Optional Mid-day: Village Tour with Lunch available during the break.",
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
    blogId: STATIC_BLOGS[5].blogId,
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
    blogId: STATIC_BLOGS[6].blogId,
    title: "Village Tour",
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
        name: "Village Tour",
        price: "Adult $30 - $40 | Child $20",
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
    blogId: STATIC_BLOGS[7].blogId,
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
    blogId: STATIC_BLOGS[8].blogId,
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
        name: "Sigiriya / Pidurangala & Evening Hurulu Eco Park Safari",
        price: "$110.00",
        duration: "9 - 10 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "Flex: 4:30 AM (Sunrise) or 7:30/8:30 AM",
        description: "A perfect combination of iconic rock hiking and an intimate wildlife experience at Hurulu Eco Park. Start your day ascending either the legendary Sigiriya Lion Rock fortress — a UNESCO World Heritage Site filled with ancient frescoes and royal gardens — or the rugged Pidurangala rock, which offers stunning panoramic views including a breathtaking perspective of Sigiriya itself. After a refreshing lunch break, head to Hurulu Eco Park, a UNESCO biosphere reserve and key elephant corridor. Here you'll witness herds of Asian elephants migrating through dense scrub forest, alongside wildlife such as spotted deer, toque macaques, peacocks, and a rich variety of birds. Hurulu offers a quieter, more intimate safari atmosphere compared to the larger parks.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Pidurangala or Sigiriya hiking transport",
          "Hurulu Eco Park Entrance Ticket",
          "Park Service Fee ($10) & Jeep/Driver Fees",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Sigiriya Entrance Tickets ($35 per person)",
          "Tips for driver & park ranger (Recommended)",
          "Food, Drinks & Lunch"
        ],
        whatToBring: [
          "Light-colored clothing",
          "Cap or hat & Sunscreen",
          "Drinking water",
          "Camera"
        ],
        additionalInfo: [
          "Tour Plan: 9:00 AM (Rock Hike) -> 12:30 PM (Lunch) -> 1:30 PM (Hurulu Safari) -> 5:00 PM (Return)",
          "Sunrise Option: Start at 4:30 AM if you prefer a cooler hike and a stunning sunrise.",
          "Best Period for Hurulu: Dec – June when elephant herds migrate here; also good May – Oct.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      },
      {
        name: "Sigiriya / Pidurangala & Evening Safari (Minneriya or Kaudulla)",
        price: "$120.00",
        duration: "9 - 10 Hours",
        guests: "Max 6 Guests per Jeep",
        startTime: "Flex: 4:30 AM (Sunrise) or 7:30/8:30 AM",
        description: "The ultimate adventure day — combine a thrilling rock hike with the spectacular elephant gathering at Minneriya or Kaudulla National Park. Scale either the iconic Sigiriya Lion Rock, with its breathtaking frescoes and panoramic views, or the dramatic Pidurangala rock overlooking Sigiriya. After lunch, head out for an evening safari at whichever park is best that day — Minneriya or Kaudulla. During the dry season (July–October), these parks host hundreds of wild Asian elephants congregating around ancient tanks in one of nature's most awe-inspiring spectacles. You may also spot sambar deer, wild boar, crocodiles, peacocks, and a rich variety of bird species.",
        departureLocations: "Hotels in Dambulla, Kandalama, Sigiriya, Minneriya, and Habarana",
        included: [
          "Private Safari Jeep Hire",
          "Experienced & Professional Driver",
          "Pidurangala or Sigiriya hiking transport",
          "Safari Park Entrance Tickets (Minneriya or Kaudulla)",
          "Park Service Fee ($10) & Jeep/Driver Fees",
          "Government Tax (18%)",
          "Hotel Pickup & Drop-off",
          "Binoculars & Water Bottles"
        ],
        excluded: [
          "Sigiriya Entrance Tickets ($35 per person)",
          "Tips for driver & park ranger (Recommended)",
          "Food, Drinks & Lunch"
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
          "Safari Park Selection: We will choose Minneriya or Kaudulla based on where elephant sightings are best that day.",
          "Best Period for Elephant Gathering: July – October. Peak months: August & September.",
          "Children Policy: Free for under 5 years | Child Rate for 5–11 years | Adult Rate for 12+ years",
          "For same-day bookings: Contact WhatsApp +94778902811",
          "Not recommended for pregnant women or participants with serious medical conditions"
        ],
        cancellation: "20+ days: 15% fee, 15+ days: 10% fee, 10+ days: 40% fee, 8+ days: 60% fee, 2 days or less: 100% fee. Unusable features are non-refundable."
      }
    ]
  }
];

function ModernBlogGallery({ photos, onPhotoClick, fallbackImg, isDark }) {
  const [mobileIndex, setMobileIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
        <img
          src={fallbackImg}
          alt="Safari destination"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Single Photo: Cinematic full-width presentation with subtle hover zoom
  if (photos.length === 1) {
    const photo = photos[0];
    return (
      <div
        onClick={() => onPhotoClick(photo, photos, 0)}
        className="group relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl cursor-pointer bg-neutral-900 shadow-xs border border-black/5 dark:border-white/5"
      >
        <img
          src={photo.file_path || photo.url}
          alt={photo.title || "Safari photo"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            if (fallbackImg) e.target.src = fallbackImg;
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/20 transition-all opacity-0 group-hover:opacity-100">
          <Camera size={13} className="text-[#29AB87]" />
          <span>View Fullscreen</span>
        </div>
      </div>
    );
  }

  // Multiple Photos:
  // Desktop: Airbnb-style Bento Mosaic Grid
  // Mobile: Touch-swipeable Carousel with arrows and dots
  const handlePrev = (e) => {
    e.stopPropagation();
    setMobileIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setMobileIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNext(e);
    } else if (diff < -45) {
      handlePrev(e);
    }
    setTouchStartX(null);
  };

  return (
    <div className="relative">
      {/* Desktop Bento Mosaic (md and up) */}
      <div className="hidden md:block">
        {photos.length === 2 && (
          <div className="grid grid-cols-2 gap-2.5 h-[340px] lg:h-[390px] rounded-2xl overflow-hidden">
            {photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                onClick={() => onPhotoClick(photo, photos, idx)}
                className="group relative h-full overflow-hidden cursor-pointer bg-neutral-900"
              >
                <img
                  src={photo.file_path || photo.url}
                  alt={photo.title || `Safari view ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    if (fallbackImg) e.target.src = fallbackImg;
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
              </div>
            ))}
          </div>
        )}

        {photos.length === 3 && (
          <div className="grid grid-cols-12 gap-2.5 h-[360px] lg:h-[420px] rounded-2xl overflow-hidden">
            {/* Main Featured Photo (Left 65%) */}
            <div
              onClick={() => onPhotoClick(photos[0], photos, 0)}
              className="col-span-8 group relative h-full overflow-hidden cursor-pointer bg-neutral-900"
            >
              <img
                src={photos[0].file_path || photos[0].url}
                alt={photos[0].title || "Main view"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  if (fallbackImg) e.target.src = fallbackImg;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>

            {/* Stack of 2 photos on the Right (35%) */}
            <div className="col-span-4 grid grid-rows-2 gap-2.5 h-full">
              {photos.slice(1, 3).map((photo, idx) => (
                <div
                  key={photo.id || idx + 1}
                  onClick={() => onPhotoClick(photo, photos, idx + 1)}
                  className="group relative h-full overflow-hidden cursor-pointer bg-neutral-900"
                >
                  <img
                    src={photo.file_path || photo.url}
                    alt={photo.title || `Safari view ${idx + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      if (fallbackImg) e.target.src = fallbackImg;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                  {idx === 1 && (
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 transition-transform group-hover:scale-105">
                      <Camera size={13} className="text-[#29AB87]" />
                      <span>{photos.length} Photos</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length >= 4 && (
          <div className="grid grid-cols-12 gap-2.5 h-[380px] lg:h-[440px] rounded-2xl overflow-hidden">
            {/* Main Featured Photo (Left 60%) */}
            <div
              onClick={() => onPhotoClick(photos[0], photos, 0)}
              className="col-span-7 group relative h-full overflow-hidden cursor-pointer bg-neutral-900"
            >
              <img
                src={photos[0].file_path || photos[0].url}
                alt={photos[0].title || "Main view"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  if (fallbackImg) e.target.src = fallbackImg;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>

            {/* 2x2 Grid of Photos on Right (40%) */}
            <div className="col-span-5 grid grid-cols-2 grid-rows-2 gap-2.5 h-full">
              {photos.slice(1, 5).map((photo, idx) => {
                const isLastSlot = idx === 3;
                const remaining = photos.length - 4;
                return (
                  <div
                    key={photo.id || idx + 1}
                    onClick={() => onPhotoClick(photo, photos, idx + 1)}
                    className="group relative h-full overflow-hidden cursor-pointer bg-neutral-900"
                  >
                    <img
                      src={photo.file_path || photo.url}
                      alt={photo.title || `Safari view ${idx + 2}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        if (fallbackImg) e.target.src = fallbackImg;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                    {isLastSlot && remaining > 0 && (
                      <div className="absolute inset-0 bg-black/60 hover:bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-all">
                        <Camera size={20} className="text-[#29AB87] mb-1" />
                        <span className="text-sm font-bold">+{remaining} More</span>
                      </div>
                    )}
                    {isLastSlot && remaining <= 0 && (
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 border border-white/20">
                        <Camera size={12} className="text-[#29AB87]" />
                        <span>{photos.length} Photos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Swipeable Carousel (sm and below) */}
      <div
        className="block md:hidden relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={photos[mobileIndex]?.file_path || photos[mobileIndex]?.url}
          alt={photos[mobileIndex]?.title || "Safari view"}
          onClick={() => onPhotoClick(photos[mobileIndex], photos, mobileIndex)}
          className="w-full h-full object-cover cursor-pointer"
          onError={(e) => {
            if (fallbackImg) e.target.src = fallbackImg;
          }}
        />

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/20">
          <Camera size={13} className="text-[#29AB87]" />
          <span>{mobileIndex + 1} / {photos.length}</span>
        </div>

        {/* Prev / Next Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-md cursor-pointer transition-transform active:scale-95"
          aria-label="Previous photo"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-md cursor-pointer transition-transform active:scale-95"
          aria-label="Next photo"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
          {photos.map((_, dotIdx) => (
            <div
              key={dotIdx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === mobileIndex
                  ? "w-5 bg-white shadow-xs"
                  : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Blog({ defaultPark }) {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const targetPark = defaultPark || (
    location.pathname.includes("minneriya")
      ? "minneriya"
      : location.pathname.includes("kaudulla")
      ? "kaudulla"
      : location.pathname.includes("hurulu")
      ? "hurulu"
      : location.pathname.includes("wasgamuwa")
      ? "wasgamuwa"
      : null
  );

  const [activeSection, setActiveSection] = useState(targetPark || "");
  const [expandedPkg, setExpandedPkg] = useState({});
  const [dbPackages, setDbPackages] = useState([]);

  const isDark = theme === "dark";

  const [dbMedia, setDbMedia] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxList, setLightboxList] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (photo, list, index = -1) => {
    let idx = index;
    if (idx < 0) {
      idx = list.findIndex(
        (p) =>
          (p.id && photo.id ? p.id === photo.id : false) ||
          (p.file_path || p.url) === (photo.file_path || photo.url)
      );
    }
    setLightboxList(list);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxPhoto(photo);
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
    setLightboxList([]);
    setLightboxIndex(0);
  };

  const handlePrevPhoto = (e) => {
    e?.stopPropagation();
    if (lightboxList.length <= 1) return;
    const nextIdx = (lightboxIndex - 1 + lightboxList.length) % lightboxList.length;
    setLightboxIndex(nextIdx);
    setLightboxPhoto(lightboxList[nextIdx]);
  };

  const handleNextPhoto = (e) => {
    e?.stopPropagation();
    if (lightboxList.length <= 1) return;
    const nextIdx = (lightboxIndex + 1) % lightboxList.length;
    setLightboxIndex(nextIdx);
    setLightboxPhoto(lightboxList[nextIdx]);
  };

  useEffect(() => {
    if (!lightboxPhoto) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPhoto, lightboxIndex, lightboxList]);

  useEffect(() => {
    api
      .get("/packages")
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setDbPackages(res.data);
        }
      })
      .catch((err) => console.error("Error loading packages in blog:", err));

    api
      .get("/media")
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setDbMedia(res.data);
        }
      })
      .catch((err) => console.error("Error loading media in blog:", err));
  }, []);

  const getDbPackage = (pkg) => {
    if (!dbPackages || dbPackages.length === 0) return null;

    const staticPkg = getStaticBlogPackage(pkg?.name);
    if (!staticPkg || !staticPkg.id) return null;

    // Strict ID match based on the unique blog_id assigned to this specific package in staticBlogPackages
    return dbPackages.find((p) => String(p.blog_id || p.blogId) === String(staticPkg.id)) || null;
  };

  const handleBookSafari = (pkg, section) => {
    let matchedId = null;
    const found = getDbPackage(pkg);
    
    if (found) {
      matchedId = found.Package_ID || found.id;
    }

    let recommendedTime = undefined;
    const lowerName = (pkg?.name || "").toLowerCase();
    if (lowerName.includes("morning")) {
      recommendedTime = "07:00";
    } else if (lowerName.includes("evening")) {
      recommendedTime = "13:00";
    }

    navigate("/booking", {
      state: {
        packageId: matchedId,
        packageName: pkg?.name,
        sectionId: section?.id,
        sectionTitle: section?.title,
        blogId: section?.blogId,
        pickupTime: recommendedTime,
      },
    });
  };

  const togglePkg = (sectionId, pkgIdx) => {
    const key = `${sectionId}-${pkgIdx}`;
    setExpandedPkg((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const parkToScroll = location.hash ? location.hash.replace("#", "") : targetPark;
    if (parkToScroll) {
      setActiveSection(parkToScroll);
      const element = document.getElementById(parkToScroll);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location, targetPark]);

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

  // Compute targeted SEO based on active or landing park
  const effectivePark = targetPark || activeSection;
  const seoDetails = (() => {
    if (effectivePark === "minneriya") {
      return {
        title: "Minneriya Jeep Safari - Morning & Evening Tours | Online Booking",
        description: "Book official Minneriya jeep safari in Sri Lanka. Experience the famous Minneriya Elephant Gathering with licensed local drivers, hotel pickup, & best rates.",
        keywords: "minneriya jeep safari, minneriya safari, minneriya national park safari booking, minneriya elephant gathering, sri lanka jeep safari",
        canonical: "https://www.minneriyawildjeepsafari.com/minneriya-safari"
      };
    }
    if (effectivePark === "kaudulla") {
      return {
        title: "Kaudulla Jeep Safari - Morning & Evening Tours | Online Booking",
        description: "Book the best Kaudulla jeep safari in Sri Lanka. Witness massive wild elephant herds at Kaudulla Tank with expert local guides & best price guaranteed.",
        keywords: "kaudulla jeep safari, kaudulla safari, kaudulla national park safari, kaudulla elephant gathering, sri lanka jeep safari",
        canonical: "https://www.minneriyawildjeepsafari.com/kaudulla-safari"
      };
    }
    if (effectivePark === "hurulu") {
      return {
        title: "Hurulu Eco Park Jeep Safari - Habarana Tours Sri Lanka",
        description: "Experience the thrilling Hurulu Eco Park jeep safari in Habarana, Sri Lanka. Year-round wild elephant corridor sightings with experienced local guides.",
        keywords: "hurulu eco park jeep safari, hurulu safari, habarana elephant safari, hurulu eco park safari sri lanka",
        canonical: "https://www.minneriyawildjeepsafari.com/hurulu-safari"
      };
    }
    if (effectivePark === "wasgamuwa") {
      return {
        title: "Wasgamuwa National Park Jeep Safari | Wildlife Tours Sri Lanka",
        description: "Discover Wasgamuwa National Park jeep safari with wild elephants and sloth bears in untouched nature. Private 4x4 safari jeep hire with local guides.",
        keywords: "wasgamuwa national park jeep safari, wasgamuwa safari, wasgamuwa jeep safari, sri lanka wildlife safari",
        canonical: "https://www.minneriyawildjeepsafari.com/wasgamuwa-safari"
      };
    }
    return {
      title: "Minneriya Jeep Safari & Sri Lanka National Park Guides | Online Booking",
      description: "Explore our safari tours and travel guides for Minneriya safari, Kaudulla safari, Wasgamuwa, Hurulu Eco Park, and cultural tours across Sri Lanka.",
      keywords: "minneriya jeep safari, kaudulla jeep safari, hurulu eco park safari, wasgamuwa safari, sri lanka safari booking",
      canonical: "https://www.minneriyawildjeepsafari.com/blog"
    };
  })();

  return (
    <>
      <SEO
        title={seoDetails.title}
        description={seoDetails.description}
        keywords={seoDetails.keywords}
        canonical={seoDetails.canonical}
      />

      <PublicHeader />

      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50/60 text-neutral-900"
        }`}
      >
        {/* Modern Blog Header Banner */}
        <div className="relative border-b border-neutral-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-sacramento/5 via-transparent to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-8 sm:pt-40 sm:pb-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sacramento/10 text-sacramento border border-sacramento/20">
                <Compass size={14} /> Expedition Guides & Wildlife Stories
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
                Sri Lanka Safari Guides & National Parks
              </h1>
              <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Explore in-depth park guides, elephant gathering schedules, wildlife insights, and reserve your certified jeep safari directly.
              </p>
            </div>

            {/* Quick-Jump Navigation Bar (Scrollable on mobile) */}
            <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 hidden sm:inline">
                Jump to:
              </span>
              {blogSections.map((s) => (
                <a
                  key={`pill-${s.id}`}
                  href={`#${s.id}`}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                    activeSection === s.id
                      ? "bg-sacramento text-white shadow-sm"
                      : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {s.title.replace(" National Park", "").replace(" Experience", "")}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Layout with Sticky Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex gap-8 lg:gap-12">
          {/* Sticky Sidebar — desktop only */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-neutral-900/80 border-neutral-800" : "bg-white border-neutral-200"} shadow-xs backdrop-blur-md`}>
                <p
                  className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${
                    isDark ? "text-neutral-500" : "text-neutral-400"
                  }`}
                >
                  Safari Destinations
                </p>
                <nav className="space-y-1">
                  {blogSections.map((s) => (
                    <a
                      key={`side-${s.id}`}
                      href={`#${s.id}`}
                      className={`block text-xs py-2 px-3 rounded-xl transition-all duration-200 ${
                        activeSection === s.id
                          ? "bg-sacramento text-white font-bold shadow-xs"
                          : `${
                              isDark
                                ? "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                            }`
                      }`}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Sidebar Quick Inquire Card */}
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-neutral-900/60 border-neutral-800" : "bg-white border-neutral-200"} text-center`}>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Need Custom Safari Advice?</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Our wildlife safari guides are available 24/7 on WhatsApp.</p>
                <a
                  href="https://wa.me/94778902811?text=Hello!%20I%20need%20assistance%20choosing%20the%20best%20safari%20package."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Chat with Guide 💬
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {blogSections.map((section, index) => {
              const sectionMedia = dbMedia.filter(
                (m) => String(m.blog_id) === String(section.blogId)
              );
              const allPhotos =
                sectionMedia.length > 0
                  ? sectionMedia
                  : [
                      {
                        id: `static-${section.id}`,
                        file_path: section.img,
                        title: section.title,
                        description: section.subtitle,
                      },
                    ];

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={`scroll-mt-24 ${index > 0 ? "mt-16 sm:mt-24" : ""}`}
                >
                  {/* Section Hero Card */}
                  <div
                    className={`rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border ${
                      isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200/90 bg-white"
                    }`}
                  >
                    {/* Destination Header with Title & Tags */}
                    <div className="p-5 sm:p-8 pb-4 sm:pb-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {section.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full ${
                                isDark
                                  ? "bg-sacramento/15 text-[#38d39f] border border-sacramento/20"
                                  : "bg-sacramento/10 text-sacramento border border-sacramento/15"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {section.readTime && (
                          <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                            <Clock size={13} /> {section.readTime}
                          </span>
                        )}
                      </div>

                      <h2
                        className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight ${
                          isDark ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {section.title}
                      </h2>
                      <p
                        className={`text-sm sm:text-base mt-1 font-medium ${
                          isDark ? "text-neutral-400" : "text-neutral-600"
                        }`}
                      >
                        {section.subtitle}
                      </p>
                    </div>

                    {/* Integrated Modern Photo Showcase (Bento on Desktop, Carousel on Mobile) */}
                    <div className="px-5 sm:px-8 pb-2">
                      <ModernBlogGallery
                        photos={allPhotos}
                        fallbackImg={section.img}
                        onPhotoClick={openLightbox}
                        isDark={isDark}
                      />
                    </div>

                    {/* Description Paragraphs */}
                    <div className="p-5 sm:p-8">
                      <div
                        className={`space-y-4 text-sm sm:text-base leading-relaxed ${
                          isDark ? "text-neutral-300" : "text-neutral-700"
                        }`}
                      >
                        {section.paragraphs.map((para, i) => (
                          <p
                            key={i}
                            className={i === 0 ? "text-base sm:text-lg font-medium leading-relaxed text-neutral-800 dark:text-neutral-200" : ""}
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tour Package Cards */}
                  {(() => {
                    const availablePackages = section.tourPackages || [];
                    
                    return availablePackages.length > 0 && (
                      <div className="mt-6 sm:mt-8 space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <h3
                            className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                              isDark ? "text-neutral-200" : "text-neutral-800"
                            }`}
                          >
                            <DollarSign size={18} className="text-sacramento" />
                            Available Safari Packages ({availablePackages.length})
                          </h3>
                        </div>

                        {availablePackages.map((pkg, idx) => {
                          const isOpen = expandedPkg[`${section.id}-${idx}`];
                          return (
                            <div
                              key={idx}
                              className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                              isOpen
                                ? "shadow-md ring-1 ring-sacramento/30"
                                : "shadow-xs hover:border-sacramento/40"
                            } ${isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"}`}
                          >
                            {/* Package summary row */}
                            <div
                              onClick={() => togglePkg(section.id, idx)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  togglePkg(section.id, idx);
                                }
                              }}
                              className="w-full text-left p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 cursor-pointer group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                                  <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                                    {pkg.name}
                                  </h4>
                                  {(() => {
                                    const dbPkg = getDbPackage(pkg);
                                    let priceDisplay = null;
                                    
                                    if (dbPkg && (dbPkg.price_one_adult || dbPkg.price_more_adult || dbPkg.price_child)) {
                                      let adultsDisplay = "";
                                      if (dbPkg.price_one_adult && dbPkg.price_more_adult && Number(dbPkg.price_one_adult) !== Number(dbPkg.price_more_adult)) {
                                        const minAdult = Math.min(Number(dbPkg.price_one_adult), Number(dbPkg.price_more_adult));
                                        const maxAdult = Math.max(Number(dbPkg.price_one_adult), Number(dbPkg.price_more_adult));
                                        adultsDisplay = `$${minAdult} - $${maxAdult}`;
                                      } else if (dbPkg.price_one_adult || dbPkg.price_more_adult) {
                                        adultsDisplay = `$${dbPkg.price_one_adult || dbPkg.price_more_adult}`;
                                      }

                                      const child = dbPkg.price_child;
                                      
                                      if (adultsDisplay && child) {
                                        priceDisplay = `Adult ${adultsDisplay} | Child $${child}`;
                                      } else if (adultsDisplay) {
                                        priceDisplay = `Adult ${adultsDisplay}`;
                                      } else if (child) {
                                        priceDisplay = `Child $${child}`;
                                      }
                                    }

                                    if (!priceDisplay) return null;

                                    return priceDisplay.includes("|") ? (
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        {priceDisplay.split("|").map((pPart, i) => (
                                          <span
                                            key={i}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sacramento/10 text-sacramento text-xs sm:text-sm font-bold border border-sacramento/20 whitespace-nowrap"
                                          >
                                            {pPart.trim()}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-sacramento/10 text-sacramento text-xs sm:text-sm font-bold border border-sacramento/20 whitespace-nowrap">
                                        {priceDisplay}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <div
                                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${
                                    isDark ? "text-neutral-400" : "text-neutral-500"
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <Clock size={13} className="text-sacramento" /> {pkg.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={13} className="text-sacramento" /> {pkg.startTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users size={13} className="text-sacramento" /> {pkg.guests}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookSafari(pkg, section);
                                  }}
                                  className="inline-flex items-center gap-1.5 bg-sacramento hover:bg-castleton text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                  Book Safari
                                  <ArrowRight size={14} />
                                </button>

                                <div
                                  className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                                    isOpen
                                      ? "text-sacramento"
                                      : isDark
                                      ? "text-neutral-400 group-hover:text-neutral-200"
                                      : "text-neutral-500 group-hover:text-neutral-800"
                                  }`}
                                >
                                  <span>{isOpen ? "Hide" : "Details"}</span>
                                  <ChevronLeft
                                    size={14}
                                    className={`transition-transform duration-200 ${
                                      isOpen ? "rotate-90" : "-rotate-90"
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Expanded package details (100% of all information preserved) */}
                            {isOpen && (
                              <div
                                className={`border-t ${
                                  isDark ? "border-neutral-800 bg-neutral-900/40" : "border-neutral-100 bg-neutral-50/40"
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

                                {/* Included / Excluded comparison grid */}
                                <div
                                  className={`grid grid-cols-1 md:grid-cols-2 border-t ${
                                    isDark ? "border-neutral-800" : "border-neutral-100"
                                  }`}
                                >
                                  <div className="p-4 sm:p-6">
                                    <h5 className="text-sm font-bold mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                                      <Check size={16} className="text-green-500" /> What's Included
                                    </h5>
                                    <ul className="space-y-2">
                                      {pkg.included.map((item, i) => (
                                        <li
                                          key={i}
                                          className={`text-xs sm:text-sm flex items-start gap-2 ${
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
                                    <h5 className="text-sm font-bold mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                                      <X size={16} className="text-red-400" /> What's Excluded
                                    </h5>
                                    <ul className="space-y-2">
                                      {pkg.excluded.map((item, i) => (
                                        <li
                                          key={i}
                                          className={`text-xs sm:text-sm flex items-start gap-2 ${
                                            isDark ? "text-neutral-300" : "text-neutral-600"
                                          }`}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>

                                    <div className="mt-5">
                                      <h5 className="text-sm font-bold mb-2 text-neutral-900 dark:text-white">What to Bring</h5>
                                      <div className="flex flex-wrap gap-1.5">
                                        {pkg.whatToBring.map((item, i) => (
                                          <span
                                            key={i}
                                            className={`text-xs px-2.5 py-1 rounded-full ${
                                              isDark
                                                ? "bg-neutral-800 text-neutral-300"
                                                : "bg-white text-neutral-600 border border-neutral-200"
                                            }`}
                                          >
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional Info + Departure + Cancellation */}
                                <div
                                  className={`p-4 sm:p-6 border-t space-y-4 ${
                                    isDark ? "border-neutral-800" : "border-neutral-100"
                                  }`}
                                >
                                  <div className="flex items-start gap-2 text-sm">
                                    <MapPin size={16} className="text-sacramento mt-0.5 shrink-0" />
                                    <div>
                                      <span className="font-bold text-neutral-900 dark:text-white">Pickup Locations: </span>
                                      <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                                        {pkg.departureLocations}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="text-sm font-bold mb-2 flex items-center gap-1.5 text-neutral-900 dark:text-white">
                                      <Info size={14} className="text-sacramento" /> Good to Know & Policies
                                    </h5>
                                    <ul className="space-y-1.5">
                                      {pkg.additionalInfo.map((info, i) => {
                                        const isWhatsApp = info.toLowerCase().includes("whatsapp");
                                        return (
                                          <li
                                            key={i}
                                            className={`text-xs sm:text-sm flex items-start gap-2 ${
                                              isDark ? "text-neutral-400" : "text-neutral-600"
                                            }`}
                                          >
                                            <span className="text-sacramento mt-0.5 shrink-0">•</span>
                                            {isWhatsApp ? (
                                              <a
                                                href={`https://wa.me/94778902811?text=${encodeURIComponent(
                                                  `Hello! I would like to inquire about same-day/next-day booking for ${pkg.name} (${section.title}). Are jeeps available?`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-emerald-600 hover:text-emerald-700 font-semibold underline inline-flex items-center gap-1 transition-colors"
                                              >
                                                {info} 💬
                                              </a>
                                            ) : (
                                              info
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>

                                  {pkg.cancellation && (
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/40 p-3 rounded-xl">
                                      <span className="font-bold text-neutral-700 dark:text-neutral-300">Cancellation Terms: </span>
                                      {pkg.cancellation}
                                    </div>
                                  )}

                                  <div
                                    className={`text-xs rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 ${
                                      isDark ? "bg-neutral-800/50 text-neutral-400" : "bg-neutral-100 text-neutral-600"
                                    }`}
                                  >
                                    <span>Looking for cancellation and refund terms?</span>
                                    <Link
                                      to="/return-refund-policy"
                                      className="font-bold text-sacramento hover:underline flex items-center gap-1"
                                    >
                                      View Refund & Return Policy →
                                    </Link>
                                  </div>

                                  {/* CTA Buttons */}
                                  <div className="pt-2 flex flex-wrap items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleBookSafari(pkg, section)}
                                      className="inline-flex items-center justify-center gap-2 bg-sacramento hover:bg-castleton text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                      Book Safari Now
                                      <ArrowRight size={16} />
                                    </button>

                                    <a
                                      href={`https://wa.me/94778902811?text=${encodeURIComponent(
                                        `Hello! I would like to inquire about the "${pkg.name}" tour at ${section.title}. Could you please provide availability and details?`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                      </svg>
                                      Inquire via WhatsApp
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                  })()}
                </section>
              );
            })}

            {/* Bottom CTA */}
            <div className="mt-16 sm:mt-24 text-center pb-8">
              <p className={`text-sm mb-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Looking for customized itineraries or other safari destinations?
              </p>
              <Link
                to="/#packages"
                className="inline-flex items-center gap-2 bg-sacramento hover:bg-castleton text-white text-sm font-bold px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                Explore All Safari Packages
                <ArrowRight size={16} />
              </Link>
            </div>
          </main>
        </div>
      </div>
      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-12 right-0 sm:right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
              aria-label="Close photo preview"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {lightboxList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 text-white bg-black/60 hover:bg-black/80 sm:bg-white/10 sm:hover:bg-white/20 rounded-full transition cursor-pointer z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 text-white bg-black/60 hover:bg-black/80 sm:bg-white/10 sm:hover:bg-white/20 rounded-full transition cursor-pointer z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Large Image */}
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
              <img
                src={lightboxPhoto.file_path || lightboxPhoto.url}
                alt={lightboxPhoto.title || "Safari Photo"}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Photo details */}
            <div className="mt-4 text-center text-white max-w-2xl px-4">
              <h4 className="text-base sm:text-lg font-bold">
                {lightboxPhoto.title || "Safari Wildlife Photo"}
              </h4>
              {lightboxPhoto.description && (
                <p className="text-xs sm:text-sm text-white/80 mt-1">
                  {lightboxPhoto.description}
                </p>
              )}
              {lightboxList.length > 1 && (
                <p className="text-xs text-white/50 mt-1 font-mono">
                  {lightboxIndex + 1} of {lightboxList.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

