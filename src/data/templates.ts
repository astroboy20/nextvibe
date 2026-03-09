import { Template } from "@/types/canvas";

export const birthday: Template[] = [
  {
    name: "Example Birthday",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742067907/nextvibe/templates/birthday/Mockup__3_v50mjd.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742066983/nextvibe/templates/birthday/1_20250310_231353_0000_hjghwp.png",
    category: "birthday",
    id: "birthday1",
  },
  {
    name: "Example Birthday",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742067814/nextvibe/templates/birthday/Mockup_agskws.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742067283/nextvibe/templates/birthday/3_20250310_231353_0002_hvnwjw.png",
    category: "birthday",
    id: "birthday2",
  },
  {
    name: "Example Birthday",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742067930/nextvibe/templates/birthday/Mockup__qzrjwn.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742067287/nextvibe/templates/birthday/34_20250311_003727_0000_lzp4n4.png",
    category: "birthday",
    id: "birthday3",
  },
  {
    name: "Example Birthday",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742067881/nextvibe/templates/birthday/Mockup__2_ovtrwg.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742067294/nextvibe/templates/birthday/7_20250310_231353_0006_igpsov.png",
    category: "birthday",
    id: "birthday4",
  },
  {
    name: "Example Birthday",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742067819/nextvibe/templates/birthday/Mockup__1_kcithy.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742067321/nextvibe/templates/birthday/20250311_005525_0000_dzs2si.png",
    category: "birthday",
    id: "birthday5",
  },
];

export const christianFestivities: Template[] = [
  {
    name: "Christian Festivities",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742497874/nextvibe/templates/christian-festivities/Mockup__1_t7b4n7.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742497755/nextvibe/templates/christian-festivities/20250310_234737_0001_tkak83.png",
    category: "christian-festivities",
    id: "christian-festivities1",
  },
  {
    name: "Christian Festivities",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742497874/nextvibe/templates/christian-festivities/Mockup__3_mz9jaj.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742497752/nextvibe/templates/christian-festivities/Easter_bunny_ayc1tl.png",
    category: "christian-festivities",
    id: "christian-festivities2",
  },
  {
    name: "Christian Festivities",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742497871/nextvibe/templates/christian-festivities/Mockup__2_ledxpa.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742497756/nextvibe/templates/christian-festivities/20250310_234737_0002_aykdrf.png",
    category: "christian-festivities",
    id: "christian-festivities3",
  },
  {
    name: "Christian Festivities",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742497870/nextvibe/templates/christian-festivities/Mockup__szsn7i.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742497754/nextvibe/templates/christian-festivities/20250310_234738_0003_cknwen.png",
    category: "christian-festivities",
    id: "christian-festivities4",
  },
  {
    name: "Christian Festivities",
    mock: "https://res.cloudinary.com/dwhg0s0hw/image/upload/w_200,q_20,f_auto/v1742497850/nextvibe/templates/christian-festivities/Mockup_murnon.png",
    frame:
      "https://res.cloudinary.com/dwhg0s0hw/image/upload/v1742497752/nextvibe/templates/christian-festivities/20250310_234737_0000_bgvzba.png",
    category: "christian-festivities",
    id: "christian-festivities5",
  },
];

// Fisher-Yates shuffle function
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]; // Create a copy to avoid mutating the original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
  }
  return shuffled;
};

export const allTemplates: Template[] = shuffleArray([
  ...birthday,
  ...christianFestivities,
]);
